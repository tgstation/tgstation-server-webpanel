import * as React from "react";
import { FormattedMessage, InjectedIntlProps, injectIntl } from "react-intl";
import { RingLoader } from "react-spinners";

import IServerClient from "../clients/IServerClient";

import ICredentials from "../models/ICredentials";

import "./Login.css";

interface IState {
  credentials: ICredentials;
  loginError?: string | null;
  gettingToken: boolean;
}

interface IOwnProps {
  serverClient: IServerClient;
  onSuccessfulLogin(): void;
}

type IProps = IOwnProps & InjectedIntlProps

class Login extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.updateUsername = this.updateUsername.bind(this);
    this.updatePassword = this.updatePassword.bind(this);
    this.tryLogin = this.tryLogin.bind(this);

    this.state = {
      credentials: {
        userName: '',
        password: ''
      },
      gettingToken: false
    }
  }

  public render(): React.ReactNode {
    if (this.state.gettingToken)
      return (
        <div className="Login-loading">
          <RingLoader className="margin: auto" loading={true} color="#E3EFFC" size={500} />
          <p className="Login-loading-text">
            <FormattedMessage id="login.loading" />
          </p>
        </div>
      );
    return (
      <form onSubmit={this.tryLogin} className="Login">
        <h1 className="Login-title">
          <FormattedMessage id="login.title" />
        </h1>
        <input
          type="text"
          name="username"
          autoComplete="on"
          className="form-control Login-username"
          onChange={this.updateUsername}
          value={this.state.credentials.userName}
          placeholder={this.props.intl.formatMessage({ id: "login.username" })}
        />
        <input
          type="password"
          name="password"
          autoComplete="on"
          className="form-control Login-password"
          onChange={this.updatePassword}
          value={this.state.credentials.password}
          placeholder={this.props.intl.formatMessage({ id: "login.password" })}
        />
        <button
          type="submit"
          className="Login-submit"
          disabled={!this.state.credentials.userName || !this.state.credentials.password}
        >
          <FormattedMessage id="login.submit" />
        </button>
        {this.renderLoginError()}
      </form>
    );
  }

  private renderLoginError(): React.ReactNode {
    if (!this.state.loginError)
      return null;
    return (
      <p className="Login-error">
        {this.state.loginError}
      </p>
    );
  }

  private updateUsername(event: React.ChangeEvent<HTMLInputElement>) {
    const newUsername = event.target.value;
    const newState: IState = {
      credentials: {
        userName: newUsername,
        password: this.state.credentials.password
      },
      loginError: this.state.loginError,
      gettingToken: this.state.gettingToken
    };
    this.setState(newState);
  }

  private updatePassword(event: React.ChangeEvent<HTMLInputElement>) {
    const newPassword = event.target.value;
    const newState: IState = {
      credentials: {
        userName: this.state.credentials.userName,
        password: newPassword
      },
      loginError: this.state.loginError,
      gettingToken: this.state.gettingToken
    };
    this.setState(newState);
  }

  private async tryLogin(event: React.MouseEvent<HTMLFormElement>) {
    event.preventDefault();
    if (this.state.gettingToken)
      return;

    const newState: IState = {
      credentials: this.state.credentials,
      loginError: this.state.loginError,
      gettingToken: true
    };
    this.setState(newState);

    const loginResult = await this.props.serverClient.tryLogin(this.state.credentials);

    let errorMessage: string | null = null;
    if (loginResult.model == null) {
      if (loginResult.response?.status === 401) {
        errorMessage = this.props.intl.formatMessage({
          id: "login.bad_user_pass"
        })
      } else {
        errorMessage = await loginResult.getError();
      }
    } else {
      this.props.onSuccessfulLogin();
    }

    this.setState((prevState: Readonly<IState>): IState => {
      return {
        credentials: prevState.credentials,
        loginError: errorMessage,
        gettingToken: false
      };
    });
  }
}

export default injectIntl(Login);
