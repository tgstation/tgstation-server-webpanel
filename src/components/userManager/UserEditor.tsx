import * as React from 'react';

import { User } from '../../clients/generated';

import IUserClient from '../../clients/IUserClient';

interface IProps {
    userClient: IUserClient;
    user: User;
    own: boolean;
}

export default class UserEditor extends React.Component<IProps> {
    public render(): React.ReactNode {
        if (!this.props.user.name)
            throw new Error("props.user.name should be set here!");

        return <div />
    }
}
