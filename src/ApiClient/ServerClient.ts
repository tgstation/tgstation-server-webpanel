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
import { ApiResponseInterceptor } from "./util/Unsorted"
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
    loadLoginInfo: (loginInfo: InternalStatus<null, LoginErrors>) => void;
}

export type ServerInfoErrors = GenericErrors;

export default new (class ServerClient extends ApiClient<IEvents> {
    private static readonly globalHandledCodes = [400, 401, 403, 406, 409, 426, 500, 501, 503];

    //api

    public apiHttpClient?: HttpClient<unknown>;
    public apiClient?: Api<unknown>;

    private readonly apiRequestInterceptor = {
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
                LoginHooks.runHooks();
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

    public initApi() {
        console.log("Initializing API client");
        console.time("APIInit");

        this.apiHttpClient = new HttpClient({
            //Yes this is only initialized once even if the configOption changes, this doesn't
            baseURL: configOptions.apipath.value as string,
            withCredentials: false,
            headers: {
                Accept: "application/json",
                Api: `Tgstation.Server.Api/${API_VERSION}`,
                "Webpanel-Version": VERSION
            },
            /**
             * Handles secure request (see api schema with `secure: true`)
             * if the `secure` value is `true`, we run this async function to fetch the token
             * if it exist => we add on the header, else we add nothing (causing a 4xx err mostly).
             * The getToken WILL try to login if possible!
             * Now, we assume that you DO NOT request until the user logs in properly so that we can avoid
             * unnesesary 4xx errs. To check if the user has logged it, just do `AuthController.isTokenValid()`
             */
            securityWorker: async () => {
                const tok = await AuthController.getToken();
                if (!tok) {
                    return;
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

    /**
     * Login handler. Will NOT return the token, you must get the token by yourself.
     */
    public async login(newCreds?: ICredentials): Promise<InternalStatus<null, LoginErrors>> {
        console.log("Attempting login");
        const response = newCreds
            ? await AuthController.authenticate(newCreds)
            : await AuthController.authenticateCached();

        if (response.code === StatusCode.OK) {
            LoginHooks.runHooks();
        }
        return response;
    }

    public logout(invokesEvent = true) {
        AuthController.logout();
        console.log("Logging out");
        //events to clear the app state as much as possible for the next user
        if (!invokesEvent) {
            return;
        }
        this.emit("purgeCache"); // infinite loop here (search for that phrase on this file)
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
