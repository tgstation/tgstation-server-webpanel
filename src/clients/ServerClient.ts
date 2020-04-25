import IHttpClient from './IHttpClient';
import IServerClient from './IServerClient';
import IUserClient from './IUserClient';
import UsersClient from './UserClient';
import IInstanceClient from './IInstanceClient';

import IApiClient, { RawRequestFunc } from './IApiClient';

import { ConfigurationParameters, Configuration, HomeApi } from './generated';
import { Token, Instance } from './generated/models';

import ICredentials from '../models/ICredentials';
import ServerResponse from '../models/ServerResponse';

import ITranslation from '../translations/ITranslation';
import InstanceClient from './InstanceClient';

export default class ServerClient implements IServerClient, IApiClient {
    private static readonly UserAgent: string = ServerClient.getUserAgent();
    private static readonly ApiVersion: string = ServerClient.getApiVersion();

    public readonly users: IUserClient;

    public readonly config: Configuration;

    private credentials: ICredentials | null;
    private token: Token | null;

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

    public setLoginRefreshHandler(
        handler: (promise: Promise<ServerResponse<Readonly<Token>>>) => void
    ): void {
        this.loginRefreshHandlers.push(handler);
    }
    public clearLoginRefreshHandler(
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

    public setTranslation(translation: ITranslation): void {
        this.translation = translation;
    }

    public logout(): void {
        this.credentials = null;
        this.token = null;
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
        const initialLogin =
            !this.credentials ||
            this.credentials.userName !== credentials.userName ||
            this.credentials.password !== credentials.password;
        this.credentials = credentials;
        return this.tryRefreshLogin(initialLogin);
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
            const refreshPromise = this.tryRefreshLogin(false);

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
                return new ServerResponse(this.translation);
            }

            return new ServerResponse(this.translation, thrownResponse);
        }
    }

    private static loadPackageJson(): any {
        const jsonPath =
            process.env.NODE_ENV === 'development'
                ? '../../package.json'
                : '../../../package.json';

        return require(jsonPath);
    }

    private static getApiVersion(): string {
        const packageJson = ServerClient.loadPackageJson();
        return `Tgstation.Server.Api/${packageJson.tgs_api_version}`;
    }

    private static getUserAgent(): string {
        const packageJson = ServerClient.loadPackageJson();
        return `${packageJson.name}/${packageJson.version}`;
    }

    private async tryRefreshLogin(
        initialLogin: boolean
    ): Promise<ServerResponse<Token>> {
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

        if (initialLogin) {
            this.loginRefreshHandlers.forEach(handler =>
                handler(responsePromise)
            );
        }

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
        await this.tryRefreshLogin(false);
    }

    private cancelLoginRefresh() {
        if (this.tokenRefreshTimeout) {
            clearTimeout(this.tokenRefreshTimeout);
            this.tokenRefreshTimeout = null;
        }
    }
}
