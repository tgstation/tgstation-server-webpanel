import * as React from 'react';
import { Route, Redirect } from 'react-router';

import { LocationDescriptor } from 'history';

import IServerClient from '../../clients/IServerClient';
import { Token } from '../../clients/generated';

import ServerResponse from '../../models/ServerResponse';

import * as Login from '../login/Login';

interface IProps {
    serverClient: IServerClient;
    path?: string;
}

interface IState {
    loginError: string | null;
}

export default class AuthenticatedRoute extends React.Component<
    IProps,
    IState
> {
    public constructor(props: IProps) {
        super(props);

        this.handleLoginRefresh = this.handleLoginRefresh.bind(this);

        this.state = {
            loginError: null
        };
    }

    public render(): React.ReactNode {
        return (
            <Route
                path={this.props.path}
                render={() => {
                    if (this.props.serverClient.loggedIn())
                        return this.props.children;

                    const redirectTarget: LocationDescriptor = {
                        pathname: Login.Route,
                        state: {
                            loginRefreshError: this.state.loginError
                        }
                    };

                    return <Redirect to={redirectTarget} />;
                }}
            />
        );
    }

    public componentDidMount(): void {
        this.props.serverClient.setLoginHandler(this.handleLoginRefresh);
    }

    public componentWillUnmount(): void {
        this.props.serverClient.clearLoginHandler(this.handleLoginRefresh);
    }

    private async handleLoginRefresh(
        promise: Promise<ServerResponse<Readonly<Token>>>
    ): Promise<void> {
        const result = await promise;
        if (result.model) {
            this.setState({
                loginError: null
            });
            return;
        }

        const loginError = await result.getError();

        // trigger a state refresh to get a kick back to the login page
        this.setState({
            loginError
        });
    }
}
