import * as React from 'react';
import { RingLoader } from 'react-spinners';
import ScrollArea from 'react-scrollbar';

import IUserClient from '../../clients/IUserClient';

import {
    User,
    AdministrationRights,
    InstanceManagerRights
} from '../../clients/generated';

import UserEditor from './UserEditor';
import LargeButton from '../utils/LargeButton';

import './UserManager.css';
import UserBadge from './UserBadge';

interface IProps {
    userClient: IUserClient;
}

enum Operation {
    LoadingCurrent,
    LoadingUsers,
    Idle
}

interface IState {
    operation: Operation;
    ownUser: User | null;
    editingUser: User | null;
    errorMessage: string | null;
    allUsers: ReadonlyArray<User> | null;
}

export default class UserManager extends React.Component<IProps, IState> {
    public constructor(props: IProps) {
        super(props);

        this.refresh = this.refresh.bind(this);
        this.refreshOthers = this.refreshOthers.bind(this);
        this.refreshId = this.refreshId.bind(this);
        this.addUser = this.addUser.bind(this);
        this.editUser = this.editUser.bind(this);
        this.stopEditing = this.stopEditing.bind(this);
        this.updateUser = this.updateUser.bind(this);

        this.state = {
            operation: Operation.Idle,
            ownUser: null,
            editingUser: null,
            errorMessage: null,
            allUsers: null
        };
    }

    public async componentDidMount(): Promise<void> {
        await this.refresh(false);
    }

    public render(): React.ReactNode {
        if (this.state.editingUser)
            return (
                <UserEditor
                    userClient={this.props.userClient}
                    user={this.state.editingUser}
                    backAction={this.stopEditing}
                    updateAction={this.updateUser}
                    own={this.state.editingUser.id === this.state.ownUser?.id}
                    refreshAction={this.refreshId}
                />
            );

        if (!this.state.ownUser && this.state.errorMessage)
            return this.renderError();

        if (
            !this.state.allUsers &&
            this.state.operation !== Operation.LoadingUsers
        )
            return this.renderOwnUser();

        return (
            <div className="User-manager-users">
                {this.renderOwnUser()}
                {this.renderOtherUsers()}
            </div>
        );
    }

    private renderError(): React.ReactNode {
        return <p className="User-manager-error">{this.state.errorMessage}</p>;
    }

    private renderOwnUser(): React.ReactNode {
        if (!this.state.ownUser) return this.renderLoader();

        return (
            <div className="User-manager-own">
                <UserBadge
                    user={this.state.ownUser}
                    refreshAction={this.refreshId}
                    editAction={this.editUser}
                    own={true}
                />
                <div className="User-manager-own-refresh">
                    <LargeButton
                        textSize="15px"
                        fontSize="50px"
                        glyph="refresh"
                        messageId="user_manager.refresh_all"
                        onClick={this.refresh}
                    />
                </div>
            </div>
        );
    }

    private renderLoader(): React.ReactNode {
        return (
            <div className="User-manager-loading">
                <RingLoader color="#E3EFFC" size={500} />
            </div>
        );
    }

    private renderOtherUsers(): React.ReactNode {
        if (this.state.operation === Operation.LoadingUsers)
            return (
                <div className="User-manager-loading-others">
                    {this.renderLoader()}
                </div>
            );

        if (this.state.errorMessage) return this.renderError();

        if (!this.state.allUsers)
            throw new Error('state.allUsers should be set here!');

        let otherEditors = this.state.allUsers
            .filter(user => user.id !== this.state.ownUser?.id)
            .map(user => (
                <UserBadge
                    user={user}
                    refreshAction={this.refreshId}
                    editAction={this.editUser}
                    own={false}
                    key={user.id}
                />
            ));

        if (!this.state.ownUser?.administrationRights)
            throw new Error('state.ownUser.administrationRights was null!');

        const editButtons = [
            <LargeButton
                fontSize="50px"
                glyph="refresh"
                onClick={this.refreshOthers}
                key={-2}
            />
        ];

        if (
            (this.state.ownUser.administrationRights &
                AdministrationRights.WriteUsers) !==
            0
        )
            editButtons.push(
                <LargeButton
                    textSize="30px"
                    fontSize="50px"
                    glyph="plus"
                    onClick={this.addUser}
                    key={-1}
                />
            );

        return (
            <div className="User-manager-others">
                <div className="User-manager-editor-controls">
                    {editButtons}
                </div>
                <ScrollArea className="User-manager-editor">
                    {otherEditors}
                </ScrollArea>
            </div>
        );
    }

    private async refresh(clearUserCache: boolean = true): Promise<void> {
        if (this.state.operation !== Operation.Idle) return;

        this.setState(prevState => {
            return {
                operation: Operation.LoadingCurrent,
                ownUser: null,
                allUsers: null,
                errorMessage: null,
                editingUser: prevState.editingUser
            };
        });

        const ownUser = await this.props.userClient.getCurrentCached(
            clearUserCache
        );
        if (!ownUser)
            // login refresh fail handled higher up
            return;

        const result = ownUser.model;
        if (!result) {
            const errorMessage = await ownUser.getError();
            this.setState(prevState => {
                return {
                    operation: Operation.Idle,
                    errorMessage,
                    allUsers: null,
                    ownUser: null,
                    editingUser: prevState.editingUser
                };
            });
            return;
        }

        this.setState(prevState => {
            return {
                operation: Operation.Idle,
                allUsers: prevState.allUsers,
                ownUser: result,
                editingUser: prevState.editingUser,
                errorMessage: prevState.errorMessage
            };
        });

        if (!result.administrationRights)
            throw new Error('administrationRights was null!');

        const canContinue =
            (result.administrationRights & AdministrationRights.ReadUsers) !==
            0;

        if (canContinue) await this.refreshOthers();
    }

    private async refreshOthers(): Promise<void> {
        this.setState(prevState => {
            return {
                operation: Operation.LoadingUsers,
                allUsers: prevState.allUsers,
                ownUser: prevState.ownUser,
                editingUser: prevState.editingUser,
                errorMessage: prevState.errorMessage
            };
        });

        const allUsers = await this.props.userClient.list();
        if (!allUsers)
            // login refresh fail handled higher up
            return;

        const result = allUsers.model;
        if (!result) {
            const errorMessage = await allUsers.getError();
            this.setState(prevState => {
                return {
                    operation: Operation.Idle,
                    errorMessage,
                    ownUser: prevState.ownUser,
                    editingUser: prevState.editingUser,
                    allUsers: prevState.allUsers
                };
            });
            return;
        }

        this.setState(prevState => {
            return {
                operation: Operation.Idle,
                allUsers: result,
                ownUser: prevState.ownUser,
                editingUser: prevState.editingUser,
                errorMessage: prevState.errorMessage
            };
        });
    }

    private async refreshId(user: User): Promise<boolean> {
        const updatedUser = await this.props.userClient.getId(user);
        if (!updatedUser)
            // login refresh fail handled higher up
            return true;

        if (!updatedUser.model) {
            const errorMessage = await updatedUser.getError();
            this.setState(prevState => {
                return {
                    operation: Operation.Idle,
                    errorMessage,
                    ownUser: prevState.ownUser,
                    editingUser: prevState.editingUser,
                    allUsers: prevState.allUsers
                };
            });

            return true;
        }

        this.updateUser(updatedUser.model);
        return false;
    }

    private updateUser(updatedUser: User): void {
        if (updatedUser.id == null) throw new Error('updatedUser.id was null!');

        this.setState(prevState => {
            return {
                operation: prevState.operation,
                allUsers:
                    prevState.allUsers?.map(user => {
                        if (user.id === updatedUser.id) return updatedUser;
                        return user;
                    }) || null,
                ownUser:
                    prevState.ownUser?.id === updatedUser.id
                        ? updatedUser
                        : prevState.ownUser,
                editingUser: prevState.editingUser,
                errorMessage: prevState.errorMessage
            };
        });
    }

    private stopEditing(): void {
        this.setState(prevState => {
            return {
                operation: prevState.operation,
                ownUser: prevState.ownUser,
                editingUser: null,
                errorMessage: prevState.errorMessage,
                allUsers: prevState.allUsers
            };
        });
    }

    private editUser(user: User): void {
        this.setState(prevState => {
            return {
                operation: prevState.operation,
                ownUser: prevState.ownUser,
                editingUser: user,
                errorMessage: prevState.errorMessage,
                allUsers: prevState.allUsers
            };
        });
    }

    private addUser(): void {
        this.editUser({
            name: '',
            administrationRights: AdministrationRights.None,
            instanceManagerRights: InstanceManagerRights.None,
            enabled: false
        });
    }
}
