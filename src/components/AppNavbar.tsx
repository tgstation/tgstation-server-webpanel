import * as React from "react";
import { NavLink, Link } from "react-router-dom";
import { FormattedMessage } from "react-intl";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Dropdown from "react-bootstrap/Dropdown";
import Button from "react-bootstrap/Button";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AppRoutes, AppRoute } from "../utils/routes";
import { Components } from "../ApiClient/generatedcode/_generated";
import RouteController from "../utils/RouteController";
import { withRouter, RouteComponentProps } from "react-router";
import UserClient from "../ApiClient/UserClient";
import ServerClient from "../ApiClient/ServerClient";
import LoginHooks from "../ApiClient/util/LoginHooks";

interface IProps extends RouteComponentProps {}

interface IState {
    currentUser?: Components.Schemas.User;
    serverInformation?: Components.Schemas.ServerInformation;
    userNameError?: string;
    serverInfoError?: string;
    loggedIn: boolean;
    routes: Array<AppRoute>;
}
export default withRouter(
    class AppNavbar extends React.Component<IProps, IState> {
        public constructor(props: IProps) {
            super(props);
            this.logoutClick = this.logoutClick.bind(this);
            this.loadServerInformation = this.loadServerInformation.bind(this);
            this.loadUserInformation = this.loadUserInformation.bind(this);

            this.state = {
                loggedIn: false,
                routes: []
            };
        }

        //mamamia, memory leaks go brrrrrrrrrrrr dont they?
        //well you see, this component never gets normally unloaded so i dont give a fuck!
        public async componentDidMount(): Promise<void> {
            LoginHooks.addHook(this.loadServerInformation);
            ServerClient.on("loadServerInfo", serverInfo => {
                this.setState({
                    serverInformation: serverInfo.payload
                });
            });

            LoginHooks.addHook(this.loadUserInformation);
            UserClient.on("loadUserInfo", user => {
                this.setState({
                    currentUser: user.payload
                });
            });

            ServerClient.on("loginSuccess", () => {
                this.setState({
                    loggedIn: true
                });
            });
            ServerClient.on("logout", () => {
                this.setState({
                    loggedIn: false
                });
            });

            this.setState({
                routes: await RouteController.getRoutes()
            });

            RouteController.on("refresh", routes => {
                this.setState({
                    routes
                });
            });
        }

        public render(): React.ReactNode {
            return (
                <Navbar
                    className="shadow-lg"
                    expand={this.state.loggedIn ? "md" : undefined}
                    collapseOnSelect
                    variant="dark"
                    bg={
                        this.state.userNameError || this.state.serverInfoError
                            ? "danger"
                            : "primary"
                    }>
                    <Navbar.Brand as={NavLink} to={AppRoutes.home.route} className="mr-auto">
                        {this.renderVersion()}
                    </Navbar.Brand>
                    <Navbar.Toggle className="mr-2" aria-controls="responsive-navbar-nav" />
                    <Navbar.Collapse className="text-right mr-2">
                        <Nav className="mr-auto">
                            {!this.state.loggedIn ? (
                                <Nav.Item>
                                    <Nav.Link
                                        as={NavLink}
                                        to={AppRoutes.home.route}
                                        isActive={() => true}>
                                        <FormattedMessage id="routes.login" />
                                    </Nav.Link>
                                </Nav.Item>
                            ) : (
                                this.state.routes.map(val => {
                                    if (!val) return;
                                    if (!val.visibleNavbar) return;

                                    return (
                                        <Nav.Item key={val.route}>
                                            <Nav.Link
                                                as={NavLink}
                                                to={val.route}
                                                activeClassName="active"
                                                exact={!val.navbarLoose}>
                                                <FormattedMessage id={val.name} />
                                            </Nav.Link>
                                        </Nav.Item>
                                    );
                                })
                            )}
                        </Nav>
                        {this.renderUser()}
                    </Navbar.Collapse>
                </Navbar>
            );
        }

        private renderVersion(): React.ReactNode {
            if (!this.state.loggedIn) {
                return `tgstation-server`;
            }
            if (this.state.serverInfoError)
                return (
                    <div>
                        <div className="align-top d-inline-block px-1">
                            <FontAwesomeIcon icon="exclamation-circle" />
                        </div>
                        <div className="d-inline-block">
                            <FormattedMessage id="navbar.server_error" />
                            {": "}
                            <FormattedMessage id={this.state.serverInfoError} />
                        </div>
                    </div>
                );
            if (this.state.serverInformation)
                return `tgstation-server v${this.state.serverInformation.version!}`;

            return "loading"; //TODO: add a spinner;
        }

        private renderUser(): React.ReactNode {
            if (!this.state.loggedIn)
                return (
                    <Button
                        as={Link}
                        to={AppRoutes.config.route}
                        variant={
                            this.state.serverInfoError || this.state.userNameError
                                ? "danger"
                                : "primary"
                        }>
                        <FontAwesomeIcon icon="cogs" />
                    </Button>
                );

            return (
                <Nav.Item className="ml-auto">
                    <Dropdown>
                        <Dropdown.Toggle
                            id="user-dropdown"
                            type="button"
                            variant={
                                this.state.serverInfoError || this.state.userNameError
                                    ? "danger"
                                    : "primary"
                            }
                            data-toggle="dropdown"
                            aria-haspopup="true"
                            aria-expanded="false">
                            {this.state.userNameError ? (
                                <div>
                                    <div className="align-top d-inline-block px-1">
                                        <FontAwesomeIcon icon="exclamation-circle" />
                                    </div>
                                    <div className="d-inline-block">
                                        <FormattedMessage id="navbar.user_error" />
                                        {": "}
                                        <FormattedMessage id={this.state.userNameError} />
                                    </div>
                                </div>
                            ) : this.state.currentUser ? (
                                this.state.currentUser.name
                            ) : (
                                "loading" //TODO: add spinner
                            )}
                        </Dropdown.Toggle>
                        <Dropdown.Menu alignRight className="text-right">
                            <Dropdown.Item as={Link} to={AppRoutes.config.route}>
                                <FormattedMessage id="routes.config" />
                            </Dropdown.Item>
                            <Dropdown.Item
                                onClick={() => {
                                    ServerClient.emit("purgeCache");
                                }}>
                                <FormattedMessage id="navbar.purgecache" />
                            </Dropdown.Item>
                            <Dropdown.Item
                                onClick={() => {
                                    this.props.history.push(this.props.location.pathname);
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

        private async loadServerInformation(): Promise<void> {
            const info = await ServerClient.getServerInfo();
            this.setState({
                serverInformation: info.payload,
                serverInfoError: info.error?.code as string
            });
        }

        private async loadUserInformation(): Promise<void> {
            const response = await UserClient.getCurrentUser();
            this.setState({
                currentUser: response.payload,
                userNameError: response.error?.code as string
            });
        }
    }
);
