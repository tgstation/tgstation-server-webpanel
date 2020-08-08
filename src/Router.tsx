import { Route, Switch, withRouter } from "react-router-dom";
import { Component, ReactNode } from "react";
import { RouteComponentProps } from "react-router";
import Reload from "./components/utils/Reload";
import AccessDenied from "./components/utils/AccessDenied";
import Login from "./components/views/Login";
import ErrorBoundary from "./components/utils/ErrorBoundary";
import * as React from "react";
import RouteController from "./utils/RouteController";
import { AppRoute } from "./utils/routes";
import loadable, { LoadableComponent } from "@loadable/component";
import Loading from "./components/utils/Loading";
import { FormattedMessage } from "react-intl";

interface IState {
    loading: boolean;
    routes: Array<AppRoute>;
    components: Map<string, LoadableComponent<unknown>>;
}
interface IProps extends RouteComponentProps {
    loggedIn: boolean;
}

const LoadSpin = (page: string) => (
    <Loading text={"loading.page"}>
        <FormattedMessage id={page} />
    </Loading>
);

const NotFound = loadable(() => import("./components/views/NotFound"), {
    fallback: LoadSpin("loading.page.notfound")
});

export default withRouter(
    class Router extends Component<IProps, IState> {
        public constructor(props: IProps) {
            super(props);

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
                loading: false,
                routes: [],
                components: components
            };
        }

        public async componentDidMount() {
            RouteController.on("refreshAll", routes => {
                this.setState({
                    routes
                });
            });

            this.setState({
                routes: await RouteController.getRoutes(false)
            });
        }

        public render(): ReactNode {
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
                                                    Comp = this.state.components.get(route.name)!;
                                                }

                                                //@ts-expect-error //i cant for the life of me make this shit work so it has to stay like this.
                                                return <Comp {...props} />;
                                            }}
                                        />
                                    );
                                })}
                                <Route key="notfound">
                                    {this.props.loggedIn ? <NotFound /> : <Login />}
                                </Route>
                            </Switch>
                        </div>
                    </Reload>
                </ErrorBoundary>
            );
        }
    }
);
