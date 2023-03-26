import "./AppNavbar.css";

import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { NavDropdown, OverlayTrigger, Tooltip } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Dropdown from "react-bootstrap/Dropdown";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { FormattedMessage } from "react-intl";
import { RouteComponentProps, withRouter } from "react-router";
import { SemVer } from "semver";

import AdminClient from "../ApiClient/AdminClient";
import { AdministrationRights } from "../ApiClient/generatedcode/generated";
import { StatusCode } from "../ApiClient/models/InternalComms/InternalStatus";
import ServerClient from "../ApiClient/ServerClient";
import UserClient from "../ApiClient/UserClient";
import CredentialsProvider from "../ApiClient/util/CredentialsProvider";
import LoginHooks from "../ApiClient/util/LoginHooks";
import { GeneralContext, UnsafeGeneralContext } from "../contexts/GeneralContext";
import { hasAdminRight, matchesPath, resolvePermissionSet } from "../utils/misc";
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
    updateAvailable: boolean;
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
            categories: AppCategories,
            updateAvailable: false
        };
    }

    private loginSuccess(): void {
        this.setState({
            loggedIn: true
        });

        void this.checkShowServerUpdateIcon();
    }

    private async checkShowServerUpdateIcon(): Promise<void> {
        await ServerClient.wait4Init();
        const userResponse = await UserClient.getCurrentUser();
        if (userResponse.code === StatusCode.ERROR) return;

        const user = userResponse.payload;

        const permissionSet = resolvePermissionSet(user);
        if (hasAdminRight(permissionSet, AdministrationRights.ChangeVersion)) {
            const response = await AdminClient.getAdminInfo();
            if (response.code == StatusCode.OK) {
                const latestVersion = new SemVer(response.payload.latestVersion);
                const currentVersion = new SemVer(this.context.serverInfo!.version);

                const updateAvailable = latestVersion.compare(currentVersion) === 1;

                this.setState({
                    updateAvailable
                });
            }
        }
    }

    private logout() {
        this.setState({
            loggedIn: false,
            updateAvailable: false
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
                        {this.state.updateAvailable ? (
                            <OverlayTrigger
                                placement="right"
                                overlay={props => (
                                    <Tooltip id="tgs-updated-tooltip" {...props}>
                                        <FormattedMessage id="navbar.update" />
                                    </Tooltip>
                                )}>
                                <h3>
                                    <FontAwesomeIcon
                                        className="tgs-update-notification"
                                        onClick={() =>
                                            this.props.history.push(
                                                AppRoutes.admin_update.link ??
                                                    AppRoutes.admin_update.route,
                                                { reload: true }
                                            )
                                        }
                                        icon={faExclamationCircle}
                                    />
                                </h3>
                            </OverlayTrigger>
                        ) : (
                            <React.Fragment />
                        )}
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
