import ClickToSelect from "@mapbox/react-click-to-select";
import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { FormattedMessage } from "react-intl";

import { ErrorCode as TGSErrorCode } from "../../ApiClient/generatedcode/generated";
import { TGSJobResponse } from "../../ApiClient/JobsClient";

interface IProps {
    job: TGSJobResponse;
}

export default function JobError(props: IProps): JSX.Element {
    const [open, setOpen] = useState(false);
    return (
        <>
            <Button
                variant="danger"
                className="d-inline-block"
                onClick={() => setOpen(true)}
                size="sm">
                <FormattedMessage
                    id="generic.errordetails"
                    values={{
                        info:
                            props.job.errorCode !== undefined && props.job.errorCode !== null
                                ? TGSErrorCode[props.job.errorCode]
                                : "NoCode"
                    }}
                />
            </Button>

            <Modal centered show={open} onHide={() => setOpen(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        <FormattedMessage id={props.job.description} />
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-danger pb-0">
                    <FormattedMessage id="view.instance.jobs.error" />:{" "}
                    {props.job.errorCode !== undefined && props.job.errorCode !== null
                        ? TGSErrorCode[props.job.errorCode]
                        : "NoCode"}
                    <hr />
                    <ClickToSelect>
                        <code className="bg-darker d-block pre-wrap p-2 pre-scrollable">
                            {props.job.exceptionDetails}
                        </code>
                    </ClickToSelect>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setOpen(false)}>
                        <FormattedMessage id="generic.close" />
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
