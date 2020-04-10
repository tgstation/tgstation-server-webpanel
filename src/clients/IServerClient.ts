import IToken from "../models/IToken";
import ServerResponse from "../models/ServerResponse";

import ICredentials from "../models/ICredentials";

interface IServerClient {
  getToken(): IToken | null;

  doLogin(credentials: ICredentials): Promise<ServerResponse<IToken>>;
}

export default IServerClient;
