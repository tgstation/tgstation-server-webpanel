import * as React from "react";
import { FormattedMessage, InjectedIntlProps, injectIntl } from "react-intl";
import { RingLoader } from "react-spinners";

import IServerClient from "../clients/IServerClient";

import { User } from '../clients/generated';

import ICredentials from "../models/ICredentials";
import ServerResponse from '../models/ServerResponse';

import "./Login.css";

enum OperationState {
  PromptNormal,
  PromptAdminPassword,
  LoginNormal,
  LoginDefaultAdmin,
  RetrieveCurrentUser,
  UpdateAdminPassword
}

interface IState {
  credentials: ICredentials;
  loginError?: string | null;
  operation: OperationState;
  passwordConfirm: string;
  currentUser?: User;
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
    this.updatePasswordConfirm = this.updatePasswordConfirm.bind(this);
    this.updateAdminPassword = this.updateAdminPassword.bind(this);
    this.tryLogin = this.tryLogin.bind(this);
    this.getTranslationForOperation = this.getTranslationForOperation.bind(this);

    this.state = {
      credentials: {
        userName: 'admin',
        password: 'ISolemlySwearToDeleteTheDataDirectory'
      },
      operation: OperationState.LoginDefaultAdmin,
      passwordConfirm: ''
    }
  }

  public async componentDidMount() {
    // Try to login as the default admin
    await this.tryLoginImpl();
    if (!this.props.serverClient.loggedIn()) {
      this.resetToEmptyLogin();
      return;
    }

    this.setState((prevState: Readonly<IState>): IState => {
      return {
        credentials: prevState.credentials,
        operation: OperationState.RetrieveCurrentUser,
        passwordConfirm: prevState.passwordConfirm,
        currentUser: prevState.currentUser
      }
    });

    // Get user details so we may update the password
    const user = await this.props.serverClient.user.getCurrent();
    if (!user?.model) {
      // Weird, but reset things
      this.resetToEmptyLogin();
      return;
    }

    this.setState((prevState: Readonly<IState>): IState => {
      return {
        credentials: {
          userName: prevState.credentials.userName,
          password: ''
        },
        operation: OperationState.PromptAdminPassword,
        passwordConfirm: prevState.passwordConfirm,
        currentUser: user.model
      }
    });
  }

  public render(): React.ReactNode {
    if (this.state.operation === OperationState.LoginDefaultAdmin
      || this.state.operation === OperationState.LoginNormal
      || this.state.operation === OperationState.RetrieveCurrentUser
      || this.state.operation === OperationState.UpdateAdminPassword)
      return (
        <div className="Login-loading">
          <RingLoader className="margin: auto" loading={true} color="#E3EFFC" size={500} />
          <p className="Login-loading-text">
            <FormattedMessage id={this.getTranslationForOperation()} />
          </p>
        </div>
      );
    if (this.state.operation === OperationState.PromptAdminPassword)
      return this.renderSetAdminPassword();
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

  private renderSetAdminPassword(): React.ReactNode {
    return (
      <form onSubmit={this.updateAdminPassword} className="Login">
        <h1 className="Login-title">
          <FormattedMessage id="login.password_update" />
        </h1>
        <input
          type="password"
          name="password"
          className="form-control Login-username"
          onChange={this.updatePassword}
          value={this.state.credentials.password}
          placeholder={this.props.intl.formatMessage({ id: "login.password" })}
        />
        <input
          type="password"
          name="confirm_password"
          className="form-control Login-password"
          onChange={this.updatePasswordConfirm}
          value={this.state.passwordConfirm}
          placeholder={this.props.intl.formatMessage({ id: "login.confirm_password" })}
        />
        <button
          type="submit"
          className="Login-submit"
          disabled={!this.state.credentials.userName || !this.state.credentials.password}
        >
          <FormattedMessage id="login.submit_password_update" />
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
        {this.props.intl.messages[this.state.loginError] ? this.props.intl.messages[this.state.loginError] : this.state.loginError}
      </p>
    );
  }

  private getTranslationForOperation(): string {
    switch (this.state.operation) {
      case OperationState.LoginDefaultAdmin:
      case OperationState.LoginNormal:
        return 'login.logging_in';
      case OperationState.RetrieveCurrentUser:
        return 'login.getting_user_details';
      case OperationState.UpdateAdminPassword:
        return 'login.password_updating';
      default:
        throw new Error('Invalid OperationState for loading!');
    }
  }

  private resetToEmptyLogin(loginError?: string): void {
    this.setState((prevState: Readonly<IState>): IState => {
      return {
        credentials: {
          userName: '',
          password: ''
        },
        operation: OperationState.PromptNormal,
        passwordConfirm: prevState.passwordConfirm,
        loginError,
        currentUser: prevState.currentUser
      }
    });
  }

  private updateUsername(event: React.ChangeEvent<HTMLInputElement>): void {
    const newUsername = event.target.value;
    const newState: IState = {
      credentials: {
        userName: newUsername,
        password: this.state.credentials.password
      },
      loginError: this.state.loginError,
      operation: this.state.operation,
      passwordConfirm: this.state.passwordConfirm,
      currentUser: this.state.currentUser
    };
    this.setState(newState);
  }

  private updatePassword(event: React.ChangeEvent<HTMLInputElement>): void {
    const newPassword = event.target.value;
    const newState: IState = {
      credentials: {
        userName: this.state.credentials.userName,
        password: newPassword
      },
      loginError: this.state.loginError,
      operation: this.state.operation,
      passwordConfirm: this.state.passwordConfirm,
      currentUser: this.state.currentUser
    };
    this.setState(newState);
  }

  private updatePasswordConfirm(event: React.ChangeEvent<HTMLInputElement>): void {
    const newPassword = event.target.value;
    const newState: IState = {
      credentials: this.state.credentials,
      loginError: this.state.loginError,
      operation: this.state.operation,
      passwordConfirm: newPassword,
      currentUser: this.state.currentUser
    };
    this.setState(newState);
  }

  private async updateAdminPassword(event: React.MouseEvent<HTMLFormElement>) {
    if (this.state.operation !== OperationState.PromptAdminPassword)
      return;

    const newState: IState = {
      credentials: this.state.credentials,
      loginError: this.state.loginError,
      operation: OperationState.UpdateAdminPassword,
      passwordConfirm: this.state.passwordConfirm,
      currentUser: this.state.currentUser
    };

    this.setState(newState);
    const passwordUpdateResult = await this.props.serverClient.user.update({
      id: this.state.currentUser?.id,
      password: this.state.credentials.password
    });

    if (!passwordUpdateResult) {
      this.resetToEmptyLogin("login.failed_to_update_admin");
      return;
    }

    await this.presentErrorResult(passwordUpdateResult, OperationState.PromptAdminPassword);

    if (passwordUpdateResult.model && await this.tryLoginImpl(true)) {
      this.props.onSuccessfulLogin();
    }
  }

  private async tryLogin(event: React.MouseEvent<HTMLFormElement>) {
    if (event)
      event.preventDefault();

    await this.tryLoginImpl();

    this.props.onSuccessfulLogin();
  }

  private async tryLoginImpl(skipOperationEarlyOut: boolean = false): Promise<boolean> {
    let nextOperation: OperationState;
    if (this.state.operation !== OperationState.LoginDefaultAdmin) {
      if (this.state.operation !== OperationState.PromptNormal && !skipOperationEarlyOut) {
        return false;
      }
      nextOperation = OperationState.LoginNormal;
    } else {
      nextOperation = OperationState.LoginDefaultAdmin;
    }

    this.setState((prevState: Readonly<IState>): IState => {
      return {
        credentials: prevState.credentials,
        loginError: prevState.loginError,
        operation: nextOperation,
        passwordConfirm: prevState.passwordConfirm,
        currentUser: prevState.currentUser
      }
    });

    const loginResult = await this.props.serverClient.tryLogin(this.state.credentials);
    await this.presentErrorResult(loginResult, OperationState.PromptNormal);

    return !!loginResult.model;
  }

  private async presentErrorResult<TModel>(result: ServerResponse<TModel>, nextOperation: OperationState) {
    let errorMessage: string | null = null;
    let clearCredentials = false;
    if (result.model == null) {
      if (result.response?.status === 401) {
        if (nextOperation === OperationState.PromptAdminPassword) {
          errorMessage = "login.admin_password_changed";
          nextOperation = OperationState.PromptNormal;
        }
        else {
          errorMessage = this.props.intl.formatMessage({
            id: "login.bad_user_pass"
          })
        }
      } else {
        errorMessage = await result.getError();
      }
    }

    this.setState((prevState: Readonly<IState>): IState => {
      return {
        credentials: clearCredentials ?
          {
            userName: '',
            password: ''
          }
          : prevState.credentials,
        loginError: errorMessage,
        operation: nextOperation,
        passwordConfirm: prevState.passwordConfirm,
        currentUser: prevState.currentUser
      };
    });
  }
}

export default injectIntl(Login);
