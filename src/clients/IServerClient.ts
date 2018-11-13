import IToken from "src/models/IToken";
import ServerResponse from 'src/models/ServerResponse';

interface IServerClient {
    getToken(): IToken | null;

    doLogin(username: string, password: string): Promise<ServerResponse<IToken>>;
}

export default IServerClient;
