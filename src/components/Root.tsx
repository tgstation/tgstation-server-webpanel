import * as React from 'react';

import { Token, ServerInformation } from '../clients/generated';

import IServerClient from '../clients/IServerClient';

import { PageType } from '../models/PageType';
import ServerResponse from '../models/ServerResponse';

import Home from './Home';
import Login from './login/Login';
import Navbar from './Navbar';
import UserManager from './userManager/UserManager';

import './Root.css';

interface IProps {
    serverClient: IServerClient;
}

interface IState {
    pageType: PageType;
    loginError?: string;
    serverInformation?: ServerInformation;
}

export default class Root extends React.Component<IProps, IState> {
    public constructor(props: IProps) {
        super(props);
        this.state = {
            pageType: PageType.Home
        };

        this.postLogin = this.postLogin.bind(this);
        this.navigateToPage = this.navigateToPage.bind(this);
        this.checkLoggedIn = this.checkLoggedIn.bind(this);
        this.handleLoginRefresh = this.handleLoginRefresh.bind(this);
        this.logout = this.logout.bind(this);
    }

    public componentWillUnmount(): void {
        this.props.serverClient.clearLoginRefreshHandler(
            this.handleLoginRefresh
        );
    }

    public render(): React.ReactNode {
        if (
            !this.props.serverClient.loggedIn() ||
            !this.state.serverInformation
        )
            return (
                <Login
                    serverClient={this.props.serverClient}
                    onSuccessfulLogin={this.postLogin}
                    loginRefreshError={this.state.loginError}
                />
            );

        const currentPage = this.state.pageType;
        if (currentPage == null)
            throw new Error('state.pageType should be set here!');

        return (
            <div className="Root">
                <div className="Root-nav">
                    <Navbar
                        checkLoggedIn={this.checkLoggedIn}
                        navigateToPage={this.navigateToPage}
                        currentPage={currentPage}
                        serverClient={this.props.serverClient}
                        logoutAction={this.logout}
                    />
                </div>
                <div className="Root-content">{this.renderPage()}</div>
            </div>
        );
    }

    private renderPage(): React.ReactNode {
        if (!this.state.serverInformation)
            throw new Error('state.serverInformation should be set here!');

        switch (this.state.pageType) {
            case PageType.Home:
                return <Home navigateToPage={this.navigateToPage} />;
            case PageType.UserManager:
                return (
                    <UserManager
                        userClient={this.props.serverClient.users}
                        serverInformation={this.state.serverInformation}
                    />
                );
            default:
                throw new Error('Invalid PageType!');
        }
    }

    private checkLoggedIn(): void {
        this.setState(prevState => {
            return {
                pageType: prevState.pageType
            };
        });
    }

    private navigateToPage(
        pageType: PageType,
        serverInformation?: ServerInformation
    ): void {
        this.setState(prevState => {
            return {
                serverInformation:
                    serverInformation || prevState.serverInformation,
                pageType
            };
        });
    }

    private async postLogin(
        serverInformation: ServerInformation
    ): Promise<void> {
        this.props.serverClient.setLoginRefreshHandler(this.handleLoginRefresh);
        this.navigateToPage(PageType.Home, serverInformation);
    }

    private async handleLoginRefresh(
        promise: Promise<ServerResponse<Readonly<Token>>>
    ): Promise<void> {
        const result = await promise;
        if (result.model) {
            return;
        }

        const loginError = await result.getError();

        // trigger a state refresh to get a kick back to the login page
        this.setState(prevState => {
            return {
                pageType: prevState.pageType,
                loginError
            };
        });
    }

    private logout(): void {
        this.props.serverClient.logout();
        this.setState({
            pageType: PageType.Home,
            loginError: 'login.logout'
        });
    }
}
