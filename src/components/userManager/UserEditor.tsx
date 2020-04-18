import * as React from 'react';

import { User } from '../../clients/generated';

import IUserClient from '../../clients/IUserClient';

import './UserEditor.css';
import UserBadge from './UserBadge';

interface IProps {
    userClient: IUserClient;
    user: User;
    own: boolean;

    updateAction(user: User): void;
    backAction(): void;
    refreshAction(user: User): Promise<boolean>;
}

export default class UserEditor extends React.Component<IProps> {
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
                </div>
            </div>
        );
    }
}
