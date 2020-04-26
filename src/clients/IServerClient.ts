import { Token, Instance, ServerInformation } from './generated';

import IUserClient from './IUserClient';
import IInstanceClient from './IInstanceClient';

import ICredentials from '../models/ICredentials';
import ServerResponse from '../models/ServerResponse';
import TgsResponse from '../models/TgsResponse';

import ITranslation from '../translations/ITranslation';

export default interface IServerClient {
    readonly users: IUserClient;

    loggedIn(): boolean;

    tryLogin(
        credentials: ICredentials
    ): Promise<ServerResponse<Readonly<Token>>>;
    logout(): void;

    getServerInformationCached(
        forceRefresh?: boolean
    ): TgsResponse<ServerInformation>;

    setTranslation(translation: ITranslation): void;

    createInstanceClient(instance: Instance): IInstanceClient;

    setLoginRefreshHandler(
        handler: (promise: Promise<ServerResponse<Readonly<Token>>>) => void
    ): void;
    clearLoginRefreshHandler(
        handler: (promise: Promise<ServerResponse<Readonly<Token>>>) => void
    ): void;
}
