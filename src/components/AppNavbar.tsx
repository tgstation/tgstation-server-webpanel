import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import Button from "react-bootstrap/Button";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import Modal from "react-bootstrap/Modal";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { FormattedMessage } from "react-intl";
import { RouteComponentProps, withRouter } from "react-router";

import { Components } from "../ApiClient/generatedcode/_generated";
import InternalError, { GenericErrors } from "../ApiClient/models/InternalComms/InternalError";
import InternalStatus, { StatusCode } from "../ApiClient/models/InternalComms/InternalStatus";
import ServerClient, { ServerInfoErrors } from "../ApiClient/ServerClient";
import UserClient from "../ApiClient/UserClient";
import CredentialsProvider from "../ApiClient/util/CredentialsProvider";
import LoginHooks from "../ApiClient/util/LoginHooks";
import TGLogo from "../images/tglogo-white.svg";
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
    currentUser: Components.Schemas.UserResponse | null;
    serverInformation: Components.Schemas.ServerInformationResponse | null;
    userNameError: InternalError<GenericErrors> | null;
    serverInfoError: InternalError<ServerInfoErrors> | null;
    loggedIn: boolean;
    //so we dont actually use the routes but it allows us to make react update the component
    routes: AppRoute[];
    categories: typeof AppCategories;
    focusedCategory: string;
    focusTimer?: number;
    logout_modal: boolean;
}

export default withRouter(
    class AppNavbar extends React.Component<IProps, IState> {
        public constructor(props: IProps) {
            super(props);
            this.logoutClick = this.logoutClick.bind(this);
            this.loadServerInformation = this.loadServerInformation.bind(this);
            this.loadUserInformation = this.loadUserInformation.bind(this);
            this.loadServerInfo = this.loadServerInfo.bind(this);
            this.loadUserInfo = this.loadUserInfo.bind(this);
            this.loginSuccess = this.loginSuccess.bind(this);
            this.logout = this.logout.bind(this);
            this.refresh = this.refresh.bind(this);

            this.state = {
                loggedIn: !!CredentialsProvider.isTokenValid(),
                routes: [],
                categories: AppCategories,
                focusedCategory: this.props.category?.name || "",
                serverInfoError: null,
                userNameError: null,
                currentUser: null,
                serverInformation: null,
                logout_modal: false
            };
        }

        private loadServerInfo(
            info: InternalStatus<Components.Schemas.ServerInformationResponse, ServerInfoErrors>
        ) {
            this.setState({
                serverInformation: info.code == StatusCode.OK ? info.payload : null,
                serverInfoError: info.code == StatusCode.ERROR ? info.error : null
            });
        }

        private loadUserInfo(user: InternalStatus<Components.Schemas.UserResponse, GenericErrors>) {
            this.setState({
                currentUser: user.code == StatusCode.OK ? user.payload : null,
                userNameError: user.code == StatusCode.ERROR ? user.error : null
            });
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
            LoginHooks.addHook(this.loadServerInformation);
            ServerClient.on("loadServerInfo", this.loadServerInfo);

            LoginHooks.addHook(this.loadUserInformation);
            UserClient.on("loadUserInfo", this.loadUserInfo);

            LoginHooks.on("loginSuccess", this.loginSuccess);
            ServerClient.on("logout", this.logout);

            this.setState({
                routes: await RouteController.getRoutes()
            });

            if (CredentialsProvider.isTokenValid()) {
                await this.loadServerInformation();
                await this.loadUserInformation();
            }

            RouteController.on("refresh", this.refresh);
        }

        public componentWillUnmount(): void {
            ServerClient.removeListener("loadServerInfo", this.loadServerInfo);
            UserClient.removeListener("loadUserInfo", this.loadUserInfo);
            LoginHooks.removeListener("loginSuccess", this.loginSuccess);
            ServerClient.removeListener("logout", this.logout);
            RouteController.removeListener("refresh", this.refresh);
        }

        public componentDidUpdate(prevProps: Readonly<IProps>) {
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
                <>
                    <Modal
                        aria-labelledby="contained-modal-title-vcenter"
                        show={this.state.logout_modal}
                        centered
                        onHide={() => {
                            this.setState({ logout_modal: false });
                        }}>
                        <Modal.Header
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center"
                            }}>
                            <Modal.Title id="contained-modal-title-vcenter">
                                Do you want to log out?
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Footer
                            style={{
                                display: "flex",
                                justifyContent: "center"
                            }}>
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    this.setState({ logout_modal: false });
                                }}>
                                Close
                            </Button>
                            <Button
                                variant="danger"
                                onClick={() => {
                                    this.setState({ logout_modal: false });
                                    this.logoutClick();
                                }}>
                                Log Out
                            </Button>
                        </Modal.Footer>
                    </Modal>
                    <Navbar
                        className="shadow-lg"
                        expand={this.state.loggedIn ? "lg" : undefined}
                        collapseOnSelect
                        variant="dark"
                        bg={
                            this.state.userNameError || this.state.serverInfoError
                                ? "danger"
                                : "primary"
                        }>
                        <Navbar.Brand
                            href="#"
                            onClick={() => {
                                this.props.history.push(
                                    AppRoutes.home.link || AppRoutes.home.route,
                                    {
                                        reload: true
                                    }
                                );
                            }}>
                            <img
                                src={TGLogo}
                                alt="tglogo"
                                width={30}
                                height={30}
                                className="d-inline-block align-top"
                            />
                            {""} {/* THIS IS NEEDED! DO NOT REMOVE! */}
                            {this.renderVersion()}
                        </Navbar.Brand>
                        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                        <Navbar.Collapse className="justify-content-end">
                            <Nav>{this.renderDropdowns()}</Nav>
                            <Nav>{this.renderUser()}</Nav>
                        </Navbar.Collapse>
                    </Navbar>
                </>
            );
        }

        private renderVersion(): React.ReactNode {
            if (this.state.serverInfoError && this.state.loggedIn)
                return (
                    <div>
                        <div className="align-top d-inline-block px-1">
                            <FontAwesomeIcon icon="exclamation-circle" />
                        </div>
                        <div className="d-inline-block">
                            <FormattedMessage id="navbar.server_error" />
                        </div>
                    </div>
                );
            if (this.state.serverInformation)
                return (
                    <React.Fragment>
                        <FormattedMessage id="generic.appname" />
                        {" v"}
                        {this.state.serverInformation.version}
                    </React.Fragment>
                );
            //TODO: add a spinner. Though having the name would be fine i guess
            // oh and for some reason serverInfo is null while you can see it on the info button...
            return <FormattedMessage id="generic.appname" />;
        }

        private renderUser(): React.ReactNode {
            if (!this.state.loggedIn)
                return (
                    <>
                        <Nav.Link
                            onClick={() => {
                                this.props.history.push(
                                    AppRoutes.info.link || AppRoutes.info.route,
                                    { reload: true }
                                );
                            }}>
                            <FontAwesomeIcon icon="info-circle" />
                        </Nav.Link>
                        <Nav.Link
                            onClick={() => {
                                this.props.history.push(
                                    AppRoutes.config.link || AppRoutes.config.route,
                                    { reload: true }
                                );
                            }}>
                            <FontAwesomeIcon icon="cog" />
                        </Nav.Link>
                    </>
                );

            return (
                <Nav.Item className="ml-auto">
                    <DropdownButton
                        variant={
                            this.state.serverInfoError || this.state.userNameError
                                ? "danger"
                                : "secondary"
                        }
                        title={
                            this.state.userNameError ? (
                                <div>
                                    <div className="align-top d-inline-block px-1">
                                        <FontAwesomeIcon icon="exclamation-circle" />
                                    </div>
                                    <div className="d-inline-block">
                                        <FormattedMessage id="navbar.user_error" />
                                    </div>
                                </div>
                            ) : this.state.currentUser ? (
                                this.state.currentUser.name
                            ) : (
                                "loading" //TODO: add spinner
                            )
                        }
                        menuAlign="right">
                        <Dropdown.Item
                            onClick={() => {
                                this.props.history.push(
                                    this.state.currentUser
                                        ? `/users/edit/user/${this.state.currentUser.id}/info`
                                        : `/users/edit`, // Tragic!
                                    { reload: true }
                                );
                            }}>
                            <FontAwesomeIcon icon={"info"} /> <FormattedMessage id="routes.info" />
                        </Dropdown.Item>
                        <Dropdown.Item
                            onClick={() => {
                                this.props.history.push(
                                    AppRoutes.config.link || AppRoutes.config.route,
                                    { reload: true }
                                );
                            }}>
                            <FontAwesomeIcon icon={"cog"} /> <FormattedMessage id="routes.config" />
                        </Dropdown.Item>
                        {AppRoutes.passwd.cachedAuth ? (
                            <Dropdown.Item
                                onClick={() => {
                                    this.props.history.push(
                                        AppRoutes.passwd.link || AppRoutes.passwd.route,
                                        { reload: true }
                                    );
                                }}>
                                <FontAwesomeIcon icon={"key"} />{" "}
                                <FormattedMessage id="routes.passwd" />
                            </Dropdown.Item>
                        ) : null}
                        <Dropdown.Item
                            onClick={() => {
                                ServerClient.emit("purgeCache");
                            }}>
                            <FontAwesomeIcon icon={"trash"} />{" "}
                            <FormattedMessage id="navbar.purgecache" />
                        </Dropdown.Item>
                        <Dropdown.Item
                            onClick={() => {
                                this.props.history.replace(this.props.location.pathname, {
                                    reload: true
                                });
                            }}>
                            <FontAwesomeIcon icon={"sync"} />{" "}
                            <FormattedMessage id="navbar.refresh" />
                        </Dropdown.Item>
                        <Dropdown.Item
                            onClick={() => {
                                this.setState({ logout_modal: true });
                            }}>
                            <FontAwesomeIcon icon={"sign-out-alt"} />{" "}
                            <FormattedMessage id="navbar.logout" />
                        </Dropdown.Item>
                    </DropdownButton>
                </Nav.Item>
            );
        }

        private renderDropdowns(): React.ReactNode {
            if (!this.state.loggedIn) return "";
            return Object.values(this.state.categories).map(cat =>
                cat.routes.length > 1 ? (
                    <NavDropdown
                        key={cat.name}
                        title={
                            <>
                                <FormattedMessage id={cat.leader.name} />{" "}
                                {!!cat.leader.homeIcon && (
                                    <FontAwesomeIcon icon={cat.leader.homeIcon} />
                                )}
                            </>
                        }
                        id="basic-nav-dropdown">
                        <NavDropdown.Item
                            active={matchesPath(
                                this.props.location.pathname,
                                cat.leader.route,
                                cat.leader.navbarLoose
                            )}
                            onClick={() => {
                                this.props.history.push(cat.leader.route, {
                                    reload: true
                                });
                            }}>
                            <FormattedMessage id={cat.leader.name} />
                        </NavDropdown.Item>
                        <NavDropdown.Divider />
                        {Object.values(cat.routes).map(sites => {
                            if (sites === cat.leader || !sites.visibleNavbar) return null;
                            return (
                                <NavDropdown.Item
                                    key={sites.name}
                                    active={matchesPath(this.props.location.pathname, sites.route)}
                                    onClick={() => {
                                        this.props.history.push(sites.link || sites.route, {
                                            reload: true
                                        });
                                    }}>
                                    {!!sites.homeIcon && <FontAwesomeIcon icon={sites.homeIcon} />}{" "}
                                    <FormattedMessage id={sites.name} />
                                </NavDropdown.Item>
                            );
                        })}
                    </NavDropdown>
                ) : cat.leader.visibleNavbar ? (
                    <Nav.Link
                        onClick={() => {
                            this.props.history.push(cat.leader.route, {
                                reload: true
                            });
                        }}>
                        <FormattedMessage id={cat.leader.name} />{" "}
                        {!!cat.leader.homeIcon && <FontAwesomeIcon icon={cat.leader.homeIcon} />}
                    </Nav.Link>
                ) : null
            );
        }

        private logoutClick(): void {
            ServerClient.logout();
        }

        private async loadServerInformation(): Promise<void> {
            const info = await ServerClient.getServerInfo();
            this.setState({
                serverInformation: info.code == StatusCode.OK ? info.payload : null,
                serverInfoError: info.code == StatusCode.ERROR ? info.error : null
            });
        }

        private async loadUserInformation(): Promise<void> {
            const response = await UserClient.getCurrentUser();
            this.setState({
                currentUser: response.code == StatusCode.OK ? response.payload : null,
                userNameError: response.code == StatusCode.ERROR ? response.error : null
            });
        }
    }
);
