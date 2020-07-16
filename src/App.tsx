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
import loadable, { LoadableComponent } from "@loadable/component";
import ErrorBoundary from "./components/utils/ErrorBoundary";
import Loading from "./components/utils/Loading";
import Reload from "./components/utils/Reload";
import { StatusCode } from "./ApiClient/models/InternalComms/InternalStatus";
import { ErrorCode } from "./ApiClient/models/InternalComms/InternalError";
import ServerClient from "./ApiClient/ServerClient";
import RouteController from "./utils/RouteController";
import { getSavedCreds } from "./utils/misc";
interface IState {
    translation?: ITranslation;
    translationError?: string;
    loggedIn: boolean;
    loading: boolean;
}

const LoadSpin = <Loading />;

const NotFound = loadable(() => import("./components/views/NotFound"), {
    fallback: LoadSpin
});

class App extends React.Component<IAppProps, IState> {
    private readonly translationFactory: ITranslationFactory;
    private readonly components: Map<string, LoadableComponent<unknown>>;

    public constructor(props: IAppProps) {
        super(props);

        this.translationFactory = this.props.translationFactory || new TranslationFactory();
        this.components = new Map<string, LoadableComponent<unknown>>();

        const routes = RouteController.getImmediateRoutes(true, false);
        routes.forEach(route => {
            this.components.set(
                route.name,
                //*should* always be a react component
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                loadable(() => import(`./components/views/${route.file}`), { fallback: LoadSpin })
            );
        });

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

        const [usr, pwd] = getSavedCreds() || [undefined, undefined];

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
                        // eslint-disable-next-line @typescript-eslint/no-empty-function
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
                                    <Switch>
                                        {RouteController.getImmediateRoutes(true, false).map(
                                            route => {
                                                if (!route.loginless && !this.state.loggedIn)
                                                    return;

                                                return (
                                                    <Route
                                                        key={route.name}
                                                        exact={route.exact}
                                                        path={route.route}
                                                        render={() => {
                                                            return React.createElement(
                                                                this.components.get(route.name)!
                                                            );
                                                        }}
                                                    />
                                                );
                                            }
                                        )}
                                        <Route>
                                            {this.state.loggedIn ? <NotFound /> : <Login />}
                                        </Route>
                                    </Switch>
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
                translationError: JSON.stringify(error) || "An unknown error occurred"
            });

            return;
        }
    }
}

export default hot(App);
