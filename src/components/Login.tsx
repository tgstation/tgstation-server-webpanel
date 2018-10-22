import * as React from 'react';

import './Login.css';

import { FormattedMessage, InjectedIntlProps, injectIntl } from 'react-intl';

interface ILoginState {
    username?: string;
    password?: string;
}

class Login extends React.Component<InjectedIntlProps, ILoginState> {
    constructor(props: InjectedIntlProps) {
        super(props);
        this.state = {};
        this.updateUsername = this.updateUsername.bind(this);
        this.updatePassword = this.updatePassword.bind(this);
    }


    public render(): React.ReactNode {
        return (
            <div className="Login">
                <h1 className="Login-title"><FormattedMessage id="login.title" /></h1>
                <input type="text" name="username" className="form-control Login-username" onChange={this.updateUsername} value={this.state.username} placeholder={this.props.intl.formatMessage({
                    id: "login.username"
                })} />
                <input type="password" name="password" className="form-control Login-password" onChange={this.updatePassword} value={this.state.password} placeholder={this.props.intl.formatMessage({
                    id: "login.password"
                })} />
                <button onClick={this.tryLogin} className="Login-submit">
                    <FormattedMessage id="login.submit" />
                </button>
            </div>
        );
    }

    private updateUsername(event: React.ChangeEvent<HTMLInputElement>){
        const newUsername = event.target.value;
        this.setState((prevState: Readonly<ILoginState>) => {
            return {
                password: prevState.password,
                username: newUsername
            }
        });
    }

    private updatePassword(event: React.ChangeEvent<HTMLInputElement>){
        const newPassword = event.target.value;
        this.setState((prevState: Readonly<ILoginState>) => {
            return {
                password: newPassword,
                username: prevState.username
            }
        });
    }

    private tryLogin(event: React.MouseEvent<HTMLButtonElement>) {
        return;
    }
}

export default injectIntl(Login);