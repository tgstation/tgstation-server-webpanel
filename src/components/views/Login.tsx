import React, { ChangeEvent, FormEvent, ReactNode } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import { FormattedMessage } from "react-intl";
import { RouteComponentProps } from "react-router";
import { Route, withRouter } from "react-router-dom";

import { CredentialsType } from "../../ApiClient/models/ICredentials";
import InternalError, { ErrorCode } from "../../ApiClient/models/InternalComms/InternalError";
import { StatusCode } from "../../ApiClient/models/InternalComms/InternalStatus";
import ServerClient from "../../ApiClient/ServerClient";
import { MODE } from "../../definitions/constants";
import { RouteData } from "../../utils/routes";
import ErrorAlert from "../utils/ErrorAlert";
import Loading from "../utils/Loading";

interface IProps extends RouteComponentProps {
    prefillLogin?: string;
    postLoginAction?: () => void;
}
interface IState {
    busy: boolean;
    validated: boolean;
    username: string;
    password: string;
    errors: Array<InternalError<ErrorCode> | undefined>;
    redirectSetup?: boolean;
}

export default withRouter(
    class Login extends React.Component<IProps, IState> {
        public constructor(props: IProps) {
            super(props);
            this.submit = this.submit.bind(this);

            console.log(RouteData.oautherrors);

            this.state = {
                busy: false,
                validated: false,
                username: "",
                password: "",
                errors: RouteData.oautherrors
            };
        }

        public componentDidMount() {
            if (MODE === "PROD") {
                void this.tryLoginDefault();
            }
        }

        private async tryLoginDefault(): Promise<void> {
            const response = await ServerClient.login({
                type: CredentialsType.Password,
                userName: "admin",
                password: "ISolemlySwearToDeleteTheDataDirectory"
            });

            if (response.code === StatusCode.OK) {
                this.setState({
                    redirectSetup: true
                });
            }
        }

        private addError(error: InternalError<ErrorCode>): void {
            this.setState(prevState => {
                const errors = Array.from(prevState.errors);
                errors.push(error);
                return {
                    errors
                };
            });
        }

        public render(): ReactNode {
            const handleUsrInput = (event: ChangeEvent<HTMLInputElement>) =>
                this.setState({ username: event.target.value });
            const handlePwdInput = (event: ChangeEvent<HTMLInputElement>) =>
                this.setState({ password: event.target.value });

            if (this.state.busy) {
                return <Loading text="loading.login" />;
            }

            /*if (this.state.redirectSetup) {
                return <Redirect to={AppRoutes.setup.link || AppRoutes.setup.route} />;
            }*/
            return (
                <Form validated={this.state.validated} onSubmit={this.submit}>
                    <Col className="mx-auto" lg={5} md={8}>
                        {this.state.errors.map((err, index) => {
                            if (!err) return;
                            return (
                                <ErrorAlert
                                    key={index}
                                    error={err}
                                    onClose={() =>
                                        this.setState(prev => {
                                            const newarr = Array.from(prev.errors);
                                            newarr[index] = undefined;
                                            return {
                                                errors: newarr
                                            };
                                        })
                                    }
                                />
                            );
                        })}
                        <Form.Group controlId="username">
                            <Form.Label>
                                <FormattedMessage id="login.username" />
                            </Form.Label>
                            <Form.Control
                                type="text"
                                onChange={handleUsrInput}
                                value={this.state.username}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="password">
                            <Form.Label>
                                <FormattedMessage id="login.password" />
                            </Form.Label>
                            <Form.Control
                                type="password"
                                onChange={handlePwdInput}
                                value={this.state.password}
                                required
                            />
                        </Form.Group>
                        <Button type="submit">
                            <FormattedMessage id="login.submit" />
                        </Button>
                    </Col>
                </Form>
            );
        }

        private async submit(event: FormEvent<HTMLFormElement>) {
            event.preventDefault();
            this.setState({
                busy: true
            });
            const response = await ServerClient.login({
                type: CredentialsType.Password,
                userName: this.state.username,
                password: this.state.password
            });
            if (response.code == StatusCode.ERROR) {
                this.setState({
                    busy: false
                });
                this.addError(response.error!);
            } else {
                if (this.props.postLoginAction) {
                    this.props.postLoginAction();
                }
            }
        }
    }
);
