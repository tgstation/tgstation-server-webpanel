import * as React from 'react';

import IUserClient from '../clients/IUserClient';

interface IProps {
    userClient: IUserClient;
}

export default class UserManager extends React.Component<IProps>{
    public render(): React.ReactNode {
        return <div />;
    }
}
