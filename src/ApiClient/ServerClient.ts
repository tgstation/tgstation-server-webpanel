import { AxiosError, AxiosResponse, OpenAPIClientAxios } from "openapi-client-axios";
import { Document } from "openapi-client-axios/types/client";
import { TypedEmitter } from "tiny-typed-emitter/lib";

import { API_VERSION, VERSION } from "../definitions/constants";
import { Client, Components } from "./generatedcode/_generated";
import { ICredentials } from "./models/ICredentials";
import InternalError, { ErrorCode, GenericErrors } from "./models/InternalComms/InternalError";
import InternalStatus, { StatusCode } from "./models/InternalComms/InternalStatus";
import configOptions from "./util/config";
import CredentialsProvider from "./util/CredentialsProvider";
import LoginHooks from "./util/LoginHooks";
import ErrorMessage = Components.Schemas.ErrorMessage;

interface IEvents {
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
    //internal event fired for wait4Token(), external things should be using LoginHooks#LoginSuccess or a login hook
    tokenAvailable: (token: Components.Schemas.Token) => void;
}

export type LoginErrors =
    | GenericErrors
    | ErrorCode.LOGIN_DISABLED
    | ErrorCode.LOGIN_FAIL
    | ErrorCode.LOGIN_NOCREDS
    | ErrorCode.LOGIN_RATELIMIT;

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
            if (CredentialsProvider.token) {
                void LoginHooks.runHooks(CredentialsProvider.token);
            }
        });

        //Why is this here? Because otherwise it creates an import loop, grrrrr
        configOptions.apipath.callback = (): void => {
            console.log("Reinitializing API");
            this.initApi()
                .then(() => {
                    console.log("API Reinitialized");
                })
                .catch(() => {
                    //The API failing to initialize is a big nono, start all over again.
                    window.location.reload();
                });
        };
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
        //Object is forced typecasted to Document because i really cant be assed to figure out why it doesn't accept the json
        //The json is loaded with import to force webpack to bundle it alone
        const defObj = ((await import("./generatedcode/swagger.json"))
            .default as unknown) as Document;

        this.api = new OpenAPIClientAxios({
            definition: defObj,
            validate: false,
            //Defaults for all requests sent by the apiClient, you may notice a lack of authorization headers,
            // those are applied in the request interceptor
            axiosConfigDefaults: {
                //Yes this is only initialized once even if the configOption changes, this doesn't
                baseURL: configOptions.apipath.value as string,
                withCredentials: false,
                headers: {
                    Accept: "application/json",
                    Api: `Tgstation.Server.Api/` + API_VERSION,
                    "User-Agent": "tgstation-server-control-panel/" + VERSION
                },
                //Global errors are handled via the catch clause and endpoint specific response codes are handled normally
                validateStatus: status => {
                    return !ServerClient.globalHandledCodes.includes(status);
                }
            }
        });
        this.apiClient = await this.api.init<Client>();

        //Oh lord here be shitcode, welcome to the land of interceptors, they as their name say
        // intercept requests and changes them. It also intercepts responses and changes them
        this.apiClient.interceptors.request.use(
            async value => {
                //Meta value that means theres no value, used in the github deployed version
                if (configOptions.apipath.value === "https://example.org:5000") {
                    const errorobj = new InternalError(ErrorCode.NO_APIPATH, {
                        void: true
                    });
                    return Promise.reject(errorobj);
                }

                //This applies the authorization header, it will wait however long it needs until
                // theres a token available. It obviously won't wait for a token before sending the request
                // if its currently sending a request to the login endpoint...
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

        //I am sorry for what you will see before you, this is the response interceptor, it normalizes
        // all the weird shit in the TGS api to make it *somewhat* easier to consume in the rest of the app
        // onFulfilled here is a noop that returns its arguments because we only care to intercept errors
        this.apiClient.interceptors.response.use(
            val => val,
            (error: AxiosError): Promise<AxiosResponse> => {
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
                    //Error code 401: Access Denied, fired whenever a token expires, in that case, attempt to reauthenticate
                    // using the last known working credentials, if that succeeds, reissue the request, otherwise logout the
                    // user and kick them to the login page. Snowflake behaviour: Acts as a failed login for the login endpoint
                    case 401: {
                        const request = error.config;
                        if (
                            (request.url === "/" || request.url === "") &&
                            request.method === "post"
                        ) {
                            return Promise.resolve(error.response);
                        }

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
                    case 403: {
                        const request = error.config;
                        if (
                            (request.url === "/" || request.url === "") &&
                            request.method === "post"
                        ) {
                            return Promise.resolve(error.response);
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

                        //Thanks for reusing a global erorr status cyber. Log operations can return 409
                        const request = error.config;
                        if (request.url === "/Administration/Logs" && request.method === "get") {
                            return Promise.resolve(error.response);
                        }

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
            }
        );
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
        return new Promise<Components.Schemas.Token>(resolve => {
            if (CredentialsProvider.isTokenValid()) {
                resolve(CredentialsProvider.token);
                return;
            }
            this.on("tokenAvailable", token => {
                resolve(token);
            });
        });
    }

    public async login(
        newCreds?: ICredentials
    ): Promise<InternalStatus<Components.Schemas.Token, LoginErrors>> {
        //Shouldn't really happen edge cases
        await this.wait4Init();

        console.log("Attempting login");

        //Newcreds is optional, if its missing its going to try to reuse the last used credentials,
        // if newCreds exists, its going to use newCreds
        if (newCreds) {
            CredentialsProvider.credentials = newCreds;
        }

        //This is thrown if you try to reuse the last credentials without actually having last used credentials
        if (!CredentialsProvider.credentials)
            return new InternalStatus<Components.Schemas.Token, ErrorCode.LOGIN_NOCREDS>({
                code: StatusCode.ERROR,
                error: new InternalError(ErrorCode.LOGIN_NOCREDS, { void: true })
            });

        //This block is here to prevent duplication of login requests at the same time, when you start logging in,
        // it sets loggingIn to true and fires an event once its done logging in, successful or not, if you try to login
        // while another login request is ongoing, it listens to that event and returns the output normally.
        //
        // Basically, make two calls, receive two identical return values, make only one request
        if (this.loggingIn) {
            return await new Promise(resolve => {
                const resolver = (info: InternalStatus<Components.Schemas.Token, LoginErrors>) => {
                    resolve(info);
                    this.removeListener("loadLoginInfo", resolver);
                };
                this.on("loadLoginInfo", resolver);
            });
        }
        this.loggingIn = true;

        let response;
        try {
            response = await this.apiClient!.HomeController_CreateToken(
                {
                    OAuthProvider: (undefined as unknown) as string
                },
                null,
                {
                    auth: {
                        username: CredentialsProvider.credentials.userName,
                        password: CredentialsProvider.credentials.password
                    }
                }
            );
        } catch (stat) {
            const res = new InternalStatus<Components.Schemas.Token, GenericErrors>({
                code: StatusCode.ERROR,
                error: stat as InternalError<GenericErrors>
            });
            this.emit("loadLoginInfo", res);
            return res;
        } finally {
            this.loggingIn = false;
        }
        switch (response.status) {
            case 200: {
                console.log("Login success");
                const token = response.data as Components.Schemas.Token;

                // CredentialsProvider.token is added to all requests in the form of Authorization: Bearer <token>
                CredentialsProvider.token = token;
                this.emit("tokenAvailable", token);

                //LoginHooks are a way of running several async tasks at the same time whenever the user is authenticated,
                // we cannot use events here as events wait on each listener before proceeding which has a noticable performance
                // cost when it comes to several different requests to TGS,
                // we cant directly call what we need to run here as it would violate isolation of
                // ApiClient(the apiclient is independent from the rest of the app to avoid circular dependency
                // (example: Component requires ServerClient to login and but the ServerClient requires Component to
                // update it once the server info is loaded))
                //
                // TL;DR; Runs shit when you login

                LoginHooks.runHooks(token);
                const res = new InternalStatus<Components.Schemas.Token, ErrorCode.OK>({
                    code: StatusCode.OK,
                    payload: token
                });
                //Deduplication
                this.emit("loadLoginInfo", res);

                return res;
            }
            case 401: {
                this.logout();
                console.log("Failed to login");
                const res = new InternalStatus<Components.Schemas.Token, ErrorCode.LOGIN_FAIL>({
                    code: StatusCode.ERROR,
                    error: new InternalError(
                        ErrorCode.LOGIN_FAIL,
                        {
                            void: true
                        },
                        response
                    )
                });
                this.emit("loadLoginInfo", res);
                return res;
            }
            case 403: {
                this.logout();
                console.log("Account disabled");
                const res = new InternalStatus<Components.Schemas.Token, ErrorCode.LOGIN_DISABLED>({
                    code: StatusCode.ERROR,
                    error: new InternalError(
                        ErrorCode.LOGIN_DISABLED,
                        {
                            void: true
                        },
                        response
                    )
                });
                this.emit("loadLoginInfo", res);
                return res;
            }
            case 429: {
                this.logout();
                console.log("rate limited");
                const res = new InternalStatus<Components.Schemas.Token, ErrorCode.LOGIN_RATELIMIT>(
                    {
                        code: StatusCode.ERROR,
                        error: new InternalError(
                            ErrorCode.LOGIN_RATELIMIT,
                            {
                                errorMessage: response.data as ErrorMessage
                            },
                            response
                        )
                    }
                );
                this.emit("loadLoginInfo", res);
                return res;
            }
            default: {
                const res = new InternalStatus<
                    Components.Schemas.Token,
                    ErrorCode.UNHANDLED_RESPONSE
                >({
                    code: StatusCode.ERROR,
                    error: new InternalError(
                        ErrorCode.UNHANDLED_RESPONSE,
                        { axiosResponse: response },
                        response
                    )
                });
                this.emit("loadLoginInfo", res);
                return res;
            }
        }
    }

    public logout() {
        //If theres no token it means theres nothing to clear
        if (!CredentialsProvider.isTokenValid()) {
            return;
        }
        console.log("Logging out");
        CredentialsProvider.credentials = undefined;
        CredentialsProvider.token = undefined;
        //events to clear the app state as much as possible for the next user
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
                const resolver = (
                    info: InternalStatus<Components.Schemas.ServerInformation, GenericErrors>
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
