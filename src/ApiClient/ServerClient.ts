import { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";

import { API_VERSION, VERSION } from "../definitions/constants";
import { ApiClient } from "./_base";
import {
    Api,
    ErrorMessageResponse,
    HttpClient,
    ServerInformationResponse,
    TokenResponse
} from "./generatedcode/generated";
import { ICredentials } from "./models/ICredentials";
import InternalError, { ErrorCode, GenericErrors } from "./models/InternalComms/InternalError";
import InternalStatus, { StatusCode } from "./models/InternalComms/InternalStatus";
import AuthController, { LoginErrors } from "./util/AuthController";
import configOptions from "./util/config";
import LoginHooks from "./util/LoginHooks";

interface IEvents {
    //self explainatory
    logout: () => void;
    //fired whenever something is denied access, shouldnt really be used
    accessDenied: () => void;
    //fired when the server info is first loaded
    loadServerInfo: (
        serverInfo: InternalStatus<ServerInformationResponse, ServerInfoErrors>
    ) => void;
    //fired when the api is loaded from the json file and loaded
    initialized: () => void;
    //purge all caches
    purgeCache: () => void;
    //internal event, queues logins
    loadLoginInfo: (loginInfo: InternalStatus<undefined, LoginErrors>) => void;
    //internal event fired for wait4Token(), external things should be using LoginHooks#LoginSuccess or a login hook
    tokenAvailable: (token: TokenResponse) => void;
}

export type ServerInfoErrors = GenericErrors;

export default new (class ServerClient extends ApiClient<IEvents> {
    private static readonly globalHandledCodes = [400, 401, 403, 406, 409, 426, 500, 501, 503];

    //api

    public apiHttpClient?: HttpClient<unknown>;
    public apiClient?: Api<unknown>;

    public apiRequestInterceptor = {
        onFulfilled: async (value: AxiosRequestConfig) => {
            //Meta value that means theres no value, used in the github deployed version
            if (configOptions.apipath.value === "https://example.org:5000") {
                const errorobj = new InternalError(ErrorCode.NO_APIPATH, {
                    void: true
                });
                return Promise.reject(errorobj);
            }
            return value;
        },
        // it is real, we do not know what type though
        onRejected: (error: unknown) => {
            return Promise.reject(error);
        }
    };

    public apiResponseInterceptor = {
        onFulfilled: (val: AxiosResponse) => val,
        // it is real, we do not know what type though
        onRejected: async (error: AxiosError, axiosServer: HttpClient): Promise<AxiosResponse> => {
            //THIS IS SNOWFLAKE KEKW
            //As the above comment mentions, this shitcode is very snowflake
            // it tries to typecast the "response" we got into an error then tries to check if that "error" is
            // the snowflake no apipath github error, if it is, it rejects the promise to send it to the catch block
            // all endpoints have which simply returns the error wrapped in a status object
            const snowflake = (error as unknown) as InternalError<ErrorCode.NO_APIPATH>;
            if (snowflake?.code === ErrorCode.NO_APIPATH) {
                return Promise.reject(snowflake);
            }

            //This was originally an else clause at the bottom but it made it hard to find
            // if the promise rejected and its not because its a globally handled status code
            // it means that axios created an error itself for an unknown reason(network failure,
            // cors failure, user is navigating away, aborting requests, etc). Simply return the error
            // as a globally handled error.
            if (
                !(
                    error.response &&
                    error.response.status &&
                    ServerClient.globalHandledCodes.includes(error.response.status)
                )
            ) {
                const err = error as Error;
                const errorobj = new InternalError(
                    ErrorCode.AXIOS,
                    { jsError: err },
                    error.response
                );
                return Promise.reject(errorobj);
            }

            //I am sorry, this is the bulk of the shitcode, its a massive switch that handles every single
            // globally handled status code and sometimes not so globally because one endpoint decided it would be
            const res = error.response as AxiosResponse<unknown>;
            switch (error.response.status) {
                //Error code 400: Bad request, show message to user and instruct them to report it as its probably a bug
                case 400: {
                    const errorMessage = res.data as ErrorMessageResponse;
                    const errorobj = new InternalError(
                        ErrorCode.HTTP_BAD_REQUEST,
                        { errorMessage },
                        res
                    );
                    return Promise.reject(errorobj);
                }
                //Error code 401: Access Denied, fired whenever a token expires, in that case, attempt to reauthenticate
                // using the last known working credentials, if that succeeds, reissue the request, otherwise logout the
                // user and kick them to the login page. Snowflake behaviour: Acts as a failed login for the login endpoint
                case 401: {
                    const request = error.config;
                    if ((request.url === "/" || request.url === "") && request.method === "post") {
                        return Promise.resolve(error.response);
                    }

                    if (this.autoLogin) {
                        const status = await this.login();
                        switch (status.code) {
                            case StatusCode.OK: {
                                return axiosServer.request({
                                    secure: true,
                                    path: request.url!,
                                    ...request
                                });
                            }
                            case StatusCode.ERROR: {
                                this.emit("accessDenied");
                                //time to kick out the user
                                this.logout();
                                const errorobj = new InternalError(
                                    ErrorCode.HTTP_ACCESS_DENIED,
                                    { void: true },
                                    res
                                );
                                return Promise.reject(errorobj);
                            }
                        }
                    }
                    this.emit("accessDenied");
                    const errorobj = new InternalError(
                        ErrorCode.HTTP_ACCESS_DENIED,
                        { void: true },
                        res
                    );
                    return Promise.reject(errorobj);
                }
                case 403: {
                    const request = error.config;
                    if ((request.url === "/" || request.url === "") && request.method === "post") {
                        return Promise.resolve(error.response);
                    }
                    this.emit("accessDenied");
                    const errorobj = new InternalError(
                        ErrorCode.HTTP_ACCESS_DENIED,
                        { void: true },
                        res
                    );
                    return Promise.reject(errorobj);
                }
                case 406: {
                    const errorobj = new InternalError(
                        ErrorCode.HTTP_NOT_ACCEPTABLE,
                        { void: true },
                        res
                    );
                    return Promise.reject(errorobj);
                }
                case 409: {
                    const errorMessage = res.data as ErrorMessageResponse;

                    //Thanks for reusing a global erorr status cyber. Log operations can return 409
                    const request = error.config;
                    if (request.url === "/Administration/Logs" && request.method === "get") {
                        return Promise.resolve(error.response);
                    }

                    const errorobj = new InternalError(
                        ErrorCode.HTTP_DATA_INEGRITY,
                        { errorMessage },
                        res
                    );
                    return Promise.reject(errorobj);
                }
                case 426: {
                    const errorMessage = res.data as ErrorMessageResponse;
                    const errorobj = new InternalError(
                        ErrorCode.HTTP_API_MISMATCH,
                        { errorMessage },
                        res
                    );
                    return Promise.reject(errorobj);
                }
                case 500: {
                    const errorMessage = res.data as ErrorMessageResponse;
                    const errorobj = new InternalError(
                        ErrorCode.HTTP_SERVER_ERROR,
                        { errorMessage },
                        res
                    );
                    return Promise.reject(errorobj);
                }
                case 501: {
                    const errorMessage = res.data as ErrorMessageResponse;
                    const errorobj = new InternalError(
                        ErrorCode.HTTP_UNIMPLEMENTED,
                        { errorMessage },
                        res
                    );
                    return Promise.reject(errorobj);
                }
                case 503: {
                    console.log("Server not ready, delaying request", error.config);
                    await new Promise(resolve => {
                        setTimeout(resolve, 5000);
                    });
                    return await axiosServer.request({
                        secure: true,
                        path: error.config.url!,
                        ...error.config
                    });
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
                        { axiosResponse: res },
                        res
                    );
                    return Promise.reject(errorobj);
                }
            }
        }
    };

    private initialized = false;
    private loadingServerInfo = false;

    public constructor() {
        super();
        this.getServerInfo = this.getServerInfo.bind(this);

        LoginHooks.addHook(this.getServerInfo);
        this.on("purgeCache", () => {
            this._serverInfo = undefined;
            const token = AuthController.getTokenUnsafe();
            if (token) {
                LoginHooks.runHooks(token);
            }
        });

        //Why is this here? Because otherwise it creates an import loop, grrrrr
        configOptions.apipath.callback = (): void => {
            console.log("API path changed");
            window.location.reload();
        };
    }

    //serverInfo
    private _serverInfo?: InternalStatus<ServerInformationResponse, ErrorCode.OK>;

    public get serverInfo() {
        return this._serverInfo;
    }

    public autoLogin = true;
    private loggingIn = false;

    public initApi() {
        console.log("Initializing API client");
        console.time("APIInit");

        this.apiHttpClient = new HttpClient({
            //Yes this is only initialized once even if the configOption changes, this doesn't
            baseURL: configOptions.apipath.value as string,
            withCredentials: false,
            headers: {
                Accept: "application/json",
                Api: `Tgstation.Server.Api/` + API_VERSION,
                "Webpanel-Version": VERSION
            },
            securityWorker: async () => {
                const tok = await this.wait4Token();
                if (!tok) {
                    return; // undefined is valid. Also it means that we logged out
                }
                return {
                    headers: {
                        Authorization: `Bearer ${tok.bearer}`
                    }
                };
            },
            //Global errors are handled via the catch clause and endpoint specific response codes are handled normally
            validateStatus: status => {
                return !ServerClient.globalHandledCodes.includes(status);
            }
        });
        this.apiHttpClient.instance.interceptors.request.use(
            this.apiRequestInterceptor.onFulfilled,
            this.apiRequestInterceptor.onRejected
        );
        this.apiHttpClient.instance.interceptors.response.use(
            this.apiResponseInterceptor.onFulfilled,
            error => this.apiResponseInterceptor.onRejected(error, this.apiHttpClient!)
        );

        this.apiClient = new Api(this.apiHttpClient);

        console.timeEnd("APIInit");
        this.initialized = true;
        this.emit("initialized");
    }

    //Utility function that returns a promise which resolves whenever ServerClient#ApiClient becomes valid
    public wait4Init(): Promise<void> {
        return new Promise<void>(resolve => {
            if (this.initialized) {
                resolve();
                return;
            }
            this.on("initialized", () => resolve());
        });
    }

    //Utility function that returns a promise which resolves with the token whenever theres valid credentials(could be immediatly)
    public wait4Token() {
        return AuthController.getToken();
    }

    /**
     * Login handler. Will NOT return the token, you must get the token by yourself.
     */
    public async login(newCreds?: ICredentials): Promise<InternalStatus<undefined, LoginErrors>> {
        console.log("Attempting login");
        const r = newCreds
            ? await AuthController.authenticate(newCreds)
            : await AuthController.authenticateCached();

        if (r.code === StatusCode.OK) {
            const token = AuthController.getTokenUnsafe()!;
            // i dont like events :(
            this.emit("tokenAvailable", token);
            LoginHooks.runHooks(token);
        }
        return r;
    }

    public logout() {
        AuthController.logout();
        console.log("Logging out");
        //events to clear the app state as much as possible for the next user
        this.emit("purgeCache");
        this.emit("logout");
    }

    public async getServerInfo(
        _token?: TokenResponse,
        bypassCache = false
    ): Promise<InternalStatus<ServerInformationResponse, ServerInfoErrors>> {
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
                const resolver = (
                    info: InternalStatus<ServerInformationResponse, GenericErrors>
                ) => {
                    resolve(info);
                    this.removeListener("loadServerInfo", resolver);
                };
                this.on("loadServerInfo", resolver);
            });
        }

        this.loadingServerInfo = true;

        let response;
        try {
            response = await this.apiClient!.homeControllerHome();
        } catch (stat) {
            const res = new InternalStatus<ServerInformationResponse, GenericErrors>({
                code: StatusCode.ERROR,
                error: stat as InternalError<GenericErrors>
            });
            this.emit("loadServerInfo", res);
            this.loadingServerInfo = false;
            return res;
        }
        switch (response.status) {
            case 200: {
                const info = response.data as ServerInformationResponse;
                const cache = new InternalStatus<ServerInformationResponse, ErrorCode.OK>({
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
                    ServerInformationResponse,
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

//https://stackoverflow.com/questions/40510611/typescript-interface-require-one-of-two-properties-to-exist
//name describes what it does, makes the passed type only require 1 property, the others being optional
export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
    {
        [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
    }[Keys];
