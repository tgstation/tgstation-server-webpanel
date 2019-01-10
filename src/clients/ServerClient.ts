import IApiClient from "./IApiClient";
import IHttpClient from "./IHttpClient";
import IServerClient from "./IServerClient";

import ICredentials from "../models/ICredentials";
import IToken from "../models/IToken";
import ServerResponse from "../models/ServerResponse";

const AuthorizationHeader: string = "Authorization";

class ServerClient implements IServerClient, IApiClient {
    private readonly httpClient: IHttpClient;
    private token: IToken | null;

    private onLoginRefreshStart?: () => void;
    private onLoginRefreshFailure?: () => void;

    private tokenRefreshTimeout: NodeJS.Timeout | null;

    constructor(httpClient: IHttpClient) {
        this.httpClient = httpClient;
        this.loginRefresh = this.loginRefresh.bind(this);
        this.token = null;
        this.tokenRefreshTimeout = null;
    }

    public getToken(): IToken | null {
        return this.token;
    }

    public setRefreshHandlers(onLoginRefreshStart?: () => void, onLoginRefreshFailure?: () => void) {
        this.onLoginRefreshStart = onLoginRefreshStart;
        this.onLoginRefreshFailure = onLoginRefreshFailure;
    }

    public async doLogin(credentials: ICredentials): Promise<ServerResponse<IToken>> {
        this.cancelLoginRefresh();
        const headers = this.getStandardHeaders();
        headers.append("Username", credentials.username);
        headers.append(AuthorizationHeader, "Password " + credentials.password);
        const requestInfo: RequestInit = {
            headers,
            method: "POST"
        };
        const response = await this.httpClient.runRequest("/", requestInfo);

        const serverResponse = new ServerResponse<IToken>(response);
        if (serverResponse.response.ok) {
            this.token = await serverResponse.getModel();
            this.tokenRefreshTimeout = setTimeout(
                () => this.loginRefresh(credentials),
                new Date(this.token.expiresAt).getTime() - Date.now() + 30000); // 30 second buffer
        }
        return serverResponse;
    }

    public makeApiRequest(route: string, verb: string, body?: object, instanceId?: number): Promise<Response> {
        if (this.token == null)
            throw new Error("token is unset!");

        const headers = this.getStandardHeaders();
        headers.append(AuthorizationHeader, this.token.bearer);
        if (instanceId)
            headers.append("Instance", instanceId.toString());
        const requestInfo: RequestInit = {
            headers,
            method: verb
        };
        if (body)
            requestInfo.body = JSON.stringify(body);

        return this.httpClient.runRequest(route, requestInfo);
    }

    public cancelLoginRefresh() {
        if (this.tokenRefreshTimeout) {
            clearTimeout(this.tokenRefreshTimeout);
            this.tokenRefreshTimeout = null;
        }
    }

    private async loginRefresh(credentials: ICredentials) {
        if (this.onLoginRefreshStart)
            this.onLoginRefreshStart();
        const result = await this.doLogin(credentials);
        if (this.onLoginRefreshFailure && (!result.response.ok || !await result.getModel()))
            this.onLoginRefreshFailure();
    }

    private getStandardHeaders(): Headers {
        return new Headers({
            "Accept": "application/json",
            "Api": "Tgstation.Server.Api/4.0.0.0",
            "Content-Type": "application/json",
            "User-Agent": "tgstation-server-control-panel/4.0.0.0"
        });
    }
}

export default ServerClient;
