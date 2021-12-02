import ClickToSelect from "@mapbox/react-click-to-select";
import React, { Component, ReactNode } from "react";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { FormattedMessage } from "react-intl";

import InternalError, {
    DescType,
    ErrorCode
} from "../../ApiClient/models/InternalComms/InternalError";
import { API_VERSION, MODE, VERSION } from "../../definitions/constants";

interface IProps {
    error: InternalError<ErrorCode> | undefined;
    onClose?: () => void;
}

interface IState {
    popup: boolean;
}

class ErrorAlert extends Component<IProps, IState> {
    public constructor(props: IProps) {
        super(props);
        this.state = {
            popup: false
        };
    }
    public render(): ReactNode {
        if (!this.props.error) {
            return "";
        }

        const handleClose = () => this.setState({ popup: false });
        const handleOpen = () => this.setState({ popup: true });

        return (
            <Alert
                className="clearfix"
                variant="error"
                dismissible={!!this.props.onClose}
                onClose={this.props.onClose}>
                <FormattedMessage id={this.props.error.code || "error.app.undefined"} />
                <hr />

                <Button variant="danger" className="float-right" onClick={handleOpen}>
                    <FormattedMessage id="generic.details" />
                </Button>

                <Modal centered show={this.state.popup} onHide={handleClose} size="lg">
                    <Modal.Header closeButton>
                        <Modal.Title>
                            <FormattedMessage id={this.props.error.code || "error.app.undefined"} />
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="text-danger pb-0">
                        {this.props.error.desc?.type === DescType.LOCALE ? (
                            <FormattedMessage
                                id={this.props.error.desc.desc || "error.api.empty"}
                            />
                        ) : this.props.error.desc?.desc ? (
                            this.props.error.desc.desc
                        ) : (
                            ""
                        )}
                        <hr />
                        <ClickToSelect>
                            <code className="bg-darker d-block pre-wrap p-2 pre-scrollable">
                                {`Webpanel Version: ${VERSION}
Webpanel Mode: ${MODE}
API Version: ${API_VERSION}

Error Code: ${this.props.error.code}
Error Description: ${this.props.error.desc ? this.props.error.desc.desc : "No description"}

Additional Information:
${this.props.error.extendedInfo}`.replace(/\\/g, "\\\\")}
                            </code>
                        </ClickToSelect>
                    </Modal.Body>
                    <Modal.Footer>
                        <span className="font-italic mr-auto">
                            <FormattedMessage id="generic.debugwarn" />
                        </span>
                        <Button variant="secondary" onClick={handleClose}>
                            <FormattedMessage id="generic.close" />
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Alert>
        );
    }
}

export default ErrorAlert;

export type ErrorState = [
    Array<InternalError<ErrorCode> | undefined>,
    React.Dispatch<React.SetStateAction<Array<InternalError<ErrorCode> | undefined>>>
];

function addError([, setErrors]: ErrorState, error: InternalError<ErrorCode>): void {
    setErrors(prevState => {
        const errors = Array.from(prevState);
        errors.push(error);
        return errors;
    });
}

function displayErrors([errors, setErrors]: ErrorState): Array<JSX.Element | undefined> {
    return errors.map((err, index) => {
        if (!err) return;
        return (
            <ErrorAlert
                key={index}
                error={err}
                onClose={() =>
                    setErrors(prev => {
                        const newarr = Array.from(prev);
                        newarr[index] = undefined;
                        return newarr;
                    })
                }
            />
        );
    });
}

export { displayErrors, addError };
