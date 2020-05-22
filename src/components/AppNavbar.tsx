import * as React from 'react';
import { NavLink } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Dropdown from 'react-bootstrap/Dropdown';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { GlobalObjects } from '../utils/globalObjects';
import { AppRoutes } from '../utils/routes';
import { Components } from '../clients/_generated';
import ServerClient from '../clients/ServerClient';
import UserClient from '../clients/UserClient';

interface IProps {}

interface IState {
    currentUser?: Components.Schemas.User;
    serverInformation?: Components.Schemas.ServerInformation;
    userNameError?: string;
    serverInfoError?: string;
    loggedIn: boolean;
}

export default class AppNavbar extends React.Component<IProps, IState> {
    public constructor(props: IProps) {
        super(props);
        this.state = {
            loggedIn: false
        };

        this.logoutClick = this.logoutClick.bind(this);
    }

    public async componentDidMount(): Promise<void> {
        ServerClient.on('loginSuccess', () => {
            this.loadServerInformation();
            this.loadUserInformation();
            this.setState({
                loggedIn: true
            });
        });
        ServerClient.on('logout', () => {
            this.setState({
                loggedIn: false
            });
        });
    }

    public render(): React.ReactNode {
        return (
            <Navbar
                expand="md"
                collapseOnSelect
                variant={GlobalObjects.darkMode ? 'dark' : 'light'}
                bg={this.state.userNameError || this.state.serverInfoError ? 'danger' : 'primary'}>
                <Navbar.Toggle className="mr-2" aria-controls="responsive-navbar-nav" />
                <Navbar.Brand className="mr-auto">{this.renderVersion()}</Navbar.Brand>
                <Navbar.Collapse>
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
                            Object.entries(AppRoutes).map(([id, route]) => {
                                if (route.hidden) {
                                    return;
                                }
                                return (
                                    <Nav.Item key={id}>
                                        <Nav.Link
                                            as={NavLink}
                                            to={route.route}
                                            activeClassName="active"
                                            exact={route.exact}>
                                            <FormattedMessage id={route.name} />
                                        </Nav.Link>
                                    </Nav.Item>
                                );
                            })
                        )}
                    </Nav>
                </Navbar.Collapse>
                <Nav.Item>{this.renderUser()}</Nav.Item>
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
                        {': '}
                        <FormattedMessage id={this.state.serverInfoError} />
                    </div>
                </div>
            );
        if (this.state.serverInformation)
            return `tgstation-server v${this.state.serverInformation.version}`;

        return 'loading'; //TODO: add a spinner;
    }

    private renderUser(): React.ReactNode {
        if (!this.state.loggedIn) return;

        return (
            <Dropdown>
                <Dropdown.Toggle
                    id="user-dropdown"
                    type="button"
                    variant={
                        this.state.serverInfoError || this.state.userNameError
                            ? 'danger'
                            : 'primary'
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
                                {': '}
                                <FormattedMessage id={this.state.userNameError} />
                            </div>
                        </div>
                    ) : this.state.currentUser ? (
                        this.state.currentUser.name
                    ) : (
                        'loading' //TODO: add spinner
                    )}
                </Dropdown.Toggle>
                <Dropdown.Menu alignRight>
                    <Dropdown.Item className="text-right" onClick={this.logoutClick}>
                        <FormattedMessage id="navbar.logout" />
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
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
