import React, { ReactNode } from "react";
import { OverlayInjectedProps } from "react-bootstrap/Overlay";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { FormattedMessage } from "react-intl";
import { Rnd } from "react-rnd";

import type { InstanceResponse } from "../../ApiClient/generatedcode/generated";
import InstanceClient from "../../ApiClient/InstanceClient";
import { TGSJobResponse } from "../../ApiClient/JobsClient";
import InternalError, { ErrorCode } from "../../ApiClient/models/InternalComms/InternalError";
import { StatusCode } from "../../ApiClient/models/InternalComms/InternalStatus";
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

    public async componentDidMount(): Promise<void> {
        JobsController.on("jobsLoaded", this.handleUpdate);
        await this.handleUpdate();
    }

    public componentWillUnmount(): void {
        JobsController.removeListener("jobsLoaded", this.handleUpdate);
    }

    public async handleUpdate(): Promise<void> {
        const instances: InstanceResponse[] = [];

        const response1 = await InstanceClient.listInstances({ pageSize: 100 });
        if (response1.code === StatusCode.ERROR) {
            this.addError(response1.error);
            return;
        } else {
            instances.push(...response1.payload.content);
        }
        for (let i = 2; i <= response1.payload.totalPages; i++) {
            const response2 = await InstanceClient.listInstances({ page: i, pageSize: 100 });
            if (response2.code === StatusCode.ERROR) {
                this.addError(response2.error);
                return;
            } else {
                instances.push(...response2.payload.content);
            }
        }

        const instanceMap = new Map<number, InstanceResponse>();
        instances.forEach(instance => instanceMap.set(instance.id, instance));

        this.setState({
            jobs: JobsController.jobsByInstance,
            errors: JobsController.errors,
            loading: false,
            instances: instanceMap
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
                    pointerEvents: "none"
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
                {this.state.errors.map((error, index) => {
                    return (
                        <div key={index} style={{ maxWidth: this.props.widget ? 350 : "unset" }}>
                            <ErrorAlert error={error} />
                        </div>
                    );
                })}
                {Array.from(this.state.jobs)
                    .sort((a, b) => a[0] - b[0])
                    .map(([instanceid, jobMap]) => {
                        const renderTooltip = (instanceid: number) => {
                            return (props: OverlayInjectedProps) => (
                                <Tooltip id={`tooltip-instance-${instanceid}`} {...props}>
                                    {instanceid}
                                </Tooltip>
                            );
                        };

                        return (
                            <React.Fragment key={instanceid}>
                                <div className="bg-dark p-2 text-center">
                                    <OverlayTrigger overlay={renderTooltip(instanceid)}>
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
                                {Array.from(jobMap, ([, job]) => job)
                                    .sort((a, b) => b.id - a.id)
                                    .map(job => (
                                        <JobCard
                                            job={job}
                                            width={this.props.width}
                                            key={job.id}
                                            onClose={this.onClose}
                                            onCancel={this.onCancel}
                                        />
                                    ))}
                            </React.Fragment>
                        );
                    })}
            </div>
        );
    }
}
