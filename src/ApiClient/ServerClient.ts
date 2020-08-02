import { AxiosError, AxiosResponse, OpenAPIClientAxios } from "openapi-client-axios";
import { Document } from "openapi-client-axios/types/client";
import { TypedEmitter } from "tiny-typed-emitter/lib";

import { Client, Components } from "./generatedcode/_generated";
import { ICredentials } from "./models/ICredentials";
import InternalError, { ErrorCode, GenericErrors } from "./models/InternalComms/InternalError";
import InternalStatus, { StatusCode } from "./models/InternalComms/InternalStatus";
import LoginHooks from "./util/LoginHooks";
import CredentialsProvider from "./util/CredentialsProvider";
import configOptions from "../utils/config";

interface IEvents {
    //tasks once the user is fully logged in
    loginSuccess: (token: Components.Schemas.Token) => void;
    //self explainatory
    logout: () => void;
    //fired whenever something is denied access, shouldnt really be used
    accessDenied: () => void;
    //fired when the server info is first loaded
    loadServerInfo: (
        serverInfo: InternalStatus<Components.Schemas.ServerInformation, GenericErrors>
    ) => void;
    //fired when the api is loaded from the json file and loaded
    initialized: () => void;
    //purge all caches
    purgeCache: () => void;
    //internal event, queues logins
    loadLoginInfo: (loginInfo: InternalStatus<Components.Schemas.Token, LoginErrors>) => void;
}

export type LoginErrors =
    | GenericErrors
    | ErrorCode.LOGIN_DISABLED
    | ErrorCode.LOGIN_FAIL
    | ErrorCode.LOGIN_NOCREDS;
export type ServerInfoErrors = GenericErrors;

export default new (class ServerClient extends TypedEmitter<IEvents> {
    private static readonly globalHandledCodes = [400, 401, 403, 406, 409, 426, 500, 501, 503];

    //api
    public apiClient?: Client; //client to interface with the api
    private api?: OpenAPIClientAxios; //api object, handles sending requests and configuring things
    private initialized = false;
    private loadingServerInfo = false;

    public constructor() {
        super();
        this.getServerInfo = this.getServerInfo.bind(this);

        LoginHooks.addHook(this.getServerInfo);
        this.on("purgeCache", () => {
            this._serverInfo = undefined;
        });
    }

    //serverInfo
    private _serverInfo?: InternalStatus<Components.Schemas.ServerInformation, ErrorCode.OK>;

    public get serverInfo() {
        return this._serverInfo;
    }

    public autoLogin = true;
    private loggingIn = false;

    public async initApi() {
        console.log("Initializing API client");
        console.time("APIInit");
        const defObj = (await import("./generatedcode/swagger.json")).default as Document;
        this.api = new OpenAPIClientAxios({
            definition: defObj,
            validate: false,
            axiosConfigDefaults: {
                baseURL: APIPATH,
                withCredentials: false,
                headers: {
                    Accept: "application/json",
                    api: `Tgstation.Server.Api/` + API_VERSION,
                    "User-Agent": "tgstation-server-control-panel/" + VERSION
                },
                validateStatus: status => {
                    return !ServerClient.globalHandledCodes.includes(status);
                }
            }
        });
        this.apiClient = await this.api.init<Client>();
        this.apiClient.interceptors.request.use(
            async value => {
                if (!((value.url === "/" || value.url === "") && value.method === "post")) {
                    const tok = await this.wait4Token();
                    (value.headers as { [key: string]: string })["Authorization"] =
                        "Bearer " + tok.bearer!;
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
                                (request.url === "/" || request.url === "") &&
                                request.method === "post"
                            ) {
                                this.logout();
                                console.log("Failed to login");
                                const errorobj = new InternalError(
                                    ErrorCode.LOGIN_FAIL,
                                    {
                                        void: true
                                    },
                                    res
                                );
                                return Promise.reject(errorobj);
                            } else {
                                if (this.autoLogin) {
                                    return this.login().then(status => {
                                        switch (status.code) {
                                            case StatusCode.OK: {
                                                return this.api!.client.request(error.config);
                                            }
                                            case StatusCode.ERROR: {
                                                this.emit("accessDenied");
                                                //time to kick out the user
                                                this.logout();
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
                                    });
                                } else {
                                    this.emit("accessDenied");
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
                        }
                        case 403: {
                            const request = error.config;
                            if (
                                (request.url === "/" || request.url === "") &&
                                request.method === "post"
                            ) {
                                this.logout();
                                console.log("Account disabled");
                                const errorobj = new InternalError(
                                    ErrorCode.LOGIN_DISABLED,
                                    {
                                        void: true
                                    },
                                    res
                                );
                                return Promise.reject(errorobj);
                            } else {
                                this.emit("accessDenied");
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
                        case 406: {
                            const errorobj = new InternalError(
                                ErrorCode.HTTP_NOT_ACCEPTABLE,
                                {
                                    void: true
                                },
                                res
                            );
                            return Promise.reject(errorobj);
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
                        case 426: {
                            const errorMessage = res.data as Components.Schemas.ErrorMessage;
                            const errorobj = new InternalError(
                                ErrorCode.HTTP_API_MISMATCH,
                                { errorMessage },
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
                            console.log("Server not ready, delaying request", error.config);
                            return new Promise(resolve => {
                                setTimeout(resolve, 5000);
                            }).then(() => this.api!.client.request(error.config));
                            /*const errorobj = new InternalError(
                                ErrorCode.HTTP_SERVER_NOT_READY,
                                {
                                    void: true
                                },
                                res
                            );
                            return Promise.reject(errorobj);*/
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
        console.timeEnd("APIInit");
        this.initialized = true;
        this.emit("initialized");
    }

    public wait4Init(): Promise<void> {
        return new Promise<void>(resolve => {
            if (this.initialized) {
                resolve();
                return;
            }
            this.on("initialized", () => resolve());
        });
    }

    public wait4Token() {
        return new Promise<Components.Schemas.Token>(resolve => {
            if (CredentialsProvider.isTokenValid()) {
                resolve(CredentialsProvider.token);
                return;
            }
            this.on("loginSuccess", token => {
                resolve(token);
            });
        });
    }

    public async login(
        newCreds?: ICredentials,
        savePassword = false
    ): Promise<InternalStatus<Components.Schemas.Token, LoginErrors>> {
        await this.wait4Init();
        console.log("Attempting login");
        if (newCreds) {
            this.logout();
            CredentialsProvider.credentials = newCreds;
        }
        if (!CredentialsProvider.credentials)
            return new InternalStatus<Components.Schemas.Token, ErrorCode.LOGIN_NOCREDS>({
                code: StatusCode.ERROR,
                error: new InternalError(ErrorCode.LOGIN_NOCREDS, { void: true })
            });

        if (this.loggingIn) {
            return await new Promise(resolve => {
                this.on("loadLoginInfo", loginInfo => resolve(loginInfo));
            });
        }
        this.loggingIn = true;

        let response;
        try {
            response = await this.apiClient!.HomeController_CreateToken(null, null, {
                auth: {
                    username: CredentialsProvider.credentials.userName,
                    password: CredentialsProvider.credentials.password
                }
            });
        } catch (stat) {
            return new InternalStatus<Components.Schemas.Token, GenericErrors>({
                code: StatusCode.ERROR,
                error: stat as InternalError<GenericErrors>
            });
        } finally {
            this.loggingIn = false;
        }

        switch (response.status) {
            case 200: {
                console.log("Login success");
                const token = response.data as Components.Schemas.Token;
                CredentialsProvider.token = token;

                /*if (token.expiresAt) {
                    const expiry = new Date(token.expiresAt);
                    const refreshtime = new Date(expiry.getTime() - 60000); //1 minute before expiry
                    const delta = refreshtime.getTime() - new Date().getTime(); //god damn, dates are hot garbage, get the ms until the refresh time
                    setInterval(() => this.login(), delta); //this is an arrow function so that "this" remains set
                }*/
                if (savePassword) {
                    try {
                        if (configOptions.localstoragecreds.value) {
                            window.localStorage.setItem(
                                "username",
                                CredentialsProvider.credentials.userName
                            );
                            window.localStorage.setItem(
                                "password",
                                CredentialsProvider.credentials.password
                            );
                        }
                        //we save it in both places just in case
                        window.sessionStorage.setItem(
                            "username",
                            CredentialsProvider.credentials.userName
                        );
                        window.sessionStorage.setItem(
                            "password",
                            CredentialsProvider.credentials.password
                        );
                    } catch (_) {
                        // eslint-disable-next-line @typescript-eslint/no-empty-function
                        (() => {})(); //noop
                    }
                }
                await this.getServerInfo();
                await LoginHooks.runHooks(token);
                console.log("Running post login event");
                this.emit("loginSuccess", token);
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
        if (!CredentialsProvider.isTokenValid()) {
            return;
        }
        console.log("Logging out");
        CredentialsProvider.credentials = undefined;
        try {
            window.localStorage.removeItem("username");
            window.localStorage.removeItem("password");
            window.sessionStorage.removeItem("username");
            window.sessionStorage.removeItem("password");
        } catch (e) {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            (() => {})();
        }
        CredentialsProvider.token = undefined;
        this.emit("purgeCache");
        this.emit("logout");
    }

    public async getServerInfo(
        _token?: Components.Schemas.Token,
        bypassCache = false
    ): Promise<InternalStatus<Components.Schemas.ServerInformation, ServerInfoErrors>> {
        await this.wait4Init();

        if (this._serverInfo && !bypassCache) {
            return this._serverInfo;
        }

        if (this.loadingServerInfo) {
            return new Promise(resolve => {
                if (this._serverInfo) {
                    //race condition if 2 things listen to an event or something
                    resolve(this._serverInfo);
                    return;
                }
                this.on("loadServerInfo", info => {
                    resolve(info);
                });
            });
        }

        this.loadingServerInfo = true;

        let response;
        try {
            response = await this.apiClient!.HomeController_Home();
        } catch (stat) {
            const res = new InternalStatus<Components.Schemas.ServerInformation, GenericErrors>({
                code: StatusCode.ERROR,
                error: stat as InternalError<GenericErrors>
            });
            this.emit("loadServerInfo", res);
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
                this.emit("loadServerInfo", cache);
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
                this.emit("loadServerInfo", res);
                this.loadingServerInfo = false;
                return res;
            }
        }
    }
})();
