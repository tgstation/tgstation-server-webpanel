import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import Button from "react-bootstrap/Button";
import Dropdown from "react-bootstrap/Dropdown";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { FormattedMessage } from "react-intl";
import { RouteComponentProps, withRouter } from "react-router";
import CSSTransition from "react-transition-group/CSSTransition";

import ServerClient from "../ApiClient/ServerClient";
import AuthController from "../ApiClient/util/AuthController";
import LoginHooks from "../ApiClient/util/LoginHooks";
import { GeneralContext, UnsafeGeneralContext } from "../contexts/GeneralContext";
import { matchesPath } from "../utils/misc";
import RouteController from "../utils/RouteController";
import { AppCategories, AppRoute, AppRoutes } from "../utils/routes";

interface IProps extends RouteComponentProps {
    category?: {
        name: string;
        key: string;
    };
}

interface IState {
    loggedIn: boolean;
    //so we dont actually use the routes but it allows us to make react update the component
    routes: AppRoute[];
    categories: typeof AppCategories;
    focusedCategory: string;
    focusTimer?: number;
}

class AppNavbar extends React.Component<IProps, IState> {
    public declare context: UnsafeGeneralContext;

    public constructor(props: IProps) {
        super(props);
        this.logoutClick = this.logoutClick.bind(this);
        this.loginSuccess = this.loginSuccess.bind(this);
        this.logout = this.logout.bind(this);
        this.refresh = this.refresh.bind(this);

        this.state = {
            loggedIn: AuthController.isTokenValid(),
            routes: [],
            categories: AppCategories,
            focusedCategory: this.props.category?.name ?? ""
        };
    }

    private loginSuccess() {
        this.setState({
            loggedIn: true
        });
    }

    private logout() {
        this.setState({
            loggedIn: false
        });
    }

    private refresh(routes: Array<AppRoute>) {
        this.setState({
            routes
        });
    }

    public async componentDidMount(): Promise<void> {
        LoginHooks.on("loginSuccess", this.loginSuccess);
        ServerClient.on("logout", this.logout);

        this.setState({
            routes: await RouteController.getRoutes()
        });

        RouteController.on("refresh", this.refresh);
    }

    public componentWillUnmount(): void {
        LoginHooks.removeListener("loginSuccess", this.loginSuccess);
        ServerClient.removeListener("logout", this.logout);
        RouteController.removeListener("refresh", this.refresh);
    }

    public componentDidUpdate(prevProps: Readonly<IProps>): void {
        if (
            this.props.category !== undefined &&
            this.props.category.key !== prevProps.category?.key
        ) {
            this.setState({
                focusedCategory: this.props.category.name
            });
        }
    }

    public render(): React.ReactNode {
        return (
            <React.Fragment>
                <Navbar
                    className="shadow-lg"
                    expand={this.state.loggedIn ? "lg" : undefined}
                    collapseOnSelect
                    variant="dark"
                    bg="primary">
                    <Navbar.Brand
                        onClick={() => {
                            this.props.history.push(AppRoutes.home.link ?? AppRoutes.home.route, {
                                reload: true
                            });
                        }}
                        className="mr-auto">
                        {this.renderVersion()}
                    </Navbar.Brand>
                    <Navbar.Toggle className="mr-2" aria-controls="responsive-navbar-nav" />
                    <Navbar.Collapse className="text-right mr-2" style={{ minWidth: "0px" }}>
                        <Nav className="mr-auto overflow-auto fancyscroll">
                            {!this.state.loggedIn ? (
                                <Nav.Item>
                                    <Nav.Link
                                        onClick={() => {
                                            this.props.history.push(
                                                AppRoutes.home.link ?? AppRoutes.home.route,
                                                { reload: true }
                                            );
                                        }}
                                        active={true}>
                                        <FormattedMessage id="routes.login" />
                                    </Nav.Link>
                                </Nav.Item>
                            ) : (
                                Object.values(this.state.categories).map(cat => {
                                    if (!cat.leader.cachedAuth) return;
                                    return (
                                        <div
                                            key={cat.name}
                                            className="d-flex"
                                            onMouseEnter={() => {
                                                const timer = window.setTimeout(() => {
                                                    this.setState({
                                                        focusedCategory: cat.name,
                                                        focusTimer: undefined
                                                    });
                                                }, 130);
                                                this.setState({
                                                    focusTimer: timer
                                                });
                                            }}
                                            onMouseLeave={() => {
                                                window.clearTimeout(this.state.focusTimer);
                                                this.setState({
                                                    focusTimer: undefined
                                                });
                                            }}
                                            onClick={() => {
                                                window.clearTimeout(this.state.focusTimer);
                                                this.setState({
                                                    focusedCategory: cat.name,
                                                    focusTimer: undefined
                                                });
                                            }}>
                                            <Nav.Item>
                                                <Nav.Link
                                                    onClick={() => {
                                                        this.props.history.push(
                                                            cat.leader.link ?? cat.leader.route,
                                                            { reload: true }
                                                        );
                                                    }}
                                                    active={matchesPath(
                                                        this.props.location.pathname,
                                                        cat.leader.route,
                                                        !cat.leader.navbarLoose
                                                    )}>
                                                    <FormattedMessage id={cat.leader.name} />
                                                </Nav.Link>
                                            </Nav.Item>
                                            {Object.values(cat.routes).filter(
                                                value => value.cachedAuth
                                            ).length >= 2 ? (
                                                <CSSTransition
                                                    in={this.state.focusedCategory === cat.name}
                                                    classNames="anim-collapse"
                                                    className="nowrap anim-collapse-all"
                                                    addEndListener={(node, done) => {
                                                        node.addEventListener(
                                                            "transitionend",
                                                            done,
                                                            false
                                                        );
                                                    }}
                                                    onMouseEnter={() => {
                                                        this.setState({
                                                            focusedCategory: cat.name
                                                        });
                                                    }}>
                                                    <div>
                                                        <Nav>
                                                            <div className="py-2 d-none d-lg-inline">
                                                                <FontAwesomeIcon icon="angle-right" />
                                                            </div>
                                                            <Nav className="bg-darkblue mx-1 rounded">
                                                                {cat.routes.map(val => {
                                                                    if (val.catleader) return; //we already display this but differently
                                                                    if (!val.cachedAuth) return;
                                                                    if (!val.visibleNavbar) return;

                                                                    return (
                                                                        <Nav.Item key={val.name}>
                                                                            <Nav.Link
                                                                                onClick={() => {
                                                                                    this.props.history.push(
                                                                                        val.link ??
                                                                                            val.route,
                                                                                        {
                                                                                            reload: true
                                                                                        }
                                                                                    );
                                                                                }}
                                                                                active={matchesPath(
                                                                                    this.props
                                                                                        .location
                                                                                        .pathname,
                                                                                    val.route,
                                                                                    !val.navbarLoose
                                                                                )}>
                                                                                <FormattedMessage
                                                                                    id={val.name}
                                                                                />
                                                                            </Nav.Link>
                                                                        </Nav.Item>
                                                                    );
                                                                })}

                                                                <div className="py-2 d-none d-lg-inline mr-1">
                                                                    <FontAwesomeIcon icon="grip-lines-vertical" />
                                                                </div>
                                                            </Nav>
                                                        </Nav>
                                                    </div>
                                                </CSSTransition>
                                            ) : (
                                                ""
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </Nav>
                        {this.renderUser()}
                    </Navbar.Collapse>
                </Navbar>
            </React.Fragment>
        );
    }

    private renderVersion(): React.ReactNode {
        if (!this.context.serverInfo?.version) {
            return <FormattedMessage id="loading.loading" />;
        }

        return (
            <React.Fragment>
                <FormattedMessage id="generic.appname" />
                {" v"}
                {this.context.serverInfo.version}
            </React.Fragment>
        );
    }

    private renderUser(): React.ReactNode {
        if (!this.state.loggedIn)
            return (
                <React.Fragment>
                    <Button
                        onClick={() => {
                            this.props.history.push(
                                AppRoutes.config.link ?? AppRoutes.config.route,
                                { reload: true }
                            );
                        }}
                        variant="primary">
                        <FontAwesomeIcon icon="cogs" />
                    </Button>
                    <Button
                        onClick={() => {
                            this.props.history.push(AppRoutes.info.link ?? AppRoutes.info.route, {
                                reload: true
                            });
                        }}
                        variant="primary">
                        <FontAwesomeIcon icon="info-circle" />
                    </Button>
                </React.Fragment>
            );

        return (
            <Nav.Item className="ml-auto">
                <Dropdown>
                    <Dropdown.Toggle
                        id="user-dropdown"
                        type="button"
                        variant="primary"
                        data-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="false">
                        {this.context.user ? (
                            this.context.user.name
                        ) : (
                            <FormattedMessage id="loading.loading" />
                        )}
                    </Dropdown.Toggle>
                    <Dropdown.Menu alignRight className="text-right">
                        <Dropdown.Item
                            onClick={() => {
                                this.props.history.push(
                                    AppRoutes.info.link ?? AppRoutes.info.route,
                                    { reload: true }
                                );
                            }}>
                            <FormattedMessage id="routes.info" />
                        </Dropdown.Item>
                        <Dropdown.Item
                            onClick={() => {
                                this.props.history.push(
                                    AppRoutes.config.link ?? AppRoutes.config.route,
                                    { reload: true }
                                );
                            }}>
                            <FormattedMessage id="routes.config" />
                        </Dropdown.Item>
                        {AppRoutes.passwd.cachedAuth ? (
                            <Dropdown.Item
                                onClick={() => {
                                    this.props.history.push(
                                        AppRoutes.passwd.link ?? AppRoutes.passwd.route,
                                        { reload: true }
                                    );
                                }}>
                                <FormattedMessage id="routes.passwd" />
                            </Dropdown.Item>
                        ) : (
                            ""
                        )}
                        <Dropdown.Item
                            onClick={() => {
                                ServerClient.emit("purgeCache");
                                this.props.history.replace(this.props.location.pathname, {
                                    reload: true
                                });
                            }}>
                            <FormattedMessage id="navbar.purgecache" />
                        </Dropdown.Item>
                        <Dropdown.Item
                            onClick={() => {
                                this.props.history.replace(this.props.location.pathname, {
                                    reload: true
                                });
                            }}>
                            <FormattedMessage id="navbar.refresh" />
                        </Dropdown.Item>
                        <Dropdown.Item onClick={this.logoutClick}>
                            <FormattedMessage id="navbar.logout" />
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </Nav.Item>
        );
    }

    private logoutClick(): void {
        ServerClient.logout();
    }
}
AppNavbar.contextType = GeneralContext;
export default withRouter(AppNavbar);
