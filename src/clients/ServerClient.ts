import IHttpClient from './IHttpClient';
import IServerClient from './IServerClient';
import IUserClient from './IUserClient';
import UsersClient from './UserClient';
import IInstanceClient from './IInstanceClient';
import InstanceClient from './InstanceClient';
import IApiClient, { RawRequestFunc } from './IApiClient';

import { ConfigurationParameters, Configuration, HomeApi } from './generated';
import { Token, Instance, ServerInformation } from './generated/models';

import ICredentials from '../models/ICredentials';
import ServerResponse from '../models/ServerResponse';
import TgsResponse from '../models/TgsResponse';

import ITranslation from '../translations/ITranslation';

export default class ServerClient implements IServerClient, IApiClient {
    private static readonly UserAgent: string = ServerClient.getUserAgent();
    private static readonly ApiVersion: string = ServerClient.getApiVersion();

    public readonly users: IUserClient;

    public readonly config: Configuration;

    private credentials: ICredentials | null;
    private token: Token | null;

    private currentServerInformationPromise: TgsResponse<
        ServerInformation
    > | null;
    private currentServerInformation: ServerResponse<ServerInformation> | null;
    private currentServerInformationCacheToken: Token | null;

    private translation: ITranslation | null;

    private loginRefreshHandlers: Array<
        (promise: Promise<ServerResponse<Readonly<Token>>>) => void
    >;

    private tokenRefreshTimeout: NodeJS.Timeout | null;

    public constructor(private readonly httpClient: IHttpClient) {
        this.loginRefresh = this.loginRefresh.bind(this);
        this.token = null;
        this.tokenRefreshTimeout = null;
        this.credentials = null;
        this.translation = null;
        this.currentServerInformation = null;
        this.currentServerInformationCacheToken = null;
        this.currentServerInformationPromise = null;

        const configParameters: ConfigurationParameters = {
            basePath: httpClient.serverUrl,
            accessToken: () => this.token?.bearer || '',
            headers: {
                Accept: 'application/json'
            }
        };

        // eslint-disable-next-line
        this.config = new Configuration(configParameters);
        this.users = new UsersClient(this);

        this.loginRefreshHandlers = [];
    }

    public async getServerInformationCached(
        forceRefresh?: boolean
    ): Promise<ServerResponse<ServerInformation> | null> {
        if (forceRefresh) {
            this.currentServerInformationCacheToken = null;
            this.currentServerInformation = null;
        }

        if (
            this.currentServerInformation &&
            this.currentServerInformationCacheToken === this.getToken()
        ) {
            return this.currentServerInformation;
        }

        const controlOfPromise = !this.currentServerInformationPromise;
        if (controlOfPromise) {
            const homeApi = new HomeApi(this.config);
            this.currentServerInformationPromise = this.makeApiRequest(
                homeApi.homeControllerHomeRaw.bind(homeApi)
            );
        }

        const result = await this.currentServerInformationPromise;

        if (controlOfPromise) {
            this.currentServerInformationPromise = null;
            if (result?.model) {
                this.currentServerInformation = result;
                this.currentServerInformationCacheToken = this.getToken();
            } else {
                this.currentServerInformation = null;
                this.currentServerInformationCacheToken = null;
            }
        }

        return result;
    }

    public setLoginHandler(
        handler: (promise: Promise<ServerResponse<Readonly<Token>>>) => void
    ): void {
        this.loginRefreshHandlers.push(handler);
    }
    public clearLoginHandler(
        handler: (promise: Promise<ServerResponse<Readonly<Token>>>) => void
    ): void {
        this.loginRefreshHandlers = this.loginRefreshHandlers.filter(
            oldHandler => oldHandler !== handler
        );
    }

    public createInstanceClient(instance: Instance): IInstanceClient {
        if (!instance.id) throw new Error('Instance missing ID!');

        return new InstanceClient(this, instance.id);
    }

    public getTranslation(): ITranslation | null {
        return this.translation;
    }

    public setTranslation(translation: ITranslation): void {
        this.translation = translation;
    }

    public logout(): void {
        this.credentials = null;
        this.token = null;

        if (this.translation == null)
            throw new Error('translation should be set here!');

        const promise = Promise.resolve(
            new ServerResponse<Readonly<Token>>(
                this.translation,
                null,
                null,
                this.translation.messages['server_client.logout']
            )
        );
        this.loginRefreshHandlers.forEach(handler => handler(promise));
    }

    public loggedIn(): boolean {
        if (!this.token?.expiresAt) return false;
        const now = new Date();
        return this.token.expiresAt > now;
    }

    public getToken(): Token | null {
        return this.token;
    }

    public tryLogin(credentials: ICredentials): Promise<ServerResponse<Token>> {
        this.credentials = credentials;
        return this.tryLoginWithCredentials();
    }

    public async makeApiRequest<TRequestParameters, TModel>(
        rawRequestFunc: RawRequestFunc<TRequestParameters, TModel>,
        instanceId?: number | null,
        requestParameters?: TRequestParameters | null,
        requiresToken: boolean = true
    ): Promise<ServerResponse<TModel> | null> {
        if (!this.translation)
            throw new Error('ServerClient translation not set!');

        if (requiresToken && !this.token) {
            const refreshPromise = this.tryLoginWithCredentials();

            const refreshResponse = await refreshPromise;
            if (!refreshResponse.model) {
                return null;
            }
        }

        requestParameters = requestParameters || ({} as TRequestParameters);

        const basicRequestParameters = {
            api: ServerClient.ApiVersion,
            userAgent: ServerClient.UserAgent,
            instanceId
        };

        requestParameters = { ...basicRequestParameters, ...requestParameters };

        try {
            const apiResponse = await rawRequestFunc(requestParameters);
            const model = await apiResponse.value();

            return new ServerResponse(this.translation, apiResponse.raw, model);
        } catch (thrownResponse) {
            if (!(thrownResponse instanceof Response)) {
                return new ServerResponse<TModel>(
                    this.translation,
                    null,
                    null,
                    thrownResponse.toString()
                );
            }

            return new ServerResponse(this.translation, thrownResponse);
        }
    }

    public static getApiVersion(): string {
        const apiVersion = '6.0.0';
        return `Tgstation.Server.Api/${apiVersion}`;
    }

    public static getUserAgent(): string {
        return 'tgstation-server-control-panel/0.4.0';
    }

    private async tryLoginWithCredentials(): Promise<ServerResponse<Token>> {
        this.cancelLoginRefresh();

        if (!this.credentials) {
            throw new Error('Invalid credentials!');
        }

        // we need to create this configuration object every time because it's where the username/parameters are set
        const loginHomeApi = new HomeApi(
            new Configuration({
                basePath: this.httpClient.serverUrl,
                headers: {
                    Accept: 'application/json'
                },
                username: this.credentials.userName,
                password: this.credentials.password
            })
        );

        const responsePromise = this.makeApiRequest(
            loginHomeApi.homeControllerCreateTokenRaw.bind(loginHomeApi),
            null,
            null,
            false
        ) as Promise<ServerResponse<Token>>;

        this.loginRefreshHandlers.forEach(handler => handler(responsePromise));

        const serverResponse = await responsePromise;

        if (!serverResponse) throw new Error('Login request returned null!');

        if (serverResponse.model) {
            this.token = serverResponse.model;

            if (serverResponse.model?.expiresAt) {
                this.tokenRefreshTimeout = setTimeout(
                    () => this.loginRefresh(),
                    new Date(serverResponse.model.expiresAt).getTime() -
                        Date.now()
                );
            }
        } else {
            this.credentials = null;
        }

        return serverResponse;
    }

    private async loginRefresh(): Promise<void> {
        await this.tryLoginWithCredentials();
    }

    private cancelLoginRefresh() {
        if (this.tokenRefreshTimeout) {
            clearTimeout(this.tokenRefreshTimeout);
            this.tokenRefreshTimeout = null;
        }
    }
}
