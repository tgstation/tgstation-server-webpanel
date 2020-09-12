import React, { ReactNode } from "react";
import JobsController from "../../ApiClient/util/JobsController";
import InternalStatus, { StatusCode } from "../../ApiClient/models/InternalComms/InternalStatus";
import { AppCategories } from "../../utils/routes";
import JobsClient, { getJobErrors } from "../../ApiClient/JobsClient";
import { Components } from "../../ApiClient/generatedcode/_generated";
import Toast from "react-bootstrap/Toast";
import ToastHeader from "react-bootstrap/ToastHeader";
import ToastBody from "react-bootstrap/ToastBody";
import { FormattedMessage } from "react-intl";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { timeSince } from "../../utils/misc";
import ProgressBar from "react-bootstrap/ProgressBar";

interface IProps {
    width?: string;
    corner: boolean;
}
interface IState {
    jobs: Components.Schemas.Job[];
}

export default class JobsList extends React.Component<IProps, IState> {
    public static defaultProps = {
        corner: true
    };
    public constructor(props: IProps) {
        super(props);

        this.handleUpdate = this.handleUpdate.bind(this);

        this.state = {
            jobs: []
        };
    }

    public componentDidMount(): void {
        if (JobsController.lastvalue) {
            //TODO: implement when its an error
            if (JobsController.lastvalue.code === StatusCode.OK) {
                this.setState({
                    jobs: JobsController.lastvalue.payload!
                });
            }
        }
        JobsController.on("jobsLoaded", this.handleUpdate);
    }

    public componentWillUnmount(): void {
        JobsController.removeListener("jobsLoaded", this.handleUpdate);
    }

    private async handleUpdate(
        jobs: InternalStatus<Components.Schemas.Job[], getJobErrors>
    ): Promise<void> {
        //alot of code to query each job and set its progress
        //TODO: implement when its an error
        if (jobs.code === StatusCode.OK) {
            const work: Array<Promise<void>> = [];
            for (const job of jobs.payload!) {
                if (AppCategories.instance.data?.instanceid === undefined) continue;
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
                jobs: jobs.payload!
            });
        }
    }

    public render(): ReactNode {
        return (
            <div
                className={this.props.corner ? "position-absolute d-none d-sm-block" : ""}
                style={this.props.corner ? { bottom: "1rem", right: "1rem" } : {}}>
                {this.state.jobs.map(job => {
                    const createddate = new Date(job.startedAt!);

                    return (
                        <Toast
                            key={job.id}
                            style={{
                                maxWidth: this.props.width
                            }}>
                            <ToastHeader closeButton={true}>
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
                                            ref={ref as React.Ref<HTMLSpanElement>}>{`${timeSince(
                                            createddate
                                        )} ago`}</span>
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
                                        className="mt-2"
                                        animated
                                        label={`${job.progress.toString()}%`}
                                        now={job.progress}
                                        striped
                                        variant="info"
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
