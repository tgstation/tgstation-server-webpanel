import * as React from 'react';

import { User } from '../../clients/generated';

import './UserBadge.css';

interface IProps {
    user: User;
    own: boolean;

    refreshAction(user: User): Promise<boolean>;
    editAction(user: User): void;
}

interface IState {
    refreshing: boolean
}

export default class UserBadge extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);

        this.state = {
            refreshing: false
        };
    }

    public render(): React.ReactNode {
        return (
            <div className="UserBadge">
                {this.props.user.name}
            </div>
        );
    }
}
