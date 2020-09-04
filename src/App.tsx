import { hot } from "react-hot-loader/root";
import * as React from "react";
import { IntlProvider } from "react-intl";
import { BrowserRouter } from "react-router-dom";
import Container from "react-bootstrap/Container";

import IAppProps from "./IAppProps";

import ITranslation from "./translations/ITranslation";
import ITranslationFactory from "./translations/ITranslationFactory";
import TranslationFactory from "./translations/TranslationFactory";

import AppNavbar from "./components/AppNavbar";

import "./App.css";
import Loading from "./components/utils/Loading";
import { StatusCode } from "./ApiClient/models/InternalComms/InternalStatus";
import { ErrorCode } from "./ApiClient/models/InternalComms/InternalError";
import ServerClient from "./ApiClient/ServerClient";
import { getSavedCreds } from "./utils/misc";
import UserClient from "./ApiClient/UserClient";
import Router from "./Router";
import configOptions from "./ApiClient/util/config";
import LoginHooks from "./ApiClient/util/LoginHooks";

interface IState {
    translation?: ITranslation;
    translationError?: string;
    loggedIn: boolean;
    loading: boolean;
    autoLogin: boolean;
    passdownCat?: string;
}

class App extends React.Component<IAppProps, IState> {
    private readonly translationFactory: ITranslationFactory;

    public constructor(props: IAppProps) {
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
                <BrowserRouter basename={configOptions.basepath.value as string}>
                    <AppNavbar category={this.state.passdownCat} />
                    <Container className="mt-5 mb-5">
                        {this.state.loading ? (
                            <Loading text="loading.app" />
                        ) : this.state.autoLogin && !this.state.loggedIn ? (
                            <Loading text="loading.app" />
                        ) : (
                            <Router
                                loggedIn={this.state.loggedIn}
                                selectCategory={cat => {
                                    this.setState({
                                        passdownCat: cat
                                    });
                                }}
                            />
                        )}
                    </Container>
                </BrowserRouter>
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
