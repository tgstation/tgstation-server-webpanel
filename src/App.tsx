import "./App.css";

import * as React from "react";
import Container from "react-bootstrap/Container";
import { IntlProvider } from "react-intl";
import { BrowserRouter } from "react-router-dom";

import { OAuthProvider } from "./ApiClient/generatedcode/_enums";
import { CredentialsType } from "./ApiClient/models/ICredentials";
import InternalError, { ErrorCode } from "./ApiClient/models/InternalComms/InternalError";
import { StatusCode } from "./ApiClient/models/InternalComms/InternalStatus";
import ServerClient from "./ApiClient/ServerClient";
import UserClient from "./ApiClient/UserClient";
import LoginHooks from "./ApiClient/util/LoginHooks";
import AppNavbar from "./components/AppNavbar";
import ErrorBoundary from "./components/utils/ErrorBoundary";
import JobsList from "./components/utils/JobsList";
import Loading from "./components/utils/Loading";
import { DEFAULT_BASEPATH, MODE } from "./definitions/constants";
import Router from "./Router";
import ITranslation from "./translations/ITranslation";
import ITranslationFactory from "./translations/ITranslationFactory";
import TranslationFactory from "./translations/TranslationFactory";
import { RouteData } from "./utils/routes";

interface IState {
    translation?: ITranslation;
    translationError?: string;
    loggedIn: boolean;
    loading: boolean;
}

interface IProps {
    readonly locale: string;
    readonly translationFactory?: ITranslationFactory;
}

interface InnerProps {
    loading: boolean;
    loggedIn: boolean;
}

interface InnerState {
    passdownCat?: { name: string; key: string };
    loading?: boolean;
}

export type NormalOauth = { provider: Exclude<OAuthProvider, OAuthProvider.TGForums> };
export type TGSnowflakeOauth = {
    provider: OAuthProvider.TGForums;
    state: string;
};
export type StoredOAuthData = NormalOauth | TGSnowflakeOauth;
export type OAuthStateStorage = Record<string, StoredOAuthData>;

class InnerApp extends React.Component<InnerProps, InnerState> {
    public constructor(props: InnerProps) {
        super(props);

        this.state = {
            loading: !!new URLSearchParams(window.location.search).get("state")
        };
    }

    public async componentDidMount() {
        //I can't be assed to remember the default admin password
        document.addEventListener("keydown", function (event) {
            if (event.key == "L" && event.ctrlKey && event.shiftKey) {
                //alert("ISolemlySwearToDeleteTheDataDirectory");
                void ServerClient.login({
                    type: CredentialsType.Password,
                    userName: "admin",
                    password: "ISolemlySwearToDeleteTheDataDirectory"
                });
            }
        });

        const URLSearch = new URLSearchParams(window.location.search);
        const state = URLSearch.get("state");
        if (!state) {
            this.setState({
                loading: false
            });
            return;
        }

        if (MODE === "PROD") {
            window.history.replaceState(null, document.title, window.location.pathname);
        }

        const oauthdata = JSON.parse(
            window.sessionStorage.getItem("oauth") || "{}"
        ) as OAuthStateStorage;

        const oauthstate = oauthdata[state];
        if (!oauthstate) {
            return this.setErrorAndEnd(
                new InternalError(ErrorCode.LOGIN_BAD_OAUTH, {
                    jsError: Error(`State(${state}) cannot be resolved to a provider.`)
                })
            );
        }

        let code = URLSearch.get("code");
        if (oauthstate.provider === OAuthProvider.TGForums) {
            code = oauthstate.state;
        }

        if (!code) {
            return this.setErrorAndEnd(
                new InternalError(ErrorCode.LOGIN_BAD_OAUTH, {
                    jsError: Error(`Code not found.`)
                })
            );
        }

        const response = await ServerClient.login({
            type: CredentialsType.OAuth,
            provider: oauthstate.provider,
            token: code
        });
        if (response.code === StatusCode.OK) {
            this.setState({
                loading: false
            });
        } else {
            return this.setErrorAndEnd(response.error!);
        }
    }

    private setErrorAndEnd(error: InternalError<ErrorCode>) {
        RouteData.oautherrors = [error];
        this.setState({
            loading: false
        });
    }

    public render(): React.ReactNode {
        if (this.state.loading) {
            return <Loading text="loading.app" />;
        }
        return (
            <BrowserRouter basename={DEFAULT_BASEPATH}>
                <ErrorBoundary>
                    <AppNavbar category={this.state.passdownCat} />
                    {this.props.loading ? (
                        <Container className="mt-5 mb-5">
                            <Loading text="loading.app" />
                        </Container>
                    ) : (
                        <Router
                            loggedIn={this.props.loggedIn}
                            selectCategory={cat => {
                                this.setState({
                                    passdownCat: {
                                        name: cat,
                                        key: Math.random().toString()
                                    }
                                });
                            }}
                        />
                    )}
                    <JobsList />
                </ErrorBoundary>
            </BrowserRouter>
        );
    }
}

class App extends React.Component<IProps, IState> {
    private readonly translationFactory: ITranslationFactory;

    public constructor(props: IProps) {
        super(props);

        this.translationFactory = this.props.translationFactory || new TranslationFactory();

        this.state = {
            loggedIn: false,
            loading: true
        };
    }

    public async componentDidMount(): Promise<void> {
        LoginHooks.on("loginSuccess", () => {
            console.log("Logging in");

            void UserClient.getCurrentUser(); //preload the user, we dont particularly care about the content, just that its preloaded
            this.setState({
                loggedIn: true,
                loading: false
            });
        });
        ServerClient.on("logout", () => {
            this.setState({
                loggedIn: false
            });
        });

        await this.loadTranslation();
        await ServerClient.initApi();
        await ServerClient.getServerInfo();

        this.setState({
            loading: false
        });
    }

    public render(): React.ReactNode {
        if (this.state.translationError != null)
            return <p className="App-error">{this.state.translationError}</p>;

        if (this.state.translation == null) return <Loading>Loading translations...</Loading>;
        return (
            <IntlProvider
                locale={this.state.translation.locale}
                messages={this.state.translation.messages}>
                <InnerApp loading={this.state.loading} loggedIn={this.state.loggedIn} />
            </IntlProvider>
        );
    }

    private async loadTranslation(): Promise<void> {
        console.time("LoadTranslations");
        try {
            const translation = await this.translationFactory.loadTranslation(this.props.locale);
            this.setState({
                translation
            });
        } catch (error) {
            this.setState({
                translationError: JSON.stringify(error) || "An unknown error occurred"
            });

            return;
        }
        console.timeEnd("LoadTranslations");
    }
}

export default App;
