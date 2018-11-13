import * as React from 'react';

import { connect } from 'react-redux';
import { Action, Dispatch } from 'redux';

import IRootState from 'src/store/IRootState';

import Login from './Login';

interface IStateProps {
    loggedIn: boolean;
}

type IProps = IStateProps;

class Root extends React.Component<IProps> {
    public render(): React.ReactNode {
        if (!this.props.loggedIn)
            return (
                <Login />
            );
        return (
            <div />
        );
    }
}

const mapStateToProps = (state: IRootState, ownProps: any): IStateProps => ({
    loggedIn: state.loggedIn
});

const mapDispatchToProps = (dispatch: Dispatch<Action>, ownProps: any): any => ({});

export default connect<IStateProps, {}, {}>(mapStateToProps, mapDispatchToProps)(Root);
