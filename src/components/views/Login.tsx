import { faDiscord, faGithub } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { ChangeEvent, FormEvent, Fragment, ReactNode } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import { FormattedMessage } from "react-intl";
import { RouteComponentProps } from "react-router";
import { withRouter } from "react-router-dom";

import tgicon from "../../../images/tglogo-white.svg";
import { OAuthProvider } from "../../ApiClient/generatedcode/_enums";
import { Components } from "../../ApiClient/generatedcode/_generated";
import { CredentialsType, ICredentials } from "../../ApiClient/models/ICredentials";
import InternalError, { ErrorCode } from "../../ApiClient/models/InternalComms/InternalError";
import { StatusCode } from "../../ApiClient/models/InternalComms/InternalStatus";
import ServerClient, { LoginErrors } from "../../ApiClient/ServerClient";
import { MODE } from "../../definitions/constants";
import { AppRoutes } from "../../utils/routes";
import ErrorAlert from "../utils/ErrorAlert";
import Loading from "../utils/Loading";

interface IProps extends RouteComponentProps<{ provider?: OAuthProvider }> {
    prefillLogin?: string;
    postLoginAction?: () => void;
}
interface IState {
    serverInformation?: Components.Schemas.ServerInformation;
    busy: boolean;
    validated: boolean;
    username: string;
    password: string;
    error?: InternalError<LoginErrors>;
    redirectSetup?: boolean;
}

export default withRouter(
    class Login extends React.Component<IProps, IState> {
        public constructor(props: IProps) {
            super(props);
            this.submit = this.submit.bind(this);
            this.performOAuth = this.performOAuth.bind(this);

            this.state = {
                busy: false,
                validated: false,
                username: "",
                password: ""
            };
        }

        public async componentDidMount() {
            if (await this.completeOAuthLogin()) return;

            if (MODE === "PROD") {
                await this.tryLoginDefault();
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
                <Fragment>
                    <Form validated={this.state.validated} onSubmit={this.submit}>
                        <Col className="mx-auto" lg={5} md={8}>
                            <ErrorAlert
                                error={this.state.error}
                                onClose={() => this.setState({ error: undefined })}
                            />{" "}
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
                    {this.renderOAuthButtons()}
                </Fragment>
            );
        }

        private renderOAuthButtons(): ReactNode {
            if (!this.state.serverInformation?.oAuthProviderInfos) return <div />;

            const buttons: ReactNode[] = [];
            if (this.state.serverInformation.oAuthProviderInfos.GitHub) {
                buttons.push(
                    <Button
                        onClick={() => this.performOAuth(OAuthProvider.GitHub)}
                        key={OAuthProvider.GitHub}>
                        <FontAwesomeIcon fixedWidth icon={faGithub} />
                        <br />
                        <FormattedMessage id="login.github" />
                    </Button>
                );
            }

            if (this.state.serverInformation.oAuthProviderInfos.Discord) {
                buttons.push(
                    <Button
                        onClick={() => this.performOAuth(OAuthProvider.Discord)}
                        key={OAuthProvider.Discord}>
                        <FontAwesomeIcon fixedWidth icon={faDiscord} />
                        <br />
                        <FormattedMessage id="login.discord" />
                    </Button>
                );
            }

            if (this.state.serverInformation.oAuthProviderInfos.TGForums) {
                buttons.push(
                    <Button
                        onClick={() => this.performOAuth(OAuthProvider.TGForums)}
                        key={OAuthProvider.TGForums}>
                        <img src={tgicon} style={{ maxHeight: "16px" }}></img>
                        <br />
                        <FormattedMessage id="login.tgforums" />
                    </Button>
                );
            }

            if (this.state.serverInformation.oAuthProviderInfos.Keycloak) {
                buttons.push(
                    <Button
                        onClick={() => this.performOAuth(OAuthProvider.Keycloak)}
                        key={OAuthProvider.Keycloak}>
                        <img
                            src="https://github.com/keycloak/keycloak-misc/raw/master/logo/keycloak_icon_64px.png"
                            style={{ maxHeight: "16px" }}></img>
                        <br />
                        <FormattedMessage id="login.keycloak" />
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

        private oAuthStateName(provider: OAuthProvider): string {
            return `${provider}_oauth_state`;
        }

        private performOAuth(provider: OAuthProvider): void {
            // not using state since it's impossible to XSS tgforum auth with our setup (getting session_public_token from TGS)
            // we NEED the client id returned from TGS though as it changes
            let state =
                provider === OAuthProvider.TGForums
                    ? this.state.serverInformation!.oAuthProviderInfos![provider].clientId!
                    : this.makeState();
            const clientId = encodeURIComponent(
                this.state.serverInformation!.oAuthProviderInfos![provider].clientId!
            );
            const redirectUri = encodeURIComponent(
                this.state.serverInformation!.oAuthProviderInfos![provider].redirectUri || ""!
            );

            const serverUrl = this.state.serverInformation!.oAuthProviderInfos![provider]
                .serverUrl as string | null;
            try {
                window.sessionStorage.setItem(this.oAuthStateName(provider), state);
            } catch (ex) {
                if (provider === OAuthProvider.TGForums) {
                    // mandatory
                    this.setState({
                        error: new InternalError<ErrorCode.LOGIN_NO_SESSION_STORAGE>(
                            ErrorCode.LOGIN_NO_SESSION_STORAGE,
                            ex instanceof Error
                                ? {
                                      jsError: ex
                                  }
                                : {
                                      void: true
                                  }
                        )
                    });
                    return;
                }
            }

            state = encodeURIComponent(state);

            let authUrl: string;
            switch (provider) {
                case OAuthProvider.GitHub: {
                    authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&allow_signup=false&state=${state}`;
                    break;
                }
                case OAuthProvider.Discord: {
                    authUrl = `https://discord.com/api/oauth2/authorize?response_type=code&client_id=${clientId}&scope=identify&state=${state}&redirect_uri=${redirectUri}`;
                    break;
                }
                case OAuthProvider.TGForums: {
                    authUrl = `https://tgstation13.org/phpBB/oauth.php?session_public_token=${clientId}`;
                    break;
                }
                case OAuthProvider.Keycloak: {
                    if (!serverUrl) {
                        this.setState({
                            error: new InternalError<ErrorCode.LOGIN_BAD_OAUTH>(
                                ErrorCode.LOGIN_BAD_OAUTH,
                                {
                                    void: true
                                }
                            )
                        });
                        return;
                    }

                    authUrl = `${serverUrl}/protocol/openid-connect/auth?client_id=${clientId}&scope=openid&response_type=code&redirect_uri=${redirectUri}&state=${state}`;
                    break;
                }
                default: {
                    this.setState({
                        error: new InternalError<ErrorCode.LOGIN_BAD_OAUTH>(
                            ErrorCode.LOGIN_BAD_OAUTH,
                            {
                                void: true
                            }
                        )
                    });
                    return;
                }
            }

            window.location.href = authUrl;
        }

        private async completeOAuthLogin(): Promise<boolean> {
            const provider = this.props.match.params.provider;
            if (!provider) return false;

            const query = new URLSearchParams(this.props.location.search);
            let storedState: string | null = null;
            let sessionStorageError: Error | null = null;
            try {
                const stateName = this.oAuthStateName(provider);
                storedState = window.sessionStorage.getItem(stateName);
                window.sessionStorage.removeItem(stateName);
            } catch (ex) {
                if (ex instanceof Error) sessionStorageError = ex;
            }

            let code: string | null = null;
            let receivedState: string | null = null;
            let errorMessage: string | null = null;
            switch (provider) {
                case OAuthProvider.GitHub: {
                    errorMessage = query.get("error_description");
                    code = query.get("code");
                    receivedState = query.get("state");
                    break;
                }
                case OAuthProvider.Discord: {
                    code = query.get("code");
                    receivedState = query.get("state");
                    break;
                }
                case OAuthProvider.Keycloak: {
                    code = query.get("code");
                    receivedState = query.get("state");
                    break;
                }
                case OAuthProvider.TGForums:
                    if (!storedState) {
                        // mandatory
                        this.setState({
                            error: new InternalError<ErrorCode.LOGIN_NO_SESSION_STORAGE>(
                                ErrorCode.LOGIN_NO_SESSION_STORAGE,
                                sessionStorageError
                                    ? {
                                          jsError: sessionStorageError
                                      }
                                    : {
                                          void: true
                                      }
                            )
                        });
                        return false;
                    }

                    code = storedState;
                    storedState = null;
                    break;
            }

            if ((storedState && storedState !== receivedState) || !code) {
                this.setState({
                    error: new InternalError<ErrorCode.LOGIN_BAD_OAUTH>(
                        ErrorCode.LOGIN_BAD_OAUTH,
                        errorMessage
                            ? {
                                  jsError: new Error(errorMessage)
                              }
                            : {
                                  void: true
                              }
                    )
                });
                return false;
            }

            if (
                await this.loginWithCreds({
                    type: CredentialsType.OAuth,
                    provider: provider,
                    token: code
                })
            ) {
                this.props.history.push(AppRoutes.home.link || AppRoutes.home.route);
                return true;
            }

            return false;
        }

        private makeState() {
            const array = new Uint32Array(16);
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

            const response = await ServerClient.login(credentials);
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
