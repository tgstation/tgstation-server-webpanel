import "./App.css";

import * as React from "react";
import Container from "react-bootstrap/Container";
import { hot } from "react-hot-loader/root";
import { IntlProvider } from "react-intl";
import { BrowserRouter } from "react-router-dom";

import { ErrorCode } from "./ApiClient/models/InternalComms/InternalError";
import { StatusCode } from "./ApiClient/models/InternalComms/InternalStatus";
import ServerClient from "./ApiClient/ServerClient";
import UserClient from "./ApiClient/UserClient";
import LoginHooks from "./ApiClient/util/LoginHooks";
import AppNavbar from "./components/AppNavbar";
import ErrorBoundary from "./components/utils/ErrorBoundary";
import JobsList from "./components/utils/JobsList";
import Loading from "./components/utils/Loading";
import Router from "./Router";
import ITranslation from "./translations/ITranslation";
import ITranslationFactory from "./translations/ITranslationFactory";
import TranslationFactory from "./translations/TranslationFactory";
import { getSavedCreds } from "./utils/misc";

interface IState {
    translation?: ITranslation;
    translationError?: string;
    loggedIn: boolean;
    loading: boolean;
    autoLogin: boolean;
}

interface IProps {
    readonly locale: string;
    readonly translationFactory?: ITranslationFactory;
}

interface InnerProps {
    loading: boolean;
    autoLogin: boolean;
    loggedIn: boolean;
}

interface InnerState {
    passdownCat?: { name: string; key: string };
}

class InnerApp extends React.Component<InnerProps, InnerState> {
    constructor(props: InnerProps) {
        super(props);

        this.state = {};
    }
    public render(): React.ReactNode {
        return (
            <BrowserRouter basename={DEFAULT_BASEPATH}>
                <ErrorBoundary>
                    <AppNavbar category={this.state.passdownCat} />
                    <Container className="mt-5 mb-5">
                        {this.props.loading ? (
                            <Loading text="loading.app" />
                        ) : this.props.autoLogin && !this.props.loggedIn ? (
                            <Loading text="loading.login" />
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
                    </Container>
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
            loading: true,
            autoLogin: false
        };
    }

    public async componentDidMount(): Promise<void> {
        LoginHooks.on("loginSuccess", () => {
            console.log("Logging in");

            void UserClient.getCurrentUser(); //preload the user, we dont particularly care about the content, just that its preloaded
            this.setState({
                loggedIn: true,
                loading: false,
                autoLogin: false
            });
        });
        ServerClient.on("logout", () => {
            this.setState({
                loggedIn: false
            });
        });

        await this.loadTranslation();
        await ServerClient.initApi();

        const [usr, pwd] = getSavedCreds() || [undefined, undefined];

        const autoLogin = !!(usr && pwd);
        if (autoLogin) console.log("Logging in with saved credentials");

        this.setState({
            loading: false,
            autoLogin: autoLogin
        });
        if (autoLogin) {
            const res = await ServerClient.login({ userName: usr!, password: pwd! });
            if (res.code == StatusCode.ERROR) {
                this.setState({
                    autoLogin: false
                });
                if (
                    res.error?.code == ErrorCode.LOGIN_DISABLED ||
                    res.error?.code == ErrorCode.LOGIN_FAIL
                ) {
                    try {
                        window.localStorage.removeItem("username");
                        window.localStorage.removeItem("password");
                    } catch (e) {
                        // eslint-disable-next-line @typescript-eslint/no-empty-function
                        (() => {})(); //noop
                    }
                }
            }
        }
    }

    public render(): React.ReactNode {
        if (this.state.translationError != null)
            return <p className="App-error">{this.state.translationError}</p>;

        if (this.state.translation == null) return <Loading>Loading translations...</Loading>;
        return (
            <IntlProvider
                locale={this.state.translation.locale}
                messages={this.state.translation.messages}>
                <InnerApp
                    loading={this.state.loading}
                    autoLogin={this.state.autoLogin}
                    loggedIn={this.state.loggedIn}
                />
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

export default hot(App);
