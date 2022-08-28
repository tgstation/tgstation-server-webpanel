import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import { NavDropdown } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Dropdown from "react-bootstrap/Dropdown";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { FormattedMessage } from "react-intl";
import { RouteComponentProps, withRouter } from "react-router";

import ServerClient from "../ApiClient/ServerClient";
import CredentialsProvider from "../ApiClient/util/CredentialsProvider";
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
            loggedIn: !!CredentialsProvider.isTokenValid(),
            routes: [],
            categories: AppCategories
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
                        <Nav>
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
                                    return cat.routes.length == 1 ? (
                                        <Nav.Item key={cat.name}>
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
                                    ) : (
                                        <Nav.Item key={cat.name}>
                                            <NavDropdown
                                                id={cat.name + "-dropdown"}
                                                title={<FormattedMessage id={cat.leader.name} />}>
                                                {Object.values(cat.routes).filter(
                                                    value => value.cachedAuth
                                                ).length >= 2 ? (
                                                    <React.Fragment>
                                                        <NavDropdown.Item
                                                            onClick={() => {
                                                                this.props.history.push(
                                                                    cat.leader.link ??
                                                                        cat.leader.route,
                                                                    { reload: true }
                                                                );
                                                            }}
                                                            active={matchesPath(
                                                                this.props.location.pathname,
                                                                cat.leader.route,
                                                                true
                                                            )}>
                                                            <FormattedMessage
                                                                id={cat.leader.name}
                                                            />
                                                        </NavDropdown.Item>
                                                        {cat.routes.map(val => {
                                                            if (val.catleader) return; //we already display this but differently
                                                            if (!val.cachedAuth) return;
                                                            if (!val.visibleNavbar) return;

                                                            return (
                                                                <NavDropdown.Item
                                                                    key={val.name}
                                                                    onClick={() => {
                                                                        this.props.history.push(
                                                                            val.link ?? val.route,
                                                                            {
                                                                                reload: true
                                                                            }
                                                                        );
                                                                    }}
                                                                    active={matchesPath(
                                                                        this.props.location
                                                                            .pathname,
                                                                        val.route,
                                                                        !val.navbarLoose
                                                                    )}>
                                                                    <FormattedMessage
                                                                        id={val.name}
                                                                    />
                                                                </NavDropdown.Item>
                                                            );
                                                        })}
                                                    </React.Fragment>
                                                ) : (
                                                    ""
                                                )}
                                            </NavDropdown>
                                        </Nav.Item>
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
