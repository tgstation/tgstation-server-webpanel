import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { ReactNode } from "react";
import { Button, Card } from "react-bootstrap";
import { OverlayInjectedProps } from "react-bootstrap/Overlay";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { FormattedMessage } from "react-intl";
import { Rnd } from "react-rnd";

import type { InstanceResponse } from "../../ApiClient/generatedcode/generated";
import { TGSJobResponse } from "../../ApiClient/JobsClient";
import InternalError, { ErrorCode } from "../../ApiClient/models/InternalComms/InternalError";
import configOptions, { jobsWidgetOptions } from "../../ApiClient/util/config";
import JobsController from "../../ApiClient/util/JobsController";
import ErrorAlert from "./ErrorAlert";
import JobCard from "./JobCard";
import Loading from "./Loading";

interface IProps {
    width?: string;
    widget: boolean;
}

interface IState {
    jobs: Map<number, Map<number, TGSJobResponse>>;
    errors: InternalError<ErrorCode>[];
    nextRetrySeconds: number | null;
    ownerrors: Array<InternalError<ErrorCode> | undefined>;
    loading: boolean;
    instances: Map<number, InstanceResponse>;
}

export default class JobsList extends React.Component<IProps, IState> {
    public static defaultProps = {
        widget: true
    };

    private widgetRef = React.createRef<HTMLDivElement>();

    public constructor(props: IProps) {
        super(props);

        this.handleUpdate = this.handleUpdate.bind(this);
        this.onCancel = this.onCancel.bind(this);
        this.onClose = this.onClose.bind(this);

        this.state = {
            jobs: JobsController.jobsByInstance,
            errors: [],
            nextRetrySeconds: null,
            ownerrors: [],
            loading: true,
            instances: new Map<number, InstanceResponse>()
        };
    }

    private addError(error: InternalError<ErrorCode>): void {
        this.setState(prevState => {
            const ownerrors = Array.from(prevState.ownerrors);
            ownerrors.push(error);
            if (this.widgetRef.current) {
                this.widgetRef.current.scrollTop = 0;
            }
            return {
                ownerrors
            };
        });
    }

    public componentDidMount(): void {
        JobsController.on("jobsLoaded", this.handleUpdate);
        this.handleUpdate();
    }

    public componentWillUnmount(): void {
        JobsController.removeListener("jobsLoaded", this.handleUpdate);
    }

    private currentTimeout?: NodeJS.Timeout | null;

    public handleUpdate(): void {
        if (this.currentTimeout) {
            clearTimeout(this.currentTimeout);
            this.currentTimeout = null;
        }

        let nextRetrySeconds;
        if (JobsController.nextRetry) {
            if (JobsController.nextRetry.getSeconds() > new Date().getSeconds()) {
                nextRetrySeconds = JobsController.nextRetry.getSeconds() - new Date().getSeconds();
            } else {
                nextRetrySeconds = 0;
            }
            this.currentTimeout = setTimeout(() => this.handleUpdate(), 1000);
        } else {
            nextRetrySeconds = null;
        }

        this.setState({
            jobs: JobsController.jobsByInstance,
            errors: JobsController.errors,
            nextRetrySeconds,
            loading: false,
            instances: JobsController.accessibleInstances
        });
    }

    private async onCancel(job: TGSJobResponse) {
        const status = await JobsController.cancelJob(job.id, error => this.addError(error));

        if (!status) {
            return;
        }
        JobsController.fastmode = 5;
    }

    private onClose(job: TGSJobResponse) {
        JobsController.clearJob(job.id);
    }

    public render(): ReactNode {
        if (!this.props.widget) return this.nested();

        let totalJobs = 0;
        for (const job of this.state.jobs.values()) {
            totalJobs += job.size;
        }

        let display: boolean;
        if (configOptions.jobswidgetdisplay.value === jobsWidgetOptions.NEVER) {
            display = false;
        } else if (configOptions.jobswidgetdisplay.value === jobsWidgetOptions.ALWAYS) {
            display = true;
        } else {
            display = totalJobs > 0 || this.state.errors.length > 0;
        }

        return (
            <div
                style={{
                    position: "fixed",
                    top: 0,
                    bottom: 0,
                    right: 0,
                    left: 0,
                    pointerEvents: "none",
                    zIndex: 5
                }}>
                <Rnd
                    className={`jobswidget ${display ? "" : "invisible"}`}
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
                            Math.min(document.documentElement.clientWidth * 0.3, 350) -
                            20,
                        y:
                            document.documentElement.clientHeight -
                            document.documentElement.clientHeight * 0.5 -
                            20
                    }}
                    maxWidth={350}
                    minHeight={50}
                    minWidth={110}
                    bounds="parent">
                    <div className="fancyscroll overflow-auto h-100" ref={this.widgetRef}>
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
            <div className={this.props.widget ? "d-sm-block" : ""}>
                {this.state.loading ? <Loading text="loading.instance.jobs.list" /> : ""}
                {this.state.ownerrors.map((err, index) => {
                    if (!err) return;
                    return (
                        <ErrorAlert
                            key={index}
                            error={err}
                            onClose={() =>
                                this.setState(prev => {
                                    const newarr = Array.from(prev.ownerrors);
                                    newarr[index] = undefined;
                                    return {
                                        ownerrors: newarr
                                    };
                                })
                            }
                        />
                    );
                })}
                {this.state.errors.length > 0 ? (
                    <React.Fragment>
                        {this.state.errors.map((error, index) => {
                            return (
                                <div
                                    key={index}
                                    style={{ maxWidth: this.props.widget ? 350 : "unset" }}>
                                    <ErrorAlert error={error} />
                                </div>
                            );
                        })}
                        <Card>
                            {this.state.nextRetrySeconds === 0 ? (
                                <FormattedMessage id="view.instance.jobs.reconnect_now"></FormattedMessage>
                            ) : this.state.nextRetrySeconds != null ? (
                                <FormattedMessage
                                    id="view.instance.jobs.reconnect_in"
                                    values={{
                                        seconds: this.state.nextRetrySeconds
                                    }}></FormattedMessage>
                            ) : (
                                <FormattedMessage id="view.instance.jobs.reconnected_auth"></FormattedMessage>
                            )}
                        </Card>
                    </React.Fragment>
                ) : null}
                {Array.from(this.state.jobs)
                    .sort((a, b) => a[0] - b[0])
                    .map(([instanceid, jobMap]) => {
                        let xFinishedEnabled = false;
                        jobMap.forEach(job => {
                            if (job.stoppedAt) xFinishedEnabled = true;
                        });

                        const instanceHeaderStyle = xFinishedEnabled
                            ? { marginTop: "5px", marginLeft: "20px" }
                            : undefined;

                        return (
                            <React.Fragment key={instanceid}>
                                <div className="bg-dark p-2 row">
                                    <div className={`col-${xFinishedEnabled ? 9 : 12} text-center`}>
                                        <div style={instanceHeaderStyle}>
                                            <OverlayTrigger
                                                overlay={(props: OverlayInjectedProps) => (
                                                    <Tooltip
                                                        id={`tooltip-instance-${instanceid}`}
                                                        {...props}>
                                                        {instanceid}
                                                    </Tooltip>
                                                )}>
                                                <React.Fragment>
                                                    {this.state.instances.get(instanceid)?.name ??
                                                        "Unknown"}{" "}
                                                    (
                                                    <FormattedMessage
                                                        id="view.instance.jobs.jobtotal"
                                                        values={{ amount: jobMap.size }}
                                                    />
                                                    )
                                                </React.Fragment>
                                            </OverlayTrigger>
                                        </div>
                                    </div>
                                    {xFinishedEnabled ? (
                                        <div className="col-3 text-right">
                                            <OverlayTrigger
                                                placement="top"
                                                overlay={props => (
                                                    <Tooltip id="clear-instance-jobs" {...props}>
                                                        <FormattedMessage id="view.instance.jobs.clearfinished" />
                                                    </Tooltip>
                                                )}>
                                                <Button
                                                    variant="outline-secondary"
                                                    onClick={() =>
                                                        jobMap.forEach(job => {
                                                            if (job.stoppedAt)
                                                                JobsController.clearJob(job.id);
                                                        })
                                                    }
                                                    className="nowrap">
                                                    <FontAwesomeIcon icon={faTimes} />
                                                </Button>
                                            </OverlayTrigger>
                                        </div>
                                    ) : (
                                        <React.Fragment />
                                    )}
                                </div>
                                {Array.from(jobMap, ([, job]) => job)
                                    .sort((a, b) => b.id - a.id)
                                    .map(job => (
                                        <JobCard
                                            job={job}
                                            width={this.props.width}
                                            key={job.id}
                                            onClose={this.onClose}
                                            onCancel={e => void this.onCancel(e)}
                                        />
                                    ))}
                            </React.Fragment>
                        );
                    })}
            </div>
        );
    }
}
