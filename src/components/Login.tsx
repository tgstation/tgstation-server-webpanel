import * as React from 'react';
import { FormattedMessage, InjectedIntlProps, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Action, Dispatch } from 'redux';

import ICredentials from 'src/store/ICredentials';
import IRootState from 'src/store/IRootState';

import Actions from 'src/store/Actions';
import { CredentialsActionType, ICredentialsAction } from 'src/store/ICredentialsAction';
import './Login.css';

interface IDispatchProps {
    updateCredentials: (newCredentials: ICredentials) => void;
    beginLogin: () => void;
}

type IProps = IDispatchProps & InjectedIntlProps & ICredentials

class Login extends React.Component<IProps> {
    constructor(props: IProps) {
        super(props);
        this.updateUsername = this.updateUsername.bind(this);
        this.updatePassword = this.updatePassword.bind(this);
    }

    public render(): React.ReactNode {
        return (
            <div className="Login">
                <h1 className="Login-title"><FormattedMessage id="login.title" /></h1>
                <input type="text" name="username" className="form-control Login-username" onChange={this.updateUsername} value={this.props.username} placeholder={this.props.intl.formatMessage({
                    id: "login.username"
                })} />
                <input type="password" name="password" className="form-control Login-password" onChange={this.updatePassword} value={this.props.password} placeholder={this.props.intl.formatMessage({
                    id: "login.password"
                })} />
                <button onClick={this.tryLogin} className="Login-submit" disabled={!this.props.username || !this.props.password} >
                    <FormattedMessage id="login.submit" />
                </button>
            </div>
        );
    }

    private updateUsername(event: React.ChangeEvent<HTMLInputElement>) {
        const newUsername = event.target.value;
        this.props.updateCredentials({
            password: this.props.password,
            username: newUsername
        });
    }

    private updatePassword(event: React.ChangeEvent<HTMLInputElement>) {
        const newPassword = event.target.value;
        this.props.updateCredentials({
            password: newPassword,
            username: this.props.username
        });
    }

    private tryLogin(event: React.MouseEvent<HTMLButtonElement>) {
        return;
    }
}

function mapStateToProps(state: IRootState, ownProps: any): ICredentials {
    return state.credentials || {
        password: "",
        username: ""
    };
}

function mapDispatchToProps(dispatch: Dispatch<Action>, ownProps: any): IDispatchProps {
    return {
        beginLogin: () => dispatch({
            type: Actions.BeginLogin
        }),
        updateCredentials: (newCredentials: ICredentials) => {
            const credentialsUpdateDispatch: ICredentialsAction = {
                action: Actions.CredentialsUpdate,
                credentials: newCredentials,
                type: CredentialsActionType
            };
            dispatch(credentialsUpdateDispatch);
        }
    }
}

export default connect<ICredentials, IDispatchProps, {}>(mapStateToProps, mapDispatchToProps)(injectIntl(Login));
