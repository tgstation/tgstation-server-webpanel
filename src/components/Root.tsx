import * as React from 'react';
import { Route } from 'react-router-dom';

import { ServerInformation } from '../clients/generated';

import IServerClient from '../clients/IServerClient';

import Home from './Home';
import * as Login from './login/Login';
import Navbar from './Navbar';
import UserManager from './userManager/UserManager';
import AuthenticatedRoute from './utils/AuthenticatedRoute';

import './Root.css';

interface IProps {
    serverClient: IServerClient;
}

interface IState {
    serverInformation?: ServerInformation;
}

export default class Root extends React.Component<IProps, IState> {
    public constructor(props: IProps) {
        super(props);
        this.state = {};

        this.postLogin = this.postLogin.bind(this);
        this.getServerInformation = this.getServerInformation.bind(this);
    }

    public render(): React.ReactNode {
        return (
            <React.Fragment>
                <Route path={Login.Route}>
                    <Login.Component
                        serverClient={this.props.serverClient}
                        onSuccessfulLogin={this.postLogin}
                    />
                </Route>
                <AuthenticatedRoute serverClient={this.props.serverClient}>
                    <div className="Root">
                        <div className="Root-nav">
                            <Navbar serverClient={this.props.serverClient} />
                        </div>
                        <div className="Root-content">{this.renderPages()}</div>
                    </div>
                </AuthenticatedRoute>
            </React.Fragment>
        );
    }

    private getServerInformation(): ServerInformation {
        if (!this.state.serverInformation)
            throw new Error('state.serverInformation should be set here');
        return this.state.serverInformation;
    }

    private renderPages(): React.ReactNode {
        return (
            <React.Fragment>
                <UserManager
                    userClient={this.props.serverClient.users}
                    serverInformationCallback={this.getServerInformation}
                />
                <Home />
            </React.Fragment>
        );
    }

    private postLogin(serverInformation: ServerInformation): void {
        this.setState({
            serverInformation
        });
    }
}
