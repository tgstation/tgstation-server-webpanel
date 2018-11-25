import * as React from 'react';

import { connect } from 'react-redux';
import { Action, Dispatch } from 'redux';

import IServerClient from 'src/clients/IServerClient';

import IRootState from 'src/store/IRootState';

import Login from './Login';

interface IStateProps {
    loggedIn: boolean;
}

interface IOwnProps {
    serverClient: IServerClient;
}

type IProps = IStateProps & IOwnProps;

class Root extends React.Component<IProps> {
    public render(): React.ReactNode {
        if (!this.props.loggedIn)
            return (
                <Login serverClient={this.props.serverClient} />
            );
        return (
            <div />
        );
    }
}

const mapStateToProps = (state: IRootState, ownProps: IOwnProps): IStateProps => ({
    loggedIn: state.loggedIn
});

const mapDispatchToProps = (dispatch: Dispatch<Action>, ownProps: IOwnProps): any => ({});

export default connect<IStateProps, {}, IOwnProps>(mapStateToProps, mapDispatchToProps)(Root);
