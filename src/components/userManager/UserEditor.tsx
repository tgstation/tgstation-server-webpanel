import * as React from 'react';
import { InjectedIntlProps } from 'react-intl';

import {
    User,
    UserUpdate,
    AdministrationRights
} from '../../clients/generated';

import IUserClient from '../../clients/IUserClient';

import UserBadge from './UserBadge';
import PasswordField from '../utils/PasswordField';

import './UserEditor.css';
import RightsCheckbox from '../utils/RightsCheckbox';

interface IOwnProps {
    userClient: IUserClient;
    user: User;
    own: boolean;
    passwordOnly: boolean;

    updateAction(user: User): void;
    backAction(): void;
    refreshAction(user: User): Promise<boolean>;
}

interface IState {
    newUser: UserUpdate;
}

type IProps = IOwnProps & InjectedIntlProps;

export default class UserEditor extends React.Component<IProps, IState> {
    public constructor(props: IProps) {
        super(props);

        this.updatePassword = this.updatePassword.bind(this);
        this.updateAdministrationRights = this.updateAdministrationRights.bind(
            this
        );

        this.state = this.initialState();
    }

    public render(): React.ReactNode {
        if (!this.state.newUser.administrationRights)
            throw new Error(
                'state.newUser.administrationRights should be set here!'
            );

        return (
            <div className="UserEditor">
                <div className="UserEditor-content">
                    <div className="UserEditor-badge">
                        <UserBadge
                            user={this.props.user}
                            own={this.props.own}
                            refreshAction={this.props.refreshAction}
                        />
                    </div>
                    {this.renderUsernameEditor()}
                    {this.renderPasswordEditor()}
                    <div className="UserEditor-ARChangeVersion">
                        <RightsCheckbox
                            descriptionId="user_editor.ar_change_version"
                            rightToChange={AdministrationRights.ChangeVersion}
                            currentRights={
                                this.state.newUser.administrationRights
                            }
                            setRight={this.updateAdministrationRights}
                        />
                    </div>
                    <div className="UserEditor-ARRestartHost">
                        <RightsCheckbox
                            descriptionId="user_editor.ar_restart_host"
                            rightToChange={AdministrationRights.RestartHost}
                            currentRights={
                                this.state.newUser.administrationRights
                            }
                            setRight={this.updateAdministrationRights}
                        />
                    </div>
                    <div className="UserEditor-AREditOwnPassword">
                        <RightsCheckbox
                            descriptionId="user_editor.ar_edit_own_password"
                            rightToChange={AdministrationRights.EditOwnPassword}
                            currentRights={
                                this.state.newUser.administrationRights
                            }
                            setRight={this.updateAdministrationRights}
                        />
                    </div>
                    <div className="UserEditor-ARReadUsers">
                        <RightsCheckbox
                            descriptionId="user_editor.ar_read_users"
                            rightToChange={AdministrationRights.ReadUsers}
                            currentRights={
                                this.state.newUser.administrationRights
                            }
                            setRight={this.updateAdministrationRights}
                        />
                    </div>
                    <div className="UserEditor-ARWriteUsers">
                        <RightsCheckbox
                            descriptionId="user_editor.ar_write_users"
                            rightToChange={AdministrationRights.WriteUsers}
                            currentRights={
                                this.state.newUser.administrationRights
                            }
                            setRight={this.updateAdministrationRights}
                        />
                    </div>
                </div>
            </div>
        );
    }

    private renderUsernameEditor(): React.ReactNode {
        return (
            <div className="UserEditor-username">
                <div></div>
            </div>
        );
    }

    private renderPasswordEditor(): React.ReactNode {
        if (this.props.user.systemIdentifier)
            return (
                <div className="UserEditor-sysid">
                    <p>Cannot change the password of a system user.</p>
                </div>
            );

        if (!this.state.newUser.password)
            throw Error('state.newUser.password should be set here!');
        return (
            <div className="UserEditor-password">
                <PasswordField
                    value={this.state.newUser.password}
                    placeholder={this.props.intl.formatMessage({
                        id: 'user_editor.new_password'
                    })}
                    name="password"
                    onChange={this.updatePassword}
                />
            </div>
        );
    }

    private updateAdministrationRights(
        right: AdministrationRights,
        enable: boolean
    ): void {
        this.setState(prevState => {
            if (!prevState.newUser.administrationRights)
                throw new Error(
                    'prevState.newUser.administrationRights should be set here!'
                );

            const newAdminRights = enable
                ? prevState.newUser.administrationRights | right
                : prevState.newUser.administrationRights & ~right;
            return {
                newUser: {
                    name: prevState.newUser.name,
                    password: prevState.newUser.password,
                    instanceManagerRights:
                        prevState.newUser.instanceManagerRights,
                    administrationRights: newAdminRights
                }
            };
        });
    }

    private updatePassword(
        changeEvent: React.ChangeEvent<HTMLInputElement>
    ): void {
        const newPassword = changeEvent.target.value;

        this.setState(prevState => {
            return {
                newUser: {
                    name: prevState.newUser.name,
                    password: newPassword,
                    adminstrationRights: prevState.newUser.administrationRights,
                    instanceManagerRights:
                        prevState.newUser.instanceManagerRights
                }
            };
        });
    }

    private initialState(): IState {
        return {
            newUser: {
                name: this.props.user.name,
                password: '',
                administrationRights: this.props.user.administrationRights,
                instanceManagerRights: this.props.user.instanceManagerRights
            }
        };
    }
}
