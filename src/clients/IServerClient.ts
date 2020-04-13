import ICredentials from "../models/ICredentials";
import ServerResponse from '../models/ServerResponse';

import { Token } from './generated';
import ITranslation from '../translations/ITranslation';

interface IServerClient {
  loggedIn(): boolean;

  tryLogin(credentials: ICredentials): Promise<ServerResponse<Token>>;

  setTranslation(translation: ITranslation): void;
}

export default IServerClient;
