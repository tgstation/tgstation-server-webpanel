import { Client, Components } from './_generated';
import { AxiosError, AxiosResponse, OpenAPIClientAxios } from 'openapi-client-axios';
import { ICredentials } from '../models/ICredentials';
import { TypedEmitter } from 'tiny-typed-emitter/lib';
import InternalError, { ErrorCode, GenericErrors } from '../models/InternalComms/InternalError';
import InternalStatus, { StatusCode } from '../models/InternalComms/InternalStatus';
import { Document } from 'openapi-client-axios/types/client';

interface IEvents {
    loginSuccess: (token: Components.Schemas.Token) => void;
    logout: () => void;
    accessDenied: () => void;
    loadServerInfo: (
        serverInfo: InternalStatus<Components.Schemas.ServerInformation, GenericErrors>
    ) => void;
    initialized: () => void;
}

export type LoginErrors =
    | GenericErrors
    | ErrorCode.LOGIN_DISABLED
    | ErrorCode.LOGIN_FAIL
    | ErrorCode.LOGIN_NOCREDS;
export type ServerInfoErrors = GenericErrors;

class ServerClient extends TypedEmitter<IEvents> {
    private static readonly globalHandledCodes = [400, 401, 403, 409, 500, 501, 503];

    //api
    // @ts-ignore  //this will be undefined at the start but there shouldnt be any requests before the api is initialized, same as below
    private api: OpenAPIClientAxios; //api object, handles sending requests and configuring things
    // @ts-ignore
    public apiClient: Client; //client to interface with the api
    private initialized = false;

    //token
    private _token?: Components.Schemas.Token;
    public get token() {
        return this._token;
    }
    private refreshTokenTimer?: number;

    //credentials
    private credentials?: ICredentials;

    //serverInfo
    private _serverInfo?: InternalStatus<Components.Schemas.ServerInformation, ErrorCode.OK>;
    public get serverInfo() {
        return this._serverInfo;
    }
    private loadingServerInfo = false;

    public constructor() {
        super();
        // noinspection JSIgnoredPromiseFromCall
        this.initApi();
    }

    public async initApi() {
        console.log('Initializing API client');
        const defObj = (await import('./swagger.json')).default as Document;
        this.api = new OpenAPIClientAxios({
            definition: defObj,
            validate: false,
            axiosConfigDefaults: {
                baseURL: APIPATH,
                withCredentials: false,
                headers: {
                    Accept: 'application/json',
                    api: `Tgstation.Server.Api/` + API_VERSION,
                    'User-Agent': 'tgstation-server-control-panel/' + VERSION
                },
                validateStatus: status => {
                    return !ServerClient.globalHandledCodes.includes(status);
                }
            }
        });
        this.apiClient = await this.api.init<Client>();
        this.apiClient.interceptors.request.use(
            async value => {
                if (!((value.url === '/' || value.url === '') && value.method === 'post')) {
                    const tok = await this.wait4Token();
                    value.headers['Authorization'] = 'Bearer ' + tok.bearer;
                }
                return value;
            },
            error => {
                return Promise.reject(error);
            }
        );
        this.apiClient.interceptors.response.use(
            val => val,
            (error: AxiosError): Promise<AxiosResponse> => {
                if (
                    error.response &&
                    error.response.status &&
                    ServerClient.globalHandledCodes.includes(error.response.status)
                ) {
                    const res = error.response as AxiosResponse<unknown>;
                    switch (error.response.status) {
                        case 400: {
                            const errorMessage = res.data as Components.Schemas.ErrorMessage;
                            const errorobj = new InternalError(
                                ErrorCode.HTTP_BAD_REQUEST,
                                {
                                    errorMessage
                                },
                                res
                            );
                            return Promise.reject(errorobj);
                        }
                        case 401: {
                            const request = error.config;
                            if (
                                (request.url === '/' || request.url === '') &&
                                request.method === 'post'
                            ) {
                                this.logout();
                                const errorMessage = res.data as Components.Schemas.ErrorMessage;
                                const errorobj = new InternalError(
                                    ErrorCode.LOGIN_FAIL,
                                    {
                                        void: true
                                    },
                                    res
                                );
                                return Promise.reject(errorobj);
                            } else {
                                this._token = undefined; //our token is invalid, might as well clear it
                                if (!this.credentials) {
                                    this.logout();
                                }
                                return this.login().then(_ => {
                                    return this.api.client.request(error.config);
                                });
                            }
                        }
                        case 403: {
                            const request = error.config;
                            if (
                                (request.url === '/' || request.url === '') &&
                                request.method === 'post'
                            ) {
                                this.logout();
                                const errorMessage = error.response
                                    .data as Components.Schemas.ErrorMessage;
                                const errorobj = new InternalError(
                                    ErrorCode.LOGIN_DISABLED,
                                    {
                                        void: true
                                    },
                                    res
                                );
                                return Promise.reject(errorobj);
                            } else {
                                this.emit('accessDenied');
                                const errorobj = new InternalError(
                                    ErrorCode.HTTP_ACCESS_DENIED,
                                    {
                                        void: true
                                    },
                                    res
                                );
                                return Promise.reject(errorobj);
                            }
                        }
                        case 409: {
                            const errorMessage = res.data as Components.Schemas.ErrorMessage;
                            const errorobj = new InternalError(
                                ErrorCode.HTTP_DATA_INEGRITY,
                                {
                                    errorMessage
                                },
                                res
                            );
                            return Promise.reject(errorobj);
                        }
                        case 500: {
                            const errorMessage = res.data as Components.Schemas.ErrorMessage;
                            const errorobj = new InternalError(
                                ErrorCode.HTTP_SERVER_ERROR,
                                {
                                    errorMessage
                                },
                                res
                            );
                            return Promise.reject(errorobj);
                        }
                        case 501: {
                            const errorMessage = res.data as Components.Schemas.ErrorMessage;
                            const errorobj = new InternalError(
                                ErrorCode.HTTP_UNIMPLEMENTED,
                                { errorMessage },
                                res
                            );
                            return Promise.reject(errorobj);
                        }
                        case 503: {
                            const errorobj = new InternalError(
                                ErrorCode.HTTP_SERVER_NOT_READY,
                                {
                                    void: true
                                },
                                res
                            );
                            return Promise.reject(errorobj);
                        }
                        default: {
                            const errorobj = new InternalError(
                                ErrorCode.UNHANDLED_GLOBAL_RESPONSE,
                                {
                                    axiosResponse: res
                                },
                                res
                            );
                            return Promise.reject(errorobj);
                        }
                    }
                } else {
                    const err = error as Error;
                    const errorobj = new InternalError(
                        ErrorCode.AXIOS,
                        { jsError: err },
                        error.response
                    );
                    return Promise.reject(errorobj);
                }
            }
        );
        this.initialized = true;
        this.emit('initialized');
    }

    public wait4Init(): Promise<void> {
        return new Promise<void>(resolve => {
            if (this.initialized) {
                resolve();
                return;
            }
            this.on('initialized', () => resolve());
        });
    }

    public wait4Token() {
        return new Promise<Components.Schemas.Token>(resolve => {
            if (this.isTokenValid()) {
                resolve(this.token);
                return;
            }
            this.on('loginSuccess', token => {
                resolve(token);
            });
        });
    }

    public isTokenValid() {
        return (
            this.credentials &&
            this.token &&
            this.token
                .bearer /* &&
            (!this.token.expiresAt || new Date(this.token.expiresAt) > new Date(Date.now()))*/
        );
    }

    public async login(
        newCreds?: ICredentials
    ): Promise<InternalStatus<Components.Schemas.Token, LoginErrors>> {
        await this.wait4Init();
        if (newCreds) {
            this.logout();
            this.credentials = newCreds;
        }
        if (!this.credentials)
            return new InternalStatus<Components.Schemas.Token, ErrorCode.LOGIN_NOCREDS>({
                code: StatusCode.ERROR,
                error: new InternalError(ErrorCode.LOGIN_NOCREDS, { void: true })
            });

        let response;
        try {
            response = await this.apiClient.HomeController_CreateToken({}, null, {
                auth: {
                    username: this.credentials.userName,
                    password: this.credentials.password
                }
            });
        } catch (stat) {
            return new InternalStatus<Components.Schemas.Token, GenericErrors>({
                code: StatusCode.ERROR,
                error: stat as InternalError<GenericErrors>
            });
        }

        switch (response.status) {
            case 200: {
                const token = response.data as Components.Schemas.Token;
                this._token = token;
                /*if (token.expiresAt) {
                    const expiry = new Date(token.expiresAt);
                    const refreshtime = new Date(expiry.getTime() - 60000); //1 minute before expiry
                    const delta = refreshtime.getTime() - new Date().getTime(); //god damn, dates are hot garbage, get the ms until the refresh time
                    setInterval(() => this.login(), delta); //this is an arrow function so that "this" remains set
                }*/
                try {
                    window.sessionStorage.setItem('username', this.credentials.userName);
                    window.sessionStorage.setItem('password', this.credentials.password);
                } catch (_) {
                    (() => {})(); //noop
                }
                this.getServerInfo().then(() => {
                    this.emit('loginSuccess', token);
                });
                return new InternalStatus<Components.Schemas.Token, ErrorCode.OK>({
                    code: StatusCode.OK,
                    payload: token
                });
            }
            default: {
                return new InternalStatus<Components.Schemas.Token, ErrorCode.UNHANDLED_RESPONSE>({
                    code: StatusCode.ERROR,
                    error: new InternalError(
                        ErrorCode.UNHANDLED_RESPONSE,
                        { axiosResponse: response },
                        response
                    )
                });
            }
        }
    }

    public logout() {
        if (!this.isTokenValid()) {
            return;
        }
        this.credentials = undefined;
        try {
            window.sessionStorage.removeItem('username');
            window.sessionStorage.removeItem('password');
        } catch (e) {
            (() => {})();
        }
        this._token = undefined;
        if (this.refreshTokenTimer) clearTimeout(this.refreshTokenTimer);
        this.emit('logout');
    }

    public async getServerInfo(): Promise<
        InternalStatus<Components.Schemas.ServerInformation, ServerInfoErrors>
    > {
        if (this._serverInfo) {
            return this._serverInfo;
        }

        if (this.loadingServerInfo) {
            return new Promise(resolve => {
                if (this._serverInfo) {
                    //race condition if 2 things listen to an event or something
                    resolve(this._serverInfo);
                    return;
                }
                this.on('loadServerInfo', info => {
                    resolve(info);
                });
            });
        }

        this.loadingServerInfo = true;

        let response;
        try {
            response = await this.apiClient.HomeController_Home();
        } catch (stat) {
            const res = new InternalStatus<Components.Schemas.ServerInformation, GenericErrors>({
                code: StatusCode.ERROR,
                error: stat as InternalError<GenericErrors>
            });
            this.emit('loadServerInfo', res);
            this.loadingServerInfo = false;
            return res;
        }
        switch (response.status) {
            case 200: {
                const info = response.data as Components.Schemas.ServerInformation;
                const cache = new InternalStatus<
                    Components.Schemas.ServerInformation,
                    ErrorCode.OK
                >({
                    code: StatusCode.OK,
                    payload: info
                });
                this.emit('loadServerInfo', cache);
                this._serverInfo = cache;
                this.loadingServerInfo = false;
                return cache;
            }
            default: {
                const res = new InternalStatus<
                    Components.Schemas.ServerInformation,
                    ErrorCode.UNHANDLED_RESPONSE
                >({
                    code: StatusCode.ERROR,
                    error: new InternalError(
                        ErrorCode.UNHANDLED_RESPONSE,
                        { axiosResponse: response },
                        response
                    )
                });
                this.emit('loadServerInfo', res);
                this.loadingServerInfo = false;
                return res;
            }
        }
    }
}

export default new ServerClient();
