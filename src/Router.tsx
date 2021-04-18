import loadable, { LoadableComponent } from "@loadable/component";
import * as React from "react";
import { Component, ComponentClass, ReactNode } from "react";
import Container from "react-bootstrap/Container";
import { FormattedMessage } from "react-intl";
import { RouteComponentProps, withRouter } from "react-router";
import { Route, Switch } from "react-router-dom";

import { OAuthProvider } from "./ApiClient/generatedcode/_enums";
import { CredentialsType } from "./ApiClient/models/ICredentials";
import InternalError, { ErrorCode } from "./ApiClient/models/InternalComms/InternalError";
import { StatusCode } from "./ApiClient/models/InternalComms/InternalStatus";
import ServerClient from "./ApiClient/ServerClient";
import AccessDenied from "./components/utils/AccessDenied";
import ErrorAlert from "./components/utils/ErrorAlert";
import ErrorBoundary from "./components/utils/ErrorBoundary";
import Loading from "./components/utils/Loading";
import Reload from "./components/utils/Reload";
import Login, { OAuthStateStorage } from "./components/views/Login";
import { GeneralContext, UnsafeGeneralContext } from "./contexts/GeneralContext";
import { MODE } from "./definitions/constants";
import { matchesPath } from "./utils/misc";
import RouteController from "./utils/RouteController";
import { AppRoute, AppRoutes, RouteData } from "./utils/routes";

interface IState {
    loading: boolean;
    routes: Array<AppRoute>;
    components: Map<string, LoadableComponent<unknown>>;
}
interface IProps extends RouteComponentProps {
    loggedIn: boolean;
    selectCategory: (category: string) => void;
}

const LoadSpin = (page: string) => (
    <Loading text={"loading.page"}>
        <FormattedMessage id={page} />
    </Loading>
);

const NotFound = loadable(() => import("./components/utils/NotFound"), {
    fallback: LoadSpin("loading.page.notfound")
});

class Router extends Component<IProps, IState> {
    public declare context: UnsafeGeneralContext;
    public constructor(props: IProps) {
        super(props);

        this.refreshListener = this.refreshListener.bind(this);

        const components = new Map<string, LoadableComponent<unknown>>();

        const routes = RouteController.getImmediateRoutes(false);
        routes.forEach(route => {
            components.set(
                route.name,
                //*should* always be a react component
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                loadable(() => import(`./components/views/${route.file}`), {
                    fallback: LoadSpin(route.name)
                })
            );
        });

        this.state = {
            loading: !!new URLSearchParams(window.location.search).get("state"),
            routes: RouteController.getImmediateRoutes(false),
            components: components
        };
    }

    private refreshListener(routes: Array<AppRoute>) {
        this.setState({
            routes
        });
    }

    public async componentDidMount() {
        RouteController.on("refreshAll", this.refreshListener);

        this.props.history.listen(location => {
            void this.listener(location.pathname);
        });
        this.listener(this.props.location.pathname);

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
        this.props.history.replace(oauthstate.url);

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
            return this.setErrorAndEnd(response.error);
        }
    }

    public componentWillUnmount(): void {
        RouteController.removeListener("refreshAll", this.refreshListener);
    }

    private setErrorAndEnd(error: InternalError<ErrorCode>) {
        RouteData.oautherrors = [error];
        this.setState({
            loading: false
        });
    }

    private listener(location: string) {
        const routes = RouteController.getImmediateRoutes(false);
        for (const route of routes) {
            if (route.category && route.navbarLoose && matchesPath(location, route.route)) {
                this.props.selectCategory(route.category);
                break;
            }
        }
    }

    public render(): ReactNode {
        if (this.state.loading) {
            return <Loading text="loading.app" />;
        }

        return (
            <ErrorBoundary>
                <Reload>
                    <div>
                        <Switch>
                            {this.state.routes.map(route => {
                                if (!route.loginless && !this.props.loggedIn) return;

                                return (
                                    <Route
                                        exact={!route.loose}
                                        path={route.route}
                                        key={route.name}
                                        render={props => {
                                            let Comp;

                                            if (!route.cachedAuth) {
                                                Comp = AccessDenied;
                                            } else {
                                                Comp = this.state.components.get(
                                                    route.name
                                                )! as ComponentClass;
                                            }

                                            return !this.context?.user && !route.loginless ? (
                                                <Container>
                                                    <ErrorAlert
                                                        error={
                                                            new InternalError(ErrorCode.APP_FAIL, {
                                                                jsError: Error(
                                                                    "Router has no user in the general context"
                                                                )
                                                            })
                                                        }
                                                    />
                                                </Container>
                                            ) : //Yeah I have no excuse for this, I didn't want to implement a route config option
                                            // to allow a single route to work without server info so i added it as a check here
                                            !this.context?.serverInfo &&
                                              route != AppRoutes.config ? (
                                                <Container>
                                                    <ErrorAlert
                                                        error={
                                                            new InternalError(ErrorCode.APP_FAIL, {
                                                                jsError: Error(
                                                                    "Router has no server info in the general context"
                                                                )
                                                            })
                                                        }
                                                    />
                                                </Container>
                                            ) : route.noContainer ? (
                                                <React.Fragment>
                                                    <Comp {...props} />
                                                </React.Fragment>
                                            ) : (
                                                <Container className="mt-5 mb-5">
                                                    <Comp {...props} />
                                                </Container>
                                            );
                                        }}
                                    />
                                );
                            })}
                            <Container className="mt-5 mb-5">
                                <Route key="notfound">
                                    {this.props.loggedIn ? <NotFound /> : <Login />}
                                </Route>
                            </Container>
                        </Switch>
                    </div>
                </Reload>
            </ErrorBoundary>
        );
    }
}
Router.contextType = GeneralContext;
export default withRouter(Router);
