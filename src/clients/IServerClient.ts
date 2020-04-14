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

  setTranslation(translation: ITranslation): void;

  createInstanceClient(instance: Instance): IInstanceClient;
}
