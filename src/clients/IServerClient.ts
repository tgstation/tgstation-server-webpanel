import IToken from "src/models/IToken";
import ServerResponse from 'src/models/ServerResponse';

import ICredentials from 'src/models/ICredentials';

interface IServerClient {
    getToken(): IToken | null;

    doLogin(credentials: ICredentials): Promise<ServerResponse<IToken>>;
}

export default IServerClient;
