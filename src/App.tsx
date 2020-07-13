import { hot } from "react-hot-loader/root";
import * as React from "react";
import { IntlProvider } from "react-intl";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import Container from "react-bootstrap/Container";

import IAppProps from "./IAppProps";

import ITranslation from "./translations/ITranslation";
import ITranslationFactory from "./translations/ITranslationFactory";
import TranslationFactory from "./translations/TranslationFactory";

import Login from "./components/views/Login";
import AppNavbar from "./components/AppNavbar";

import "./App.css";
import loadable from "@loadable/component";
import { AppRoutes } from "./utils/routes";
import ErrorBoundary from "./components/utils/ErrorBoundary";
import Loading from "./components/utils/Loading";
import Reload from "./components/utils/Reload";
import { StatusCode } from "./ApiClient/models/InternalComms/InternalStatus";
import { ErrorCode } from "./ApiClient/models/InternalComms/InternalError";
import ServerClient from "./ApiClient/ServerClient";
interface IState {
    translation?: ITranslation;
    translationError?: string;
    loggedIn: boolean;
    loading: boolean;
}

const LoadSpin = <Loading />;

const Home = loadable(() => import("./components/views/Home"), {
    fallback: LoadSpin
});
const Administration = loadable(() => import("./components/views/Administration"), {
    fallback: LoadSpin
});
const Configuration = loadable(() => import("./components/views/Configuration"), {
    fallback: LoadSpin
});
const NotFound = loadable(() => import("./components/views/NotFound"), {
    fallback: LoadSpin
});

class App extends React.Component<IAppProps, IState> {
    private readonly translationFactory: ITranslationFactory;

    public constructor(props: IAppProps) {
        super(props);

        this.translationFactory = this.props.translationFactory || new TranslationFactory();

        this.state = {
            loggedIn: false,
            loading: true
        };
    }
    public async componentDidMount(): Promise<void> {
        ServerClient.on("loginSuccess", () => {
            console.log("Logging in");
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

        await Promise.all([this.loadTranslation(), ServerClient.wait4Init()]);

        let usr: string | null = null;
        let pwd: string | null = null;
        try {
            //private browsing on safari can throw when using storage
            usr =
                window.sessionStorage.getItem("username") ||
                window.localStorage.getItem("username");
            pwd =
                window.sessionStorage.getItem("password") ||
                window.localStorage.getItem("password");
        } catch (e) {
            (() => {})(); //noop
        }

        if (usr && pwd) {
            const res = await ServerClient.login({ userName: usr, password: pwd });
            if (res.code == StatusCode.ERROR) {
                this.setState({
                    loading: false
                });
                if (
                    res.error?.code == ErrorCode.LOGIN_DISABLED ||
                    res.error?.code == ErrorCode.LOGIN_FAIL
                ) {
                    try {
                        window.localStorage.removeItem("username");
                        window.localStorage.removeItem("password");
                        window.sessionStorage.removeItem("username");
                        window.sessionStorage.removeItem("password");
                    } catch (e) {
                        (() => {})(); //noop
                    }
                }
            }
        } else {
            this.setState({
                loading: false
            });
        }
    }

    public render(): React.ReactNode {
        if (this.state.translationError != null)
            return <p className="App-error">{this.state.translationError}</p>;

        if (this.state.translation == null) return <Loading />;
        return (
            <IntlProvider
                locale={this.state.translation.locale}
                messages={this.state.translation.messages}>
                <BrowserRouter basename={BASEPATH}>
                    <AppNavbar />
                    <Container className="mt-5 mb-5">
                        {this.state.loading ? (
                            <Loading />
                        ) : (
                            <ErrorBoundary>
                                <Reload>
                                    {this.state.loggedIn ? (
                                        <Switch>
                                            <Route exact path={AppRoutes.home.route}>
                                                <Home />
                                            </Route>
                                            <Route path={AppRoutes.admin.route}>
                                                <Administration />
                                            </Route>
                                            <Route path={AppRoutes.config.route}>
                                                <Configuration />
                                            </Route>
                                            <Route>
                                                <NotFound />
                                            </Route>
                                        </Switch>
                                    ) : (
                                        <Login />
                                    )}
                                </Reload>
                            </ErrorBoundary>
                        )}
                    </Container>
                </BrowserRouter>
            </IntlProvider>
        );
    }

    private async loadTranslation(): Promise<void> {
        try {
            const translation = await this.translationFactory.loadTranslation(this.props.locale);
            this.setState({
                translation
            });
        } catch (error) {
            this.setState({
                translationError: error || "An unknown error occurred"
            });

            return;
        }
    }
}

export default hot(App);
