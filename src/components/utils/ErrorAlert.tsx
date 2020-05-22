import InternalError, { DescType, ErrorCode } from '../../models/InternalComms/InternalError';
import React, { Component, ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import ClickToSelect from '@mapbox/react-click-to-select';

interface IProps {
    error: InternalError<ErrorCode> | undefined;
    onClose: () => void;
}

interface IState {
    popup: boolean;
}

export default class ErrorAlert extends Component<IProps, IState> {
    public constructor(props: IProps) {
        super(props);
        this.state = {
            popup: false
        };
    }
    public render(): ReactNode {
        if (!this.props.error) {
            return '';
        }

        const handleClose = () => this.setState({ popup: false });
        const handleOpen = () => this.setState({ popup: true });

        return (
            <Alert
                className="clearfix"
                // @ts-ignore // the error is a special variant just for this
                variant="error"
                dismissible
                onClose={() => this.setState(this.props.onClose)}>
                <FormattedMessage id={this.props.error.code} />
                <hr />

                <Button variant="danger" className="float-right" onClick={handleOpen}>
                    <FormattedMessage id="generic.details" />
                </Button>

                <Modal centered show={this.state.popup} onHide={handleClose} size="lg">
                    <Modal.Header closeButton>
                        <Modal.Title>
                            <FormattedMessage id={this.props.error.code} />
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="text-danger pb-0">
                        {this.props.error.desc?.type == DescType.LOCALE ? (
                            <FormattedMessage id={this.props.error.desc.desc} />
                        ) : this.props.error.desc?.desc ? (
                            this.props.error.desc.desc
                        ) : (
                            ''
                        )}
                        <hr />
                        <ClickToSelect>
                            <code className="bg-darker d-block pre-wrap p-2 pre-scrollable">
                                {`Control Panel Version: ${VERSION}
Control Panel Mode: ${MODE}
API Version: ${API_VERSION}

Error Code: ${this.props.error.code}
Error Description: ${this.props.error.desc ? this.props.error.desc.desc : 'No description'}

Additional Information: 
${this.props.error.extendedInfo}`}
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
