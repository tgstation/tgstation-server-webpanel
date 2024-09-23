import React, { ChangeEvent, FormEvent } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import { FormattedMessage } from "react-intl";
import { RouteComponentProps } from "react-router";
import { withRouter } from "react-router-dom";

import type { UserResponse } from "../../ApiClient/generatedcode/generated";
import { CredentialsType } from "../../ApiClient/models/ICredentials";
import InternalError, { ErrorCode } from "../../ApiClient/models/InternalComms/InternalError";
import { StatusCode } from "../../ApiClient/models/InternalComms/InternalStatus";
import ServerClient from "../../ApiClient/ServerClient";
import UserClient from "../../ApiClient/UserClient";
import { GeneralContext } from "../../contexts/GeneralContext";
import ErrorAlert from "../utils/ErrorAlert";
import Loading from "../utils/Loading";

type IProps = RouteComponentProps<{ id: string }>;

interface IState {
    errors: Array<InternalError<ErrorCode> | undefined>;
    password1: string;
    password2: string;
    matchError?: boolean;
    lengthError?: boolean;
    loading: boolean;
    pwdload?: boolean;
    user?: UserResponse;
    userId: number;
    currentUser: boolean;
}

class ChangePassword extends React.Component<IProps, IState> {
    public declare context: GeneralContext;

    public constructor(props: IProps, context: GeneralContext) {
        super(props);

        if (!context?.user) {
            throw Error("ChangePassword: this.context?.user is null!");
        }

        let id: number;
        if (props.match.params.id) {
            id = parseInt(props.match.params.id);
        } else {
            id = context.user.id;
        }

        this.state = {
            errors: [],
            password1: "",
            password2: "",
            userId: id,
            currentUser: context.user.id === id,
            loading: true
        };

        this.submit = this.submit.bind(this);
    }

    public async componentDidMount(): Promise<void> {
        const user = await UserClient.getUser(this.state.userId);
        if (user.code == StatusCode.OK) {
            this.setState({
                user: user.payload
            });
        } else {
            this.addError(user.error);
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

    // noinspection DuplicatedCode
    private async submit(event: FormEvent<HTMLFormElement>): Promise<void> {
        if (!this.state.user) {
            this.addError(
                new InternalError(ErrorCode.APP_FAIL, {
                    jsError: Error("changepassword submit: this.user is falsy")
                })
            );
            return;
        }

        event.preventDefault();
        let err = false;
        if (this.state.password1.length < this.context.serverInfo.minimumPasswordLength) {
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

        const res = await UserClient.editUser({
            password: this.state.password1,
            id: this.state.user.id
        });
        switch (res.code) {
            case StatusCode.OK: {
                if (this.state.currentUser) {
                    // noinspection ES6MissingAwait //we just dont care about what happens, it can fail or succeed
                    void ServerClient.login({
                        type: CredentialsType.Password,
                        userName: this.state.user.name,
                        password: this.state.password1
                    });
                }

                this.props.history.goBack();
                break;
            }
            case StatusCode.ERROR: {
                this.addError(res.error);
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
            <Form onSubmit={e => void this.submit(e)}>
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
                                {this.state.user.name}({this.state.user.id})
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
                                            {this.context.serverInfo.minimumPasswordLength}
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
                                <FormattedMessage id="routes.passwd" />
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
ChangePassword.contextType = GeneralContext;
export default withRouter(ChangePassword);
