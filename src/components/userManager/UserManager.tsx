import * as React from 'react';
import { RingLoader } from 'react-spinners';
import ScrollArea from 'react-scrollbar';

import IUserClient from '../../clients/IUserClient';

import { User, AdministrationRights, InstanceManagerRights } from '../../clients/generated';

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

export default class UserManager extends React.Component<IProps, IState>{
    constructor(props: IProps) {
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
        }
    }

    public async componentDidMount(): Promise<void> {
        await this.refresh(false);
    }

    public render(): React.ReactNode {
        if (this.state.editingUser)
            return <UserEditor
                userClient={this.props.userClient}
                user={this.state.editingUser}
                backAction={this.stopEditing}
                updateAction={this.updateUser}
                own={(this.state.editingUser.id === this.state.ownUser?.id)} />;

        if (!this.state.ownUser && this.state.errorMessage)
            return this.renderError();

        if (!this.state.allUsers && this.state.operation !== Operation.LoadingUsers)
            return (
                <div className="User-manager-own">
                    {this.renderOwnUser()}
                </div>
            );

        return (
            <div className="User-manager-users">
                {this.renderOwnUser()}
                {this.renderOtherUsers()}
            </div>
        );
    }

    private renderError(): React.ReactNode {
        return (
            <p className="User-manager-error">
                {this.state.errorMessage}
            </p>
        );
    }

    private renderOwnUser(): React.ReactNode {
        if (!this.state.ownUser)
            return <RingLoader className="User-manager-loading" />;

        return (
            <div className="User-manager-own">
                <UserBadge user={this.state.ownUser} refreshAction={this.refreshId} editAction={this.editUser} own={true} />
                <div className="User-manager-own-refresh">
                    <LargeButton textSize="15px" fontSize="50px" glyph="refresh" messageId="user_manager.refresh_all" onClick={this.refresh} />
                </div>
            </div>
        );
    }

    private renderOtherUsers(): React.ReactNode {
        if (this.state.operation === Operation.LoadingUsers)
            return <RingLoader className="User-manager-loading" />;

        if (this.state.errorMessage)
            return this.renderError();

        if (!this.state.allUsers)
            throw new Error("state.allUsers should be set here!");

        let otherEditors = this.state.allUsers
            .filter(user => user.id !== this.state.ownUser?.id)
            .map(user => <UserBadge user={user} refreshAction={this.refreshId} editAction={this.editUser} own={false} key={user.id} />);

        if (!this.state.ownUser?.administrationRights)
            throw new Error('state.ownUser.administrationRights was null!');

        const editButtons = [
            <LargeButton fontSize="50px" glyph="refresh" onClick={this.refreshOthers} key={-2} />
        ];

        if ((this.state.ownUser.administrationRights & AdministrationRights.WriteUsers) !== 0)
            editButtons.push(
                <LargeButton textSize="30px" fontSize="50px" glyph="plus" onClick={this.addUser} key={-1} />
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
        )
    }

    private async refresh(clearUserCache: boolean = true): Promise<void> {
        if (this.state.operation !== Operation.Idle)
            return;

        this.setState(prevState => {
            return {
                operation: Operation.LoadingCurrent,
                ownUser: null,
                allUsers: null,
                errorMessage: null,
                editingUser: prevState.editingUser
            }
        });

        const ownUser = await this.props.userClient.getCurrentCached(clearUserCache);
        if (!ownUser)
            // login refresh fail handled higher up
            return;

        if (!ownUser.model) {
            const errorMessage = await ownUser.getError();
            this.setState({
                operation: Operation.Idle,
                errorMessage
            });
            return;
        }

        if (!ownUser.model.administrationRights)
            throw new Error('administrationRights was null!');

        const canContinue = (ownUser.model.administrationRights & AdministrationRights.ReadUsers) !== 0;

        this.setState({
            operation: canContinue ? Operation.LoadingUsers : Operation.Idle,
            ownUser: ownUser.model
        });

        if (canContinue)
            await this.refreshOthers();
    }

    private async refreshOthers(): Promise<void> {
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
                    ownUser: prevState.ownUser
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
            return false;

        if (!updatedUser.model) {
            const errorMessage = await updatedUser.getError();
            this.setState(prevState => {
                return {
                    operation: Operation.Idle,
                    errorMessage,
                    ownUser: prevState.ownUser
                };
            });

            return false;
        }

        this.updateUser(updatedUser.model);
        return true;
    }

    private updateUser(updatedUser: User): void {
        if (updatedUser.id == null)
            throw new Error('updatedUser.id was null!');

        this.setState(prevState => {
            return {
                operation: prevState.operation,
                allUsers: prevState.allUsers?.map(user => {
                    if (user.id === updatedUser.id)
                        return updatedUser;
                    return user;
                }) || null,
                ownUser: prevState.ownUser?.id === updatedUser.id ? updatedUser : prevState.ownUser,
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
            }
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
            }
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
