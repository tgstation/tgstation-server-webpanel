import IUserClient from './IUserClient';

import ICredentials from "../models/ICredentials";
import ServerResponse from '../models/ServerResponse';

import { Token } from './generated';
import ITranslation from '../translations/ITranslation';

interface IServerClient {
  readonly user: IUserClient;

  loggedIn(): boolean;

  tryLogin(credentials: ICredentials): Promise<ServerResponse<Token>>;

  setTranslation(translation: ITranslation): void;
}

export default IServerClient;
