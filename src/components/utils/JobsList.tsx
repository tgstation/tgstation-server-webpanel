import React, { ReactNode } from "react";
import { FormattedMessage } from "react-intl";
import { Rnd } from "react-rnd";

import { Components } from "../../ApiClient/generatedcode/_generated";
import JobsClient, { getJobErrors } from "../../ApiClient/JobsClient";
import InternalError, { ErrorCode } from "../../ApiClient/models/InternalComms/InternalError";
import { StatusCode } from "../../ApiClient/models/InternalComms/InternalStatus";
import configOptions, { jobsWidgetOptions } from "../../ApiClient/util/config";
import JobsController from "../../ApiClient/util/JobsController";
import { AppCategories } from "../../utils/routes";
import ErrorAlert from "./ErrorAlert";
import JobCard from "./JobCard";

interface IProps {
    width?: string;
    widget: boolean;
}
interface IState {
    jobs: Map<number, Components.Schemas.Job>;
    errors: InternalError<ErrorCode>[];
}

export default class JobsList extends React.Component<IProps, IState> {
    public static defaultProps = {
        widget: true
    };
    public constructor(props: IProps) {
        super(props);

        this.handleUpdate = this.handleUpdate.bind(this);

        this.state = {
            jobs: JobsController.jobs,
            errors: JobsController.errors
        };
    }

    public componentDidMount(): void {
        JobsController.on("jobsLoaded", this.handleUpdate);
    }

    public componentWillUnmount(): void {
        JobsController.removeListener("jobsLoaded", this.handleUpdate);
    }

    private async handleUpdate(): Promise<void> {
        //shouldnt really occur in normal conditions but this is a safety anyways
        if (AppCategories.instance.data?.instanceid === undefined) return;

        //alot of code to query each job and set its progress
        const work: Array<Promise<void>> = [];
        const errors: InternalError<getJobErrors>[] = [];
        for (const job of JobsController.jobs.values()) {
            if (job.progress !== undefined) continue;

            work.push(
                JobsClient.getJob(
                    parseInt(AppCategories.instance.data.instanceid as string),
                    job.id
                ).then(progressedjob => {
                    if (progressedjob.code === StatusCode.OK) {
                        job.progress = progressedjob.payload!.progress;
                    } else {
                        errors.push(progressedjob.error!);
                    }
                })
            );
        }
        await Promise.all(work);

        this.setState({
            jobs: JobsController.jobs,
            //we cant concat directly as it would edit the array on the JobsController which other things may use
            errors: Array.from(JobsController.errors).concat(errors)
        });
    }

    public render(): ReactNode {
        if (AppCategories.instance.data?.instanceid === undefined) return "";

        if (!this.props.widget) return this.nested();
        return (
            <div
                style={{
                    position: "fixed",
                    top: 0,
                    bottom: 0,
                    right: 0,
                    left: 0,
                    pointerEvents: "none"
                }}>
                <Rnd
                    className={`jobswidget ${
                        //Ensure the option ISNT never, then either see if theres something to display(for auto) or if its just set to always in which case we display it
                        configOptions.jobswidgetdisplay.value !== jobsWidgetOptions.NEVER &&
                        (configOptions.jobswidgetdisplay.value === jobsWidgetOptions.ALWAYS ||
                            this.state.jobs.size ||
                            this.state.errors.length)
                            ? ""
                            : "d-none"
                    }`}
                    style={{
                        pointerEvents: "auto",
                        bottom: 0,
                        right: 0
                    }}
                    default={{
                        width: "30vw",
                        height: "50vh",
                        x:
                            document.documentElement.clientWidth -
                            Math.min(document.documentElement.clientWidth * 0.3, 350),
                        y:
                            document.documentElement.clientHeight -
                            document.documentElement.clientHeight * 0.5
                    }}
                    maxWidth={350}
                    minHeight={50}
                    minWidth={110}
                    bounds="parent">
                    <div className="fancyscroll overflow-auto h-100">
                        <h5 className="text-center text-darker font-weight-bold">
                            <FormattedMessage id="view.instance.jobs.title" />
                        </h5>
                        {this.nested()}
                    </div>
                </Rnd>
            </div>
        );
    }

    private nested(): ReactNode {
        return (
            <div className={this.props.widget ? "d-none d-sm-block" : ""}>
                {this.state.errors.map((error, index) => {
                    return (
                        <div key={index} style={{ maxWidth: this.props.widget ? 350 : "unset" }}>
                            <ErrorAlert error={error} />
                        </div>
                    );
                })}
                {Array.from(this.state.jobs, ([, job]) => job)
                    .sort((a, b) => b.id - a.id)
                    .map(job => (
                        <JobCard job={job} width={this.props.width} key={job.id} />
                    ))}
            </div>
        );
    }
}
