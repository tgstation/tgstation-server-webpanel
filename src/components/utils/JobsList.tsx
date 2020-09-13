import React, { ReactNode } from "react";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import ProgressBar from "react-bootstrap/ProgressBar";
import Toast from "react-bootstrap/Toast";
import ToastBody from "react-bootstrap/ToastBody";
import ToastHeader from "react-bootstrap/ToastHeader";
import Tooltip from "react-bootstrap/Tooltip";
import { FormattedMessage } from "react-intl";
import { Rnd } from "react-rnd";

import { Components } from "../../ApiClient/generatedcode/_generated";
import JobsClient from "../../ApiClient/JobsClient";
import InternalError, { ErrorCode } from "../../ApiClient/models/InternalComms/InternalError";
import { StatusCode } from "../../ApiClient/models/InternalComms/InternalStatus";
import JobsController from "../../ApiClient/util/JobsController";
import { timeSince } from "../../utils/misc";
import { AppCategories } from "../../utils/routes";
import ErrorAlert from "./ErrorAlert";

interface IProps {
    width?: string;
    corner: boolean;
}
interface IState {
    jobs: Map<number, Components.Schemas.Job>;
    errors: InternalError<ErrorCode>[];
}

export default class JobsList extends React.Component<IProps, IState> {
    public static defaultProps = {
        corner: true
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
        //TODO: implement when its an error
        const work: Array<Promise<void>> = [];
        for (const job of JobsController.jobs.values()) {
            if (job.progress !== undefined) continue;

            work.push(
                JobsClient.getJob(
                    parseInt(AppCategories.instance.data.instanceid as string),
                    job.id
                ).then(progressedjob => {
                    if (progressedjob.code === StatusCode.OK) {
                        job.progress = progressedjob.payload!.progress;
                    }
                })
            );
        }
        await Promise.all(work);

        this.setState({
            jobs: JobsController.jobs,
            errors: JobsController.errors
        });
    }

    public render(): ReactNode {
        if (AppCategories.instance.data?.instanceid === undefined) return "";

        if (!this.props.corner) return this.nested();
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
                    className="jobswidget"
                    style={{
                        pointerEvents: "auto",
                        bottom: 0,
                        right: 0
                    }}
                    default={{
                        width: "30vw",
                        height: "50vh",
                        x: 0,
                        y: window.innerHeight - window.innerHeight * 0.5
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
            <div className={this.props.corner ? "d-none d-sm-block" : ""}>
                {this.state.errors.map((error, index) => {
                    return (
                        <div key={index} style={{ maxWidth: this.props.corner ? 350 : "unset" }}>
                            <ErrorAlert error={error} />
                        </div>
                    );
                })}
                {Array.from(this.state.jobs, ([, job]) => job)
                    .sort((a, b) => b.id - a.id)
                    .map(job => {
                        const createddate = new Date(job.startedAt!);
                        const variant = job.errorCode
                            ? "danger"
                            : job.cancelled
                            ? "warning"
                            : job.stoppedAt
                            ? "success"
                            : "info";

                        return (
                            <Toast
                                key={job.id}
                                style={{
                                    maxWidth: this.props.width
                                }}
                                onClose={() => {
                                    void JobsController.cancelOrClear(job.id).catch(console.error);
                                }}>
                                <ToastHeader
                                    closeButton={variant !== "info"}
                                    className={`bg-${variant}`}>
                                    #{job.id}: {job.description}
                                </ToastHeader>
                                <ToastBody>
                                    <FormattedMessage id="app.job.started" />
                                    <OverlayTrigger
                                        overlay={
                                            <Tooltip id={`${job.id}-tooltip`}>
                                                {createddate.toLocaleString()}
                                            </Tooltip>
                                        }>
                                        {({ ref, ...triggerHandler }) => (
                                            <span
                                                {...triggerHandler}
                                                ref={
                                                    ref as React.Ref<HTMLSpanElement>
                                                }>{`${timeSince(createddate)} ago`}</span>
                                        )}
                                    </OverlayTrigger>
                                    <br />
                                    <FormattedMessage id="app.job.startedby" />
                                    <OverlayTrigger
                                        overlay={
                                            <Tooltip id={`${job.id}-tooltip-createdby`}>
                                                <FormattedMessage id="generic.userid" />
                                                {job.startedBy!.id}
                                            </Tooltip>
                                        }>
                                        {({ ref, ...triggerHandler }) => (
                                            <span
                                                ref={ref as React.Ref<HTMLSpanElement>}
                                                {...triggerHandler}>
                                                {job.startedBy!.name}
                                            </span>
                                        )}
                                    </OverlayTrigger>
                                    {job.progress !== undefined && job.progress !== null ? (
                                        <ProgressBar
                                            className="mt-2 text-black"
                                            animated={variant === "info"}
                                            label={`${job.progress.toString()}%`}
                                            now={job.progress}
                                            striped
                                            variant={variant}
                                        />
                                    ) : (
                                        ""
                                    )}
                                </ToastBody>
                            </Toast>
                        );
                    })}
            </div>
        );
    }
}
