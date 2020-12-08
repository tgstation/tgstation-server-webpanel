import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { ChangeEvent, FormEvent, Fragment, ReactNode } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import { FormattedMessage } from "react-intl";
import { RouteComponentProps } from "react-router";
import { withRouter } from "react-router-dom";

import { OAuthProvider } from "../../ApiClient/generatedcode/_enums";
import { Components } from "../../ApiClient/generatedcode/_generated";
import { CredentialsType, ICredentials } from "../../ApiClient/models/ICredentials";
import InternalError, { ErrorCode } from "../../ApiClient/models/InternalComms/InternalError";
import { StatusCode } from "../../ApiClient/models/InternalComms/InternalStatus";
import ServerClient, { LoginErrors } from "../../ApiClient/ServerClient";
import { getSavedCreds } from "../../utils/misc";
import { AppRoutes } from "../../utils/routes";
import ErrorAlert from "../utils/ErrorAlert";
import Loading from "../utils/Loading";

interface IProps extends RouteComponentProps<{ provider?: string }> {
    prefillLogin?: string;
    postLoginAction?: () => void;
}
interface IState {
    serverInformation?: Components.Schemas.ServerInformation;
    busy: boolean;
    validated: boolean;
    username: string;
    password: string;
    save: boolean;
    error?: InternalError<LoginErrors>;
}

export default withRouter(
    class Login extends React.Component<IProps, IState> {
        public constructor(props: IProps) {
            super(props);
            this.submit = this.submit.bind(this);
            this.gitHubOAuth = this.gitHubOAuth.bind(this);

            let usr, pwd;
            if (this.props.prefillLogin) {
                usr = this.props.prefillLogin;
                pwd = "";
            } else {
                [usr, pwd] = getSavedCreds() || [undefined, undefined];
            }

            this.state = {
                busy: false,
                validated: false,
                username: usr || "",
                password: pwd || "",
                save: !!(usr && pwd)
            };
        }

        public render(): ReactNode {
            const handleUsrInput = (event: ChangeEvent<HTMLInputElement>) =>
                this.setState({ username: event.target.value });
            const handlePwdInput = (event: ChangeEvent<HTMLInputElement>) =>
                this.setState({ password: event.target.value });
            const handleSaveInput = (event: ChangeEvent<HTMLInputElement>) =>
                this.setState({ save: event.target.checked });

            if (this.state.busy) {
                return <Loading text="loading.login" />;
            }
            return (
                <Fragment>
                    <Form validated={this.state.validated} onSubmit={this.submit}>
                        <Col className="mx-auto" lg={5} md={8}>
                            <ErrorAlert
                                error={this.state.error}
                                onClose={() => this.setState({ error: undefined })}
                            />
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
                            <Form.Group controlId="save">
                                <Form.Check
                                    type="checkbox"
                                    label="Save password"
                                    onChange={handleSaveInput}
                                    checked={this.state.save}
                                />
                            </Form.Group>
                            <Button type="submit">
                                <FormattedMessage id="login.submit" />
                            </Button>
                        </Col>
                    </Form>
                    {this.renderOAuthButtons()}
                </Fragment>
            );
        }

        public async componentDidMount(): Promise<void> {
            if (this.props.match.params.provider) {
                const query = new URLSearchParams(this.props.location.search);
                switch (this.props.match.params.provider) {
                    case "github": {
                        let storedState: string | null = null;
                        try {
                            storedState = window.sessionStorage.getItem("github_state");
                            window.sessionStorage.removeItem("github_state");
                        } catch (_) {
                            //Some browsers throw an exception when it cannot save to local storage(private browsing),
                            // we dont particularly care to inform the user
                            (() => {})(); //noop
                        }

                        const code = query.get("code");
                        const receivedState = query.get("state");

                        if ((storedState && storedState !== receivedState) || !code) {
                            this.setState({
                                error: new InternalError<ErrorCode.LOGIN_BAD_OAUTH>(
                                    ErrorCode.LOGIN_BAD_OAUTH,
                                    { void: true }
                                )
                            });
                        } else if (
                            await this.loginWithCreds({
                                type: CredentialsType.OAuth,
                                provider: OAuthProvider.GitHub,
                                token: code
                            })
                        ) {
                            this.props.history.push(AppRoutes.home.link || AppRoutes.home.route, {
                                reload: true
                            });
                            return;
                        }

                        break;
                    }
                }
            }

            const info = await ServerClient.getServerInfo();
            if (info.code === StatusCode.OK)
                this.setState({
                    serverInformation: info.payload!
                });
            else
                this.setState({
                    error: info.error
                });
        }

        private renderOAuthButtons(): ReactNode {
            if (!this.state.serverInformation?.oAuthProviderInfos) return <div />;

            const buttons: ReactNode[] = [];
            if (this.state.serverInformation.oAuthProviderInfos.GitHub) {
                buttons.push(
                    <Button onClick={this.gitHubOAuth} key="GitHub">
                        <FontAwesomeIcon fixedWidth icon={faGithub} />
                        <FormattedMessage id="login.github" />
                    </Button>
                );
            }

            if (buttons.length === 0) return <div />;

            return (
                <Fragment>
                    <hr />
                    {buttons}
                </Fragment>
            );
        }

        private gitHubOAuth(): void {
            const state = this.makeState();
            const clientId = encodeURIComponent(
                this.state.serverInformation!.oAuthProviderInfos!.GitHub.clientId!
            );
            const redirectUri = encodeURIComponent(
                this.state.serverInformation!.oAuthProviderInfos!.GitHub.redirectUri!
            );

            try {
                window.sessionStorage.setItem("github_state", state);
            } catch (_) {
                //Some browsers throw an exception when it cannot save to local storage(private browsing),
                // we dont particularly care to inform the user
                (() => {})(); //noop
            }

            const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&allow_signup=false&state=${state}`;
            window.location.href = authUrl;
        }

        private makeState() {
            const array = new Uint32Array(32);
            window.crypto.getRandomValues(array);
            return Array.from(array, dec => dec.toString(16).padStart(2, "0")).join("");
        }

        private async submit(event: FormEvent<HTMLFormElement>) {
            event.preventDefault();
            await this.loginWithCreds({
                type: CredentialsType.Password,
                userName: this.state.username,
                password: this.state.password
            });
        }

        private async loginWithCreds(credentials: ICredentials): Promise<boolean> {
            this.setState({
                busy: true
            });

            const response = await ServerClient.login(credentials, this.state.save);
            if (response.code == StatusCode.ERROR) {
                this.setState({
                    busy: false,
                    error: response.error
                });

                return false;
            }

            if (this.props.postLoginAction) {
                this.props.postLoginAction();
            }

            return true;
        }
    }
);
