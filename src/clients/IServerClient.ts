import IUserClient from './IUserClient';

import ICredentials from "../models/ICredentials";
import ServerResponse from '../models/ServerResponse';

import { Token, Instance } from './generated';
import ITranslation from '../translations/ITranslation';
import IInstanceClient from './IInstanceClient';

export default interface IServerClient {
  readonly users: IUserClient;

  loggedIn(): boolean;

  tryLogin(credentials: ICredentials): Promise<ServerResponse<Readonly<Token>>>;
  logout(): void;

  setTranslation(translation: ITranslation): void;

  createInstanceClient(instance: Instance): IInstanceClient;

  setLoginRefreshHandler(handler: (promise: Promise<ServerResponse<Readonly<Token>>>) => void): void;
  clearLoginRefreshHandler(handler: (promise: Promise<ServerResponse<Readonly<Token>>>) => void): void;
}
