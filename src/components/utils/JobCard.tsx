import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { ReactNode } from "react";
import Button from "react-bootstrap/Button";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import ProgressBar from "react-bootstrap/ProgressBar";
import Toast from "react-bootstrap/Toast";
import ToastBody from "react-bootstrap/ToastBody";
import ToastHeader from "react-bootstrap/ToastHeader";
import Tooltip from "react-bootstrap/Tooltip";
import { FormattedMessage, FormattedRelativeTime } from "react-intl";

import { ErrorCode as TGSErrorCode } from "../../ApiClient/generatedcode/_enums";
import { TGSJobResponse } from "../../ApiClient/JobsClient";

interface IState {}
interface IProps {
    job: TGSJobResponse;
    width?: string;
    onClose: (job: TGSJobResponse) => void;
    onCancel: (job: TGSJobResponse) => void;
}

export default class JobCard extends React.Component<IProps, IState> {
    public render(): ReactNode {
        const job = this.props.job;
        const createddate = new Date(job.startedAt);
        const createddiff = (createddate.getTime() - Date.now()) / 1000;
        const stoppeddate = new Date(job.stoppedAt ?? 0);
        const stoppeddiff = (stoppeddate.getTime() - Date.now()) / 1000;
        const variant =
            job.errorCode !== undefined || job.exceptionDetails !== undefined
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
                    this.props.onClose(job);
                }}>
                <ToastHeader closeButton={!!job.stoppedAt} className={`bg-${variant}`}>
                    #{job.id}: {job.description}
                </ToastHeader>
                <ToastBody>
                    {/*STARTED AT*/}
                    <FormattedMessage id="app.job.started" />
                    <OverlayTrigger
                        overlay={
                            <Tooltip id={`${job.id}-tooltip-started`}>
                                {createddate.toLocaleString()}
                            </Tooltip>
                        }>
                        {({ ref, ...triggerHandler }) => (
                            <span {...triggerHandler} ref={ref as React.Ref<HTMLSpanElement>}>
                                <FormattedRelativeTime
                                    value={createddiff}
                                    numeric="auto"
                                    updateIntervalInSeconds={1}
                                />
                            </span>
                        )}
                    </OverlayTrigger>
                    <br />
                    {/*CREATED BY*/}
                    <FormattedMessage id="app.job.startedby" />
                    <OverlayTrigger
                        overlay={
                            <Tooltip id={`${job.id}-tooltip-startedby`}>
                                <FormattedMessage id="generic.userid" />
                                {job.startedBy.id}
                            </Tooltip>
                        }>
                        {({ ref, ...triggerHandler }) => (
                            <span ref={ref as React.Ref<HTMLSpanElement>} {...triggerHandler}>
                                {job.startedBy.name}
                            </span>
                        )}
                    </OverlayTrigger>
                    <br />
                    <br />
                    {/*STOPPED AT*/}
                    {job.stoppedAt ? (
                        <React.Fragment>
                            <FormattedMessage id="app.job.stopped" />
                            <OverlayTrigger
                                overlay={
                                    <Tooltip id={`${job.id}-tooltip-stopped`}>
                                        {createddate.toLocaleString()}
                                    </Tooltip>
                                }>
                                {({ ref, ...triggerHandler }) => (
                                    <span
                                        {...triggerHandler}
                                        ref={ref as React.Ref<HTMLSpanElement>}>
                                        <FormattedRelativeTime
                                            value={stoppeddiff}
                                            numeric="auto"
                                            updateIntervalInSeconds={1}
                                        />
                                    </span>
                                )}
                            </OverlayTrigger>
                            <br />
                        </React.Fragment>
                    ) : (
                        ""
                    )}
                    {/*STOPPED BY*/}
                    {job.cancelledBy ? (
                        <React.Fragment>
                            <FormattedMessage id="app.job.stoppedby" />
                            <OverlayTrigger
                                overlay={
                                    <Tooltip id={`${job.id}-tooltip-createdby`}>
                                        <FormattedMessage id="generic.userid" />
                                        {job.startedBy.id}
                                    </Tooltip>
                                }>
                                {({ ref, ...triggerHandler }) => (
                                    <span
                                        ref={ref as React.Ref<HTMLSpanElement>}
                                        {...triggerHandler}>
                                        {job.cancelledBy!.name}
                                    </span>
                                )}
                            </OverlayTrigger>
                            <br />
                        </React.Fragment>
                    ) : (
                        ""
                    )}
                    {(job.stoppedAt || job.cancelledBy) &&
                    (job.errorCode !== undefined || job.exceptionDetails !== undefined) ? (
                        <br />
                    ) : (
                        ""
                    )}
                    {/*ERROR*/}
                    {job.errorCode !== undefined || job.exceptionDetails !== undefined ? (
                        <React.Fragment>
                            <span>
                                <FormattedMessage id="view.instance.jobs.error" />(
                                {job.errorCode !== undefined && job.errorCode !== null
                                    ? TGSErrorCode[job.errorCode]
                                    : "NoCode"}
                                ): {job.exceptionDetails}
                            </span>
                            <br />
                        </React.Fragment>
                    ) : (
                        ""
                    )}
                    <div className="d-flex mt-2" style={{ height: "1.5rem" }}>
                        <ProgressBar
                            className="text-darker font-weight-bold flex-grow-1 h-unset"
                            animated={!job.stoppedAt}
                            label={
                                typeof job.progress === "number"
                                    ? `${job.progress.toString()}%`
                                    : undefined
                            }
                            now={typeof job.progress === "number" ? job.progress : 100}
                            striped
                            variant={variant}
                        />
                        {job.canCancel && !job.stoppedAt ? (
                            <Button
                                style={{ padding: "0 1em" }}
                                className="ml-1"
                                variant="danger"
                                onClick={() => this.props.onCancel(job)}>
                                <FontAwesomeIcon icon="times" className="d-block" />
                            </Button>
                        ) : null}
                    </div>
                </ToastBody>
            </Toast>
        );
    }
}
