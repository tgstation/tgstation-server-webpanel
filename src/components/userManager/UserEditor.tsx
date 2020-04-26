import * as React from 'react';
import { InjectedIntlProps, FormattedMessage, injectIntl } from 'react-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

import {
    User,
    UserUpdate,
    AdministrationRights,
    InstanceManagerRights,
    ServerInformation
} from '../../clients/generated';

import IUserClient from '../../clients/IUserClient';

import UserBadge from './UserBadge';

import PasswordField from '../utils/PasswordField';
import RightsCheckbox from '../utils/RightsCheckbox';

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
}

type IProps = IOwnProps & InjectedIntlProps;

class UserEditor extends React.Component<IProps, IState> {
    public constructor(props: IProps) {
        super(props);

        this.updatePassword = this.updatePassword.bind(this);
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
                    <form>
                        <div className="UserEditor-edits">
                            {this.renderEnableDisable()}
                            {this.renderUsernameEditor()}
                            {this.renderPasswordEditor()}
                            {this.renderRightsEditor()}
                        </div>
                        <button
                            type="submit"
                            className="UserEditor-apply"
                            disabled={!this.checkCanApply()}>
                            <FormattedMessage id="user_editor.apply" />
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    private renderEnableDisable(): React.ReactNode {
        if (this.state.newUser.enabled == null)
            throw new Error('state.newUser.enabled should be set here!');
        const enabling = this.state.newUser.enabled;
        return (
            <button
                className={`UserEditor-${
                    enabling ? 'enable' : 'disable'
                } form-control`}
                onClick={this.enableDisable}>
                <FontAwesomeIcon icon={faCheck} />
                <FormattedMessage
                    id={enabling ? 'user_editor.enable' : 'user_editor.disable'}
                />
            </button>
        );
    }

    private renderRightsEditor(): React.ReactNode {
        if (!this.state.newUser.administrationRights)
            throw new Error(
                'state.newUser.administrationRights should be set here!'
            );

        if (!this.state.newUser.instanceManagerRights)
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
        if (this.props.user.systemIdentifier)
            return (
                <div className="UserEditor-sysid">
                    <p>Cannot change the name of a system user.</p>
                </div>
            );

        return (
            <div className="UserEditor-username">
                <div></div>
            </div>
        );
    }

    private renderPasswordEditor(): React.ReactNode {
        if (this.props.user.systemIdentifier) return <div />;

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

    private checkCanApply(): boolean {
        //TODO: Check minimum password length

        if (
            this.props.user.id != null &&
            this.props.user.name?.toUpperCase() !==
                this.state.newUser.name?.toUpperCase()
        )
            // Changing username (other than casing)
            return false;

        return true;
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
                }
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
                }
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
                    enabled: prevState.newUser.enabled,
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
                instanceManagerRights: this.props.user.instanceManagerRights,
                enabled: this.props.user.enabled
            }
        };
    }
}

export default injectIntl(UserEditor);
