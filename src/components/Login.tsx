import * as React from "react";
import { FormattedMessage, InjectedIntlProps, injectIntl } from "react-intl";
import { RingLoader } from "react-spinners";

import { connect } from "react-redux";
import { Action, Dispatch } from "redux";

import IServerClient from "../clients/IServerClient";

import ICredentials from "../models/ICredentials";

import IRootState from "../store/IRootState";
import IErrorAction from "../store/subactiontypes/IErrorAction";

import Actions from "../store/Actions";
import ActionTypes from "../store/ActionTypes";
import ICredentialsAction from "../store/subactiontypes/ICredentialsAction";

import "./Login.css";

interface IStateProps {
  credentials: ICredentials;
  loginError?: string;
  gettingToken: boolean;
}

interface IDispatchProps {
  updateCredentials: (newCredentials: ICredentials) => void;
  dispatchBeginLogin: () => void;
  finishLogin: (error?: string) => void;
}

interface IOwnProps {
  serverClient: IServerClient;
}

type IProps = IStateProps & IDispatchProps & IOwnProps & InjectedIntlProps;

class Login extends React.Component<IProps> {
  constructor(props: IProps) {
    super(props);
    this.updateUsername = this.updateUsername.bind(this);
    this.updatePassword = this.updatePassword.bind(this);
    this.tryLogin = this.tryLogin.bind(this);
  }

  public render(): React.ReactNode {
    if (this.props.gettingToken)
      return (
        <div className="Login-loading">
          <RingLoader loading={true} color="#E3EFFC" size={500} />
          <p className="Login-loading-text">
            Logging In
          </p>
        </div>
      );
    return (
      <div className="Login">
        <h1 className="Login-title">
          <FormattedMessage id="login.title" />
        </h1>
        <input
          type="text"
          name="username"
          autoComplete="on"
          className="form-control Login-username"
          onChange={this.updateUsername}
          value={this.props.credentials.username}
          placeholder={this.props.intl.formatMessage({ id: "login.username" })}
        />
        <input
          type="password"
          name="password"
          autoComplete="on"
          className="form-control Login-password"
          onChange={this.updatePassword}
          value={this.props.credentials.password}
          placeholder={this.props.intl.formatMessage({ id: "login.password" })}
        />
        <button
          onClick={this.tryLogin}
          className="Login-submit"
          disabled={!this.props.credentials.username || !this.props.credentials.password}
        >
          <FormattedMessage id="login.submit" />
        </button>
        {this.renderLoginError()}
      </div>
    );
  }

  private renderLoginError(): React.ReactNode {
    if (!this.props.loginError)
      return null;
    return (
      <p className="Login-error">
        {this.props.loginError}
      </p>
    );
  }

  private updateUsername(event: React.ChangeEvent<HTMLInputElement>) {
    const newUsername = event.target.value;
    this.props.updateCredentials({
      password: this.props.credentials.password,
      username: newUsername
    });
  }

  private updatePassword(event: React.ChangeEvent<HTMLInputElement>) {
    const newPassword = event.target.value;
    this.props.updateCredentials({
      password: newPassword,
      username: this.props.credentials.username
    });
  }

  private tryLogin(event: React.MouseEvent<HTMLButtonElement>) {
    this.props.dispatchBeginLogin();
    const finishLogin = this.props.finishLogin;
    this.props.serverClient
      .doLogin(this.props.credentials)
      .then(serverResponse => {
        if (!serverResponse.response.ok)
          if (serverResponse.response.status === 401)
            finishLogin(
              this.props.intl.formatMessage({
                id: "login.bad_user_pass"
              })
            );
          else
            serverResponse.getError().then(finishLogin);
        else
          finishLogin();
      });
  }
}

const mapStateToProps = (state: IRootState, ownProps: IOwnProps): IStateProps => ({
  credentials: state.credentials,
  gettingToken: state.refreshingToken,
  loginError: state.loginError
});

const mapDispatchToProps = (dispatch: Dispatch<Action>, ownProps: IOwnProps): IDispatchProps => ({
  dispatchBeginLogin: () => dispatch({
    type: Actions.BeginLogin
  }),
  finishLogin: (error?: string) => {
    if (error) {
      const action: IErrorAction = {
        action: Actions.LoginError,
        error,
        type: ActionTypes.Error
      };
      dispatch(action);
    } else
      dispatch({
        type: Actions.LoginComplete
      });
  },
  updateCredentials: (newCredentials: ICredentials) => {
    const credentialsUpdateDispatch: ICredentialsAction = {
      action: Actions.CredentialsUpdate,
      credentials: newCredentials,
      type: ActionTypes.Credentials
    };
    dispatch(credentialsUpdateDispatch);
  }
});

export default connect<IStateProps, IDispatchProps, IOwnProps, IRootState>(mapStateToProps, mapDispatchToProps)(injectIntl(Login));
