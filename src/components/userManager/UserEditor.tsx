import * as React from 'react';
import { RingLoader } from 'react-spinners';
import { InjectedIntlProps, FormattedMessage, injectIntl } from 'react-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import {
    User,
    UserUpdate,
    AdministrationRights,
    InstanceManagerRights,
    ServerInformation
} from '../../clients/generated';

import IUserClient from '../../clients/IUserClient';

import UserBadge from './UserBadge';
import ColouredField, { ColourMode } from '../utils/ColouredField';
import PasswordField from '../utils/PasswordField';
import RightsCheckbox from '../utils/RightsCheckbox';

import TgsResponse from '../../models/TgsResponse';

import './UserEditor.css';

interface IOwnProps {
    userClient: IUserClient;
    serverInformation: ServerInformation;
    user: User;
    own: boolean;
    passwordOnly: boolean;

    updateAction(user: User): void;
    backAction(): void;
    refreshAction(user: User): Promise<boolean>;
}

interface IState {
    newUser: UserUpdate;
    passwordConfirm: string;
    updating: boolean;
}

type IProps = IOwnProps & InjectedIntlProps;

class UserEditor extends React.Component<IProps, IState> {
    public constructor(props: IProps) {
        super(props);

        this.submitChanges = this.submitChanges.bind(this);
        this.updatePassword = this.updatePassword.bind(this);
        this.updateUsername = this.updateUsername.bind(this);
        this.updatePasswordConfirm = this.updatePasswordConfirm.bind(this);
        this.updateAdministrationRights = this.updateAdministrationRights.bind(
            this
        );
        this.updateInstanceManagerRights = this.updateInstanceManagerRights.bind(
            this
        );
        this.enableDisable = this.enableDisable.bind(this);

        this.state = this.initialState();
    }

    public render(): React.ReactNode {
        if (this.state.updating)
            return (
                <div className="UserEditor-loading">
                    <RingLoader
                        className="margin: auto"
                        color="#E3EFFC"
                        size={500}
                    />
                </div>
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
                    <form className="UserEditor-form">
                        <div className="UserEditor-edits">
                            {this.renderEnableDisable()}
                            {this.renderUsernameEditor()}
                            {this.renderPasswordEditor()}
                            {this.renderRightsEditor()}
                        </div>
                        <button
                            type="submit"
                            className="UserEditor-apply form-control"
                            disabled={!this.checkCanApply()}
                            onClick={this.submitChanges}>
                            <FormattedMessage id="user_editor.apply" />
                        </button>
                        <button
                            className="UserEditor-cancel form-control"
                            onClick={this.props.backAction}>
                            <FormattedMessage id="user_editor.back" />
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    private renderEnableDisable(): React.ReactNode {
        if (this.state.newUser.enabled == null)
            throw new Error('state.newUser.enabled should be set here!');
        const enabling = !this.state.newUser.enabled;
        return (
            <button
                className={`UserEditor-${
                    enabling ? 'enable' : 'disable'
                } form-control`}
                onClick={this.enableDisable}>
                <FontAwesomeIcon icon={enabling ? 'check' : 'times'} />
                <FormattedMessage
                    id={enabling ? 'user_editor.enable' : 'user_editor.disable'}
                />
            </button>
        );
    }

    private renderRightsEditor(): React.ReactNode {
        if (this.state.newUser.administrationRights == null)
            throw new Error(
                'state.newUser.administrationRights should be set here!'
            );

        if (this.state.newUser.instanceManagerRights == null)
            throw new Error(
                'state.newUser.instanceManagerRights should be set here!'
            );

        return (
            <React.Fragment>
                <div className="UserEditor-ar">
                    <h4 className="UserEditor-ar-title">
                        <FormattedMessage id="user_editor.ar_title" />
                    </h4>
                    <div className="UserEditor-ar-ChangeVersion">
                        <RightsCheckbox
                            descriptionId="user_editor.ar_change_version"
                            rightToChange={AdministrationRights.ChangeVersion}
                            currentRights={
                                this.state.newUser.administrationRights
                            }
                            setRight={this.updateAdministrationRights}
                        />
                    </div>
                    <div className="UserEditor-ar-RestartHost">
                        <RightsCheckbox
                            descriptionId="user_editor.ar_restart_host"
                            rightToChange={AdministrationRights.RestartHost}
                            currentRights={
                                this.state.newUser.administrationRights
                            }
                            setRight={this.updateAdministrationRights}
                        />
                    </div>
                    <div className="UserEditor-ar-EditOwnPassword">
                        <RightsCheckbox
                            descriptionId="user_editor.ar_edit_own_password"
                            rightToChange={AdministrationRights.EditOwnPassword}
                            currentRights={
                                this.state.newUser.administrationRights
                            }
                            setRight={this.updateAdministrationRights}
                        />
                    </div>
                    <div className="UserEditor-ar-ReadUsers">
                        <RightsCheckbox
                            descriptionId="user_editor.ar_read_users"
                            rightToChange={AdministrationRights.ReadUsers}
                            currentRights={
                                this.state.newUser.administrationRights
                            }
                            setRight={this.updateAdministrationRights}
                        />
                    </div>
                    <div className="UserEditor-ar-WriteUsers">
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
                <div className="UserEditor-ir">
                    <h4 className="UserEditor-ir-title">
                        <FormattedMessage id="user_editor.ir_title" />
                    </h4>
                    <div className="UserEditor-ir-Create">
                        <RightsCheckbox
                            descriptionId="user_editor.ir_create"
                            rightToChange={InstanceManagerRights.Create}
                            currentRights={
                                this.state.newUser.instanceManagerRights
                            }
                            setRight={this.updateInstanceManagerRights}
                        />
                    </div>
                    <div className="UserEditor-ir-Detach">
                        <RightsCheckbox
                            descriptionId="user_editor.ir_detach"
                            rightToChange={InstanceManagerRights.Delete}
                            currentRights={
                                this.state.newUser.instanceManagerRights
                            }
                            setRight={this.updateInstanceManagerRights}
                        />
                    </div>
                    <div className="UserEditor-ir-Read">
                        <RightsCheckbox
                            descriptionId="user_editor.ir_read"
                            rightToChange={InstanceManagerRights.Read}
                            currentRights={
                                this.state.newUser.instanceManagerRights
                            }
                            setRight={this.updateInstanceManagerRights}
                        />
                    </div>
                    <div className="UserEditor-ir-List">
                        <RightsCheckbox
                            descriptionId="user_editor.ir_list"
                            rightToChange={InstanceManagerRights.List}
                            currentRights={
                                this.state.newUser.instanceManagerRights
                            }
                            setRight={this.updateInstanceManagerRights}
                        />
                    </div>
                    <div className="UserEditor-ir-Relocate">
                        <RightsCheckbox
                            descriptionId="user_editor.ir_relocate"
                            rightToChange={InstanceManagerRights.Relocate}
                            currentRights={
                                this.state.newUser.instanceManagerRights
                            }
                            setRight={this.updateInstanceManagerRights}
                        />
                    </div>
                    <div className="UserEditor-ir-Rename">
                        <RightsCheckbox
                            descriptionId="user_editor.ir_rename"
                            rightToChange={InstanceManagerRights.Rename}
                            currentRights={
                                this.state.newUser.instanceManagerRights
                            }
                            setRight={this.updateInstanceManagerRights}
                        />
                    </div>
                    <div className="UserEditor-ir-AutoUpdate">
                        <RightsCheckbox
                            descriptionId="user_editor.ir_auto_update"
                            rightToChange={InstanceManagerRights.SetAutoUpdate}
                            currentRights={
                                this.state.newUser.instanceManagerRights
                            }
                            setRight={this.updateInstanceManagerRights}
                        />
                    </div>
                    <div className="UserEditor-ir-ConfigMode">
                        <RightsCheckbox
                            descriptionId="user_editor.ir_config_mode"
                            rightToChange={
                                InstanceManagerRights.SetConfiguration
                            }
                            currentRights={
                                this.state.newUser.instanceManagerRights
                            }
                            setRight={this.updateInstanceManagerRights}
                        />
                    </div>
                    <div className="UserEditor-ir-Online">
                        <RightsCheckbox
                            descriptionId="user_editor.ir_online"
                            rightToChange={InstanceManagerRights.SetOnline}
                            currentRights={
                                this.state.newUser.instanceManagerRights
                            }
                            setRight={this.updateInstanceManagerRights}
                        />
                    </div>
                </div>
            </React.Fragment>
        );
    }

    private renderUsernameEditor(): React.ReactNode {
        if (this.props.user.systemIdentifier) return null;

        if (this.state.newUser.name == null)
            throw new Error('state.newUser.name should be set here!');
        if (this.props.user.name == null)
            throw new Error('props.user.name should be set here!');

        const validNameChange =
            this.state.newUser.name === '' ||
            this.state.newUser.name.toUpperCase() ===
                this.props.user.name.toUpperCase();
        return (
            <div className="UserEditor-username">
                <ColouredField
                    mode={validNameChange ? ColourMode.Normal : ColourMode.Red}
                    value={this.state.newUser.name}
                    name="username"
                    placeholder={this.props.intl.formatMessage({
                        id: 'user_editor.change_username'
                    })}
                    onChange={this.updateUsername}
                />
            </div>
        );
    }

    private renderPasswordEditor(): React.ReactNode {
        if (this.props.user.systemIdentifier)
            return (
                <div className="UserEditor-sysid">
                    <p>
                        <FormattedMessage id="user_editor.system_identifier_password" />
                    </p>
                </div>
            );

        if (this.state.newUser.password == null)
            throw Error('state.newUser.password should be set here!');
        return (
            <React.Fragment>
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
                <div className="UserEditor-password-confirm">
                    <PasswordField
                        value={this.state.passwordConfirm}
                        placeholder={this.props.intl.formatMessage({
                            id: 'user_editor.confirm_password'
                        })}
                        name="password_confirm"
                        onChange={this.updatePasswordConfirm}
                    />
                </div>
            </React.Fragment>
        );
    }

    private checkCanApply(): boolean {
        if (this.state.newUser.password !== this.state.passwordConfirm)
            return false;

        return !(
            this.props.user.id != null &&
            this.state.newUser.name !== '' &&
            this.props.user.name?.toUpperCase() !==
                this.state.newUser.name?.toUpperCase()
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
                    enabled: prevState.newUser.enabled,
                    instanceManagerRights:
                        prevState.newUser.instanceManagerRights,
                    administrationRights: newAdminRights
                },
                passwordConfirm: prevState.passwordConfirm,
                updating: prevState.updating
            };
        });
    }

    private updateInstanceManagerRights(
        right: InstanceManagerRights,
        enable: boolean
    ): void {
        this.setState(prevState => {
            if (!prevState.newUser.instanceManagerRights)
                throw new Error(
                    'prevState.newUser.instanceManagerRights should be set here!'
                );

            const newManagerRights = enable
                ? prevState.newUser.instanceManagerRights | right
                : prevState.newUser.instanceManagerRights & ~right;
            return {
                newUser: {
                    name: prevState.newUser.name,
                    password: prevState.newUser.password,
                    enabled: prevState.newUser.enabled,
                    instanceManagerRights: newManagerRights,
                    administrationRights: prevState.newUser.administrationRights
                },
                passwordConfirm: prevState.passwordConfirm,
                updating: prevState.updating
            };
        });
    }

    private enableDisable(): void {
        this.setState(prevState => {
            if (prevState.newUser.enabled == null)
                throw new Error(
                    'prevState.newUser.enabled should be set here!'
                );
            return {
                newUser: {
                    name: prevState.newUser.name,
                    password: prevState.newUser.password,
                    administrationRights:
                        prevState.newUser.administrationRights,
                    instanceManagerRights:
                        prevState.newUser.instanceManagerRights,
                    enabled: !prevState.newUser.enabled
                },
                passwordConfirm: prevState.passwordConfirm,
                updating: prevState.updating
            };
        });
    }

    private updateUsername(
        changeEvent: React.ChangeEvent<HTMLInputElement>
    ): void {
        const newName = changeEvent.target.value;

        this.setState(prevState => {
            return {
                newUser: {
                    name: newName,
                    password: prevState.newUser.password,
                    enabled: prevState.newUser.enabled,
                    adminstrationRights: prevState.newUser.administrationRights,
                    instanceManagerRights:
                        prevState.newUser.instanceManagerRights
                },
                passwordConfirm: prevState.passwordConfirm,
                updating: prevState.updating
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
                    enabled: prevState.newUser.enabled,
                    adminstrationRights: prevState.newUser.administrationRights,
                    instanceManagerRights:
                        prevState.newUser.instanceManagerRights
                },
                passwordConfirm: prevState.passwordConfirm,
                updating: prevState.updating
            };
        });
    }

    private updatePasswordConfirm(
        changeEvent: React.ChangeEvent<HTMLInputElement>
    ): void {
        const newPassword = changeEvent.target.value;

        this.setState(prevState => {
            return {
                newUser: prevState.newUser,
                passwordConfirm: newPassword,
                updating: prevState.updating
            };
        });
    }

    private async submitChanges(): Promise<void> {
        if (this.state.updating) return;

        this.setState(prevState => {
            return {
                newUser: prevState.newUser,
                updating: true,
                passwordConfirm: prevState.passwordConfirm
            };
        });

        const updatingUser: UserUpdate = { ...this.state.newUser };

        if (updatingUser.name === '') updatingUser.name = undefined;
        if (updatingUser.password === '') updatingUser.password = undefined;

        updatingUser.id = this.props.user.id;

        let promise: TgsResponse<User>;
        if (updatingUser.id == null)
            promise = this.props.userClient.create(updatingUser);
        else promise = this.props.userClient.update(updatingUser);

        const updatedUser = await promise;
        if (!updatedUser) return;

        if (!updatedUser.model) {
            const errorMessage = await updatedUser.getError();
            alert(errorMessage);
        } else {
            this.props.updateAction(updatedUser.model);
        }

        this.setState(prevState => {
            return {
                newUser: prevState.newUser,
                passwordConfirm: prevState.passwordConfirm,
                updating: false
            };
        });
    }

    private initialState(): IState {
        return {
            newUser: {
                name: '',
                password: '',
                administrationRights: this.props.user.administrationRights,
                instanceManagerRights: this.props.user.instanceManagerRights,
                enabled: this.props.user.enabled
            },
            passwordConfirm: '',
            updating: false
        };
    }
}

export default injectIntl(UserEditor);
