import { hot } from "react-hot-loader/root";
import * as React from "react";
import { FormattedMessage, IntlProvider } from "react-intl";
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
import { AppRoute } from "./utils/routes";
import AccessDenied from "./components/utils/AccessDenied";
import UserClient from "./ApiClient/UserClient";
interface IState {
    translation?: ITranslation;
    translationError?: string;
    loggedIn: boolean;
    loading: boolean;
    autoLogin: boolean;
    routes: Array<AppRoute>;
}

const LoadSpin = (page: string) => (
    <Loading text={"loading.page"}>
        <FormattedMessage id={page} />
    </Loading>
);

const NotFound = loadable(() => import("./components/views/NotFound"), {
    fallback: LoadSpin("loading.page.notfound")
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
                loadable(() => import(`./components/views/${route.file}`), {
                    fallback: LoadSpin(route.name)
                })
            );
        });

        this.state = {
            loggedIn: false,
            loading: true,
            autoLogin: false,
            routes: []
        };
    }
    public async componentDidMount(): Promise<void> {
        ServerClient.on("loginSuccess", () => {
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
        this.setState({
            routes: await RouteController.getRoutes(true, false)
        });

        RouteController.on("refreshAll", routes => {
            this.setState({
                routes
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
                        window.sessionStorage.removeItem("username");
                        window.sessionStorage.removeItem("password");
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
                <BrowserRouter basename={BASEPATH}>
                    <AppNavbar />
                    <Container className="mt-5 mb-5">
                        {this.state.loading ? (
                            <Loading text="loading.app" />
                        ) : this.state.autoLogin && !this.state.loggedIn ? (
                            <Loading text="loading.app" />
                        ) : (
                            <ErrorBoundary>
                                <Reload>
                                    <Switch>
                                        {this.state.routes.map(route => {
                                            if (!route.loginless && !this.state.loggedIn) return;

                                            return (
                                                <Route
                                                    key={route.name}
                                                    exact={!route.loose}
                                                    path={route.route}
                                                    render={props => {
                                                        let Comp;

                                                        if (!route.cachedAuth) {
                                                            Comp = AccessDenied;
                                                        } else {
                                                            Comp = this.components.get(route.name)!;
                                                        }

                                                        //@ts-expect-error //i cant for the life of me make this shit work so it has to stay like this.
                                                        return <Comp {...props} />;
                                                    }}
                                                />
                                            );
                                        })}
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
