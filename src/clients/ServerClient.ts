import IApiClient from './IApiClient';
import IHttpClient from './IHttpClient';
import IServerClient from "./IServerClient";

import IToken from 'src/models/IToken';
import ServerResponse from 'src/models/ServerResponse';

class ServerClient implements IServerClient, IApiClient {
    private readonly httpClient: IHttpClient;
    private token: IToken | null;

    public getToken(): IToken | null {
        return this.token;
    }

    public async doLogin(username: string, password: string): Promise<ServerResponse<IToken>>{

        const requestInfo: RequestInit = {

        }
        const response = await this.httpClient.runRequest("/", )

    }

    private makeApiRequest(route: string, verb: string, body?: object, instanceId?: number): Promise<Response> {
        throw new Error("Method not implemented.");
    }

    private getStandardHeaders(): HeadersInit {
        return new Headers({
            "Api": "4.0.0.0",
            "Content-Type": "application/json",
            "User-Agent": "Tgstation.Server.Api/4.0.0.0", 
            "User-Agent": "tgstation-server-control-panel/4.0.0.0", 
          });
    }
}

export default ServerClient;