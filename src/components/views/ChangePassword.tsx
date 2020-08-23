import React, { ChangeEvent, FormEvent } from "react";
import { withRouter } from "react-router-dom";
import Form from "react-bootstrap/Form";
import { FormattedMessage } from "react-intl";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Loading from "../utils/Loading";
import { Components } from "../../ApiClient/generatedcode/_generated";
import ServerClient from "../../ApiClient/ServerClient";
import InternalError, { ErrorCode } from "../../ApiClient/models/InternalComms/InternalError";
import { StatusCode } from "../../ApiClient/models/InternalComms/InternalStatus";
import ErrorAlert from "../utils/ErrorAlert";
import UserClient from "../../ApiClient/UserClient";
import CredentialsProvider from "../../ApiClient/util/CredentialsProvider";
import { getSavedCreds } from "../../utils/misc";
import { RouteComponentProps } from "react-router";

interface IProps extends RouteComponentProps<{ id: string }> {}

interface IState {
    errors: Array<InternalError<ErrorCode> | undefined>;
    password1: string;
    password2: string;
    matchError?: boolean;
    lengthError?: boolean;
    serverInfo?: Components.Schemas.ServerInformation;
    loading: boolean;
    pwdload?: boolean;
    user?: Components.Schemas.User;
}

export default withRouter(
    class ChangePassword extends React.Component<IProps, IState> {
        public constructor(props: IProps) {
            super(props);

            this.state = {
                errors: [],
                password1: "",
                password2: "",
                loading: true
            };

            this.submit = this.submit.bind(this);
        }

        public async componentDidMount(): Promise<void> {
            const res = await ServerClient.getServerInfo();

            switch (res.code) {
                case StatusCode.ERROR: {
                    this.addError(res.error!);
                    break;
                }
                case StatusCode.OK: {
                    this.setState({
                        serverInfo: res.payload!
                    });
                    break;
                }
            }

            let id: number | undefined = undefined;
            if (this.props.match.params.id) {
                id = parseInt(this.props.match.params.id);
            } else {
                const user = await UserClient.getCurrentUser();
                if (user.code == StatusCode.OK) {
                    id = user.payload!.id!;
                } else {
                    this.addError(user.error!);
                }
            }

            if (id) {
                const user = await UserClient.getUser(id);
                if (user.code == StatusCode.OK) {
                    this.setState({
                        user: user.payload!
                    });
                } else {
                    this.addError(user.error!);
                }
            } else {
                this.addError(
                    new InternalError(ErrorCode.APP_FAIL, { jsError: Error("ID is not set") })
                );
                return;
            }

            this.setState({
                loading: false
            });
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

        private async submit(event: FormEvent<HTMLFormElement>): Promise<void> {
            event.preventDefault();
            let err = false;
            if (this.state.password1.length < this.state.serverInfo!.minimumPasswordLength) {
                err = true;
                this.setState({
                    lengthError: true
                });
            } else {
                this.setState({
                    lengthError: false
                });
            }
            if (this.state.password2 !== this.state.password1) {
                err = true;
                this.setState({
                    matchError: true
                });
            } else {
                this.setState({
                    matchError: false
                });
            }
            if (err) return;

            this.setState({
                pwdload: true
            });

            const res = await UserClient.editUser(this.state.user!.id!, {
                password: this.state.password1
            });
            switch (res.code) {
                case StatusCode.OK: {
                    const [usr, pwd] = getSavedCreds() || [undefined, undefined];
                    // noinspection ES6MissingAwait //we just dont care about what happens, it can fail or succeed
                    void ServerClient.login(
                        {
                            userName: CredentialsProvider.credentials!.userName,
                            password: this.state.password1
                        },
                        !!(usr && pwd)
                    );
                    this.props.history.goBack();
                    break;
                }
                case StatusCode.ERROR: {
                    this.addError(res.error!);
                    //we only unset it here because its going to get redirected anyways
                    this.setState({
                        pwdload: false
                    });
                    break;
                }
            }
        }

        public render(): React.ReactNode {
            if (this.state.loading) {
                return <Loading text="loading.info" />;
            }
            if (this.state.pwdload) {
                return <Loading text="loading.passwd" />;
            }

            const handlePwd1Input = (event: ChangeEvent<HTMLInputElement>) =>
                this.setState({ password1: event.target.value });
            const handlePwd2Input = (event: ChangeEvent<HTMLInputElement>) =>
                this.setState({ password2: event.target.value });

            return (
                <Form onSubmit={this.submit}>
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
                        {this.state.user ? (
                            <React.Fragment>
                                <h3>
                                    <FormattedMessage id="view.user.passwd.title" />
                                    {this.state.user.name}({this.state.user.id!})
                                </h3>
                                <hr />
                                <Form.Group controlId="password1">
                                    <Form.Label>
                                        <FormattedMessage id="login.password" />
                                    </Form.Label>
                                    <Form.Control
                                        type="password"
                                        onChange={handlePwd1Input}
                                        value={this.state.password1}
                                        isInvalid={this.state.matchError || this.state.lengthError}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {this.state.lengthError ? (
                                            <React.Fragment>
                                                <FormattedMessage id="login.password.repeat.short" />
                                                {this.state.serverInfo!.minimumPasswordLength}
                                            </React.Fragment>
                                        ) : (
                                            ""
                                        )}
                                    </Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group controlId="password2">
                                    <Form.Label>
                                        <FormattedMessage id="login.password.repeat" />
                                    </Form.Label>
                                    <Form.Control
                                        type="password"
                                        onChange={handlePwd2Input}
                                        value={this.state.password2}
                                        isInvalid={this.state.matchError || this.state.lengthError}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {this.state.matchError ? (
                                            <FormattedMessage id="login.password.repeat.match" />
                                        ) : (
                                            ""
                                        )}
                                    </Form.Control.Feedback>
                                </Form.Group>
                                <Button type="submit">
                                    <FormattedMessage id="login.submit" />
                                </Button>
                            </React.Fragment>
                        ) : (
                            ""
                        )}
                    </Col>
                </Form>
            );
        }
    }
);
