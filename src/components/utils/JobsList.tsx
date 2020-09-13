import React, { ReactNode } from "react";
import JobsController from "../../ApiClient/util/JobsController";
import { StatusCode } from "../../ApiClient/models/InternalComms/InternalStatus";
import { AppCategories } from "../../utils/routes";
import JobsClient from "../../ApiClient/JobsClient";
import { Components } from "../../ApiClient/generatedcode/_generated";
import Toast from "react-bootstrap/Toast";
import ToastHeader from "react-bootstrap/ToastHeader";
import ToastBody from "react-bootstrap/ToastBody";
import { FormattedMessage } from "react-intl";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { timeSince } from "../../utils/misc";
import ProgressBar from "react-bootstrap/ProgressBar";
import InternalError, { ErrorCode } from "../../ApiClient/models/InternalComms/InternalError";
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
        return (
            <div
                className={this.props.corner ? "position-fixed d-none d-sm-block fancyscroll" : ""}
                style={
                    this.props.corner
                        ? { bottom: "1rem", right: "1rem", height: "50vh", overflow: "auto" }
                        : {}
                }>
                {this.state.errors.map((error, index) => {
                    return <ErrorAlert error={error} />;
                })}
                {Array.from(this.state.jobs, ([, job]) => job)
                    .sort((a, b) => b.id - a.id)
                    .map(job => {
                        const createddate = new Date(job.startedAt!);
                        const variant = job.exceptionDetails
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
