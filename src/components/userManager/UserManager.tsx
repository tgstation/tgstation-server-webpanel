import * as React from 'react';
import { RingLoader } from 'react-spinners';
import ScrollArea from 'react-scrollbar';

import IUserClient from '../../clients/IUserClient';

import { User, AdministrationRights } from '../../clients/generated';

import UserEditor from './UserEditor';

import './UserManager.css';

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
    ownUser?: User;
    errorMessage?: string;
    allUsers?: ReadonlyArray<User>;
}

export default class UserManager extends React.Component<IProps, IState>{
    constructor(props: IProps) {
        super(props);

        this.state = {
            operation: Operation.Idle
        }
    }

    public async componentDidMount(): Promise<void> {
        await this.refresh(false);
    }

    public render(): React.ReactNode {
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
                <div className="User-manager-own">
                    {this.renderOwnUser()}
                </div>
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

        return <UserEditor userClient={this.props.userClient} user={this.state.ownUser} own={true} />;
    }

    private renderOtherUsers(): React.ReactNode {
        if (this.state.operation === Operation.LoadingUsers)
            return <RingLoader className="User-manager-loading" />;

        if (this.state.errorMessage)
            return this.renderError();

        if (!this.state.allUsers)
            throw new Error("state.allUsers should be set here!");

        const otherEditors = this.state.allUsers
            .filter(user => user.id !== this.state.ownUser?.id)
            .map(user => <UserEditor userClient={this.props.userClient} user={user} own={false} />);
        return (
            <ScrollArea className="User-manager-others">
                {otherEditors}
            </ScrollArea>
        )
    }

    private async refresh(clearUserCache?: boolean): Promise<void> {
        if (this.state.operation !== Operation.Idle)
            return;

        this.setState({
            operation: Operation.LoadingCurrent
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

        if (!allUsers.model) {
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
                allUsers: allUsers.model,
                ownUser: prevState.ownUser
            };
        });
    }
}
