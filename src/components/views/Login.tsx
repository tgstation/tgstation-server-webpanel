import { faDiscord } from "@fortawesome/free-brands-svg-icons/faDiscord";
import { faGithub } from "@fortawesome/free-brands-svg-icons/faGithub";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { ChangeEvent, FormEvent, ReactNode } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/esm/Card";
import Form from "react-bootstrap/Form";
import { FormattedMessage } from "react-intl";
import { RouteComponentProps } from "react-router";
import { withRouter } from "react-router-dom";

import { OAuthProvider } from "../../ApiClient/generatedcode/_enums";
import { CredentialsType } from "../../ApiClient/models/ICredentials";
import InternalError, { ErrorCode } from "../../ApiClient/models/InternalComms/InternalError";
import { StatusCode } from "../../ApiClient/models/InternalComms/InternalStatus";
import ServerClient from "../../ApiClient/ServerClient";
import CredentialsProvider from "../../ApiClient/util/CredentialsProvider";
import { GeneralContext, UnsafeGeneralContext } from "../../contexts/GeneralContext";
import { MODE } from "../../definitions/constants";
import KeycloakLogo from "../../images/keycloak_icon_64px.png";
import TGLogo from "../../images/tglogo-white.svg";
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

export type NormalOauth = { provider: Exclude<OAuthProvider, OAuthProvider.TGForums>; url: string };
export type TGSnowflakeOauth = {
    provider: OAuthProvider.TGForums;
    state: string;
    url: string;
};
export type StoredOAuthData = NormalOauth | TGSnowflakeOauth;
export type OAuthStateStorage = Record<string, StoredOAuthData>;

class Login extends React.Component<IProps, IState> {
    public declare context: UnsafeGeneralContext;

    public constructor(props: IProps) {
        super(props);
        this.submit = this.submit.bind(this);

        console.log(RouteData.oautherrors);

        this.state = {
            busy: false,
            validated: false,
            username: "",
            password: "",
            errors: Array.from(RouteData.oautherrors)
        };
    }

    public componentDidMount() {
        if (MODE === "PROD") {
            // noinspection ES6MissingAwait
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

        if (this.state.busy || CredentialsProvider.isTokenValid()) {
            return <Loading text="loading.login" />;
        }

        if (!this.context.serverInfo) {
            return <Loading text="loading.serverinfo" />;
        }

        /*if (this.state.redirectSetup) {
                return <Redirect to={AppRoutes.setup.link || AppRoutes.setup.route} />;
            }*/

        const providers: Record<OAuthProvider, React.ReactNode> = {
            [OAuthProvider.GitHub]: <FontAwesomeIcon icon={faGithub} style={{ width: "1.2em" }} />,
            [OAuthProvider.Discord]: (
                <FontAwesomeIcon icon={faDiscord} style={{ width: "1.2em" }} />
            ),
            [OAuthProvider.TGForums]: <img src={TGLogo} alt="tglogo" style={{ width: "1.2em" }} />,
            [OAuthProvider.Keycloak]: (
                <img src={KeycloakLogo} alt="keycloaklogo" style={{ width: "1.2em" }} />
            )
        };

        const providersTheme: Record<OAuthProvider, string | undefined> = {
            GitHub: "#161b22",
            Discord: "#7289da",
            TGForums: undefined,
            Keycloak: undefined
        };

        return (
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
                <Card body>
                    <Card.Title>Login to Continue</Card.Title>
                    <Card body>
                        <Card.Title>Password Login</Card.Title>
                        <Form validated={this.state.validated} onSubmit={this.submit}>
                            <Form.Group controlId="username">
                                <Form.Label>
                                    <FormattedMessage id="login.username" />
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter username"
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
                                    placeholder="Password"
                                    onChange={handlePwdInput}
                                    value={this.state.password}
                                    required
                                />
                            </Form.Group>
                            <Button type="submit" block>
                                <FormattedMessage id="login.submit" />
                            </Button>
                        </Form>
                    </Card>
                    {(this.context.serverInfo?.oAuthProviderInfos?.Discord ||
                        this.context.serverInfo?.oAuthProviderInfos?.GitHub ||
                        this.context.serverInfo?.oAuthProviderInfos?.Keycloak ||
                        this.context.serverInfo?.oAuthProviderInfos?.TGForums) && (
                        <>
                            <hr />
                            <Card body>
                                <Card.Title>OAuth Login</Card.Title>
                                {Object.keys(this.context.serverInfo.oAuthProviderInfos ?? {}).map(
                                    provider => {
                                        const ptheme = providersTheme[provider as OAuthProvider];
                                        return (
                                            <Button
                                                key={provider}
                                                block
                                                style={ptheme ? { background: ptheme } : undefined}
                                                onClick={() =>
                                                    this.startOAuth(provider as OAuthProvider)
                                                }>
                                                {providers[provider as OAuthProvider]}
                                                &nbsp;
                                                <FormattedMessage
                                                    id="login.oauth"
                                                    values={{ provider }}
                                                />
                                            </Button>
                                        );
                                    }
                                )}
                            </Card>
                        </>
                    )}
                </Card>
            </Col>
        );
    }

    private async startOAuth(provider: OAuthProvider): Promise<void> {
        if (!this.context.serverInfo) {
            this.addError(
                new InternalError(ErrorCode.APP_FAIL, {
                    jsError: Error("serverInfo is null in startOAuth")
                })
            );
            return;
        }

        const stateArray = new Uint8Array(10);
        window.crypto.getRandomValues(stateArray);
        const state = Array.from(stateArray, dec => dec.toString(16).padStart(2, "0")).join("");

        let url: string | undefined = undefined;

        const e = encodeURIComponent;

        switch (provider) {
            case OAuthProvider.Discord: {
                url = `https://discord.com/api/oauth2/authorize?response_type=code&client_id=${e(
                    this.context.serverInfo.oAuthProviderInfos.Discord.clientId
                )}&scope=identify&state=${e(state)}&redirect_uri=${e(
                    this.context.serverInfo.oAuthProviderInfos.Discord.redirectUri
                )}`;
                break;
            }
            case OAuthProvider.GitHub: {
                url = `https://github.com/login/oauth/authorize?client_id=${e(
                    this.context.serverInfo.oAuthProviderInfos.GitHub.clientId
                )}&redirect_uri=${e(
                    this.context.serverInfo.oAuthProviderInfos.GitHub.redirectUri
                )}&state=${e(state)}&allow_signup=false`;
                break;
            }
            case OAuthProvider.Keycloak: {
                url = `${this.context.serverInfo.oAuthProviderInfos.Keycloak
                    .serverUrl!}/protocol/openid-connect/auth?response_type=code&client_id=${e(
                    this.context.serverInfo.oAuthProviderInfos.Keycloak.clientId
                )}&scope=openid&state=${e(state)}&redirect_uri=${e(
                    this.context.serverInfo.oAuthProviderInfos.Keycloak.redirectUri
                )}`;
                break;
            }
            case OAuthProvider.TGForums: {
                url = `https://tgstation13.org/phpBB/oauth.php?session_public_token=${e(
                    this.context.serverInfo.oAuthProviderInfos.TGForums.clientId
                )}`;
                break;
            }
        }

        const oauthdata = JSON.parse(
            window.sessionStorage.getItem("oauth") ?? "{}"
        ) as OAuthStateStorage;
        if (provider === OAuthProvider.TGForums) {
            oauthdata["tgforums"] = {
                provider: provider,
                url: this.props.location.pathname,
                state: this.context.serverInfo.oAuthProviderInfos.TGForums.clientId
            };
        } else {
            oauthdata[state] = {
                provider: provider,
                url: this.props.location.pathname
            };
        }

        window.sessionStorage.setItem("oauth", JSON.stringify(oauthdata));

        window.location.href = url;

        return new Promise(resolve => resolve());
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
            this.addError(response.error);
        } else {
            if (this.props.postLoginAction) {
                this.props.postLoginAction();
            }
        }
    }
}
Login.contextType = GeneralContext;
export default withRouter(Login);
