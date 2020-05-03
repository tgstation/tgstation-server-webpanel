import * as React from 'react';
import { NavLink } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { BarLoader, SyncLoader } from 'react-spinners';

import Glyphicon from '@strongdm/glyphicon';

import { User, ServerInformation } from '../clients/generated';

import IServerClient from '../clients/IServerClient';

import Home from './Home';

import './Navbar.css';

interface IProps {
    serverClient: IServerClient;
}

interface IState {
    currentUser?: User;
    userNameError?: string;
    serverInfoError?: string;
    retryIn?: Date;
    usernameHovered: boolean;
    serverInformation?: ServerInformation;
}

export default class Navbar extends React.Component<IProps, IState> {
    private retryTimer: NodeJS.Timeout | null;

    public constructor(props: IProps) {
        super(props);
        this.state = {
            usernameHovered: false
        };
        this.retryTimer = null;

        this.tryLoadInformation = this.tryLoadInformation.bind(this);
        this.logoutClick = this.logoutClick.bind(this);
        this.onHover = this.onHover.bind(this);
        this.offHover = this.offHover.bind(this);
    }

    public async componentDidMount(): Promise<void> {
        await this.tryLoadInformation();
    }

    public componentWillUnmount() {
        if (this.retryTimer != null) {
            clearTimeout(this.retryTimer);
            this.retryTimer = null;
        }
    }

    public render(): React.ReactNode {
        return (
            <div className="Navbar">
                <div className="Navbar-version">{this.renderVersion()}</div>
                <div className="Navbar-home">
                    <NavLink to={Home.Route} activeClassName="active">
                        <FormattedMessage id="navbar.home" />
                    </NavLink>
                </div>
                <div className="Navbar-user">{this.renderUser()}</div>
            </div>
        );
    }

    private renderVersion(): React.ReactNode {
        if (this.state.serverInfoError)
            return (
                <div className="Navbar-info-error">
                    <div className="Navbar-info-error-glyph">
                        <Glyphicon glyph="exclamation-sign" />
                    </div>
                    <p className="Navbar-info-error-text">
                        <FormattedMessage id="navbar.info_error" />:
                        <br />
                        {this.state.serverInfoError}
                    </p>
                </div>
            );
        if (this.state.serverInformation)
            return (
                <h4>
                    tgstation-server v
                    {this.state.serverInformation.version?.major}.
                    {this.state.serverInformation.version?.minor}.
                    {this.state.serverInformation.version?.build}
                </h4>
            );

        return (
            <div className="Navbar-info-loading">
                <BarLoader color={'white'} />
            </div>
        );
    }

    private renderUser(): React.ReactNode {
        if (this.state.userNameError)
            return (
                <div className="Navbar-user-error">
                    <div className="Navbar-user-error-glyph">
                        <Glyphicon glyph="exclamation-sign" />
                    </div>
                    <p className="Navbar-user-error-text">
                        <FormattedMessage id="navbar.user_error" />:
                        <br />
                        {this.state.userNameError}
                    </p>
                </div>
            );
        if (this.state.currentUser)
            return (
                <button
                    className="Navbar-user-name"
                    onClick={this.logoutClick}
                    onMouseEnter={this.onHover}
                    onMouseLeave={this.offHover}>
                    {this.state.usernameHovered ? (
                        <FormattedMessage id="navbar.logout" />
                    ) : (
                        this.state.currentUser.name
                    )}
                </button>
            );

        return (
            <div className="Navbar-user-loading">
                <SyncLoader color={'white'} />
            </div>
        );
    }

    private onHover(): void {
        this.setState(prevState => {
            return {
                usernameHovered: true,
                currentUser: prevState.currentUser,
                userNameError: prevState.userNameError,
                retryIn: prevState.retryIn
            };
        });
    }

    private offHover(): void {
        this.setState(prevState => {
            return {
                usernameHovered: false,
                currentUser: prevState.currentUser,
                userNameError: prevState.userNameError,
                retryIn: prevState.retryIn
            };
        });
    }

    private logoutClick(): void {
        this.props.serverClient.logout();
    }

    private async loadServerInformation(): Promise<void> {
        const info = await this.props.serverClient.getServerInformationCached();
        if (!info) {
            return;
        }

        if (!info.model) {
            const loadingError = await info.getError();

            // retry every 10s
            const retryIn = new Date(Date.now() + 10000);

            this.setState(prevState => {
                return {
                    serverInfoError: loadingError,
                    userNameError: prevState.userNameError,
                    retryIn,
                    usernameHovered: prevState.usernameHovered
                };
            });

            return;
        }

        this.setState(prevState => {
            return {
                currentUser: prevState.currentUser,
                userNameError: prevState.userNameError,
                usernameHovered: prevState.usernameHovered,
                serverInformation: info.model
            };
        });
    }

    private async loadUserInformation(): Promise<void> {
        const user = await this.props.serverClient.users.getCurrentCached();
        if (!user) {
            return;
        }

        if (!user.model) {
            const loadingError = await user.getError();

            // retry every 10s
            const retryIn = new Date(Date.now() + 10000);

            this.setState(prevState => {
                return {
                    serverInformation: prevState.serverInformation,
                    serverInfoError: prevState.serverInfoError,
                    userNameError: loadingError,
                    retryIn,
                    usernameHovered: prevState.usernameHovered
                };
            });

            return;
        }

        this.setState(prevState => {
            return {
                currentUser: user.model,
                usernameHovered: prevState.usernameHovered,
                serverInformation: prevState.serverInformation,
                serverInfoError: prevState.serverInfoError
            };
        });
    }

    private async tryLoadInformation(): Promise<void> {
        if (this.state.retryIn != null && this.state.retryIn < new Date()) {
            this.retryTimer = setTimeout(
                this.tryLoadInformation,
                this.state.retryIn.getMilliseconds() - Date.now()
            );
            return;
        }

        const serverInfoPromise = this.loadServerInformation();
        await this.loadUserInformation();
        await serverInfoPromise;
    }
}
