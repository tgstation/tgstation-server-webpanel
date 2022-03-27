import { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { TypedEmitter } from "tiny-typed-emitter";

import { API_VERSION, MODE, VERSION } from "../../definitions/constants";
import { Api, ErrorMessageResponse, HttpClient, TokenResponse } from "../generatedcode/generated";
import { CredentialsType, ICredentials } from "../models/ICredentials";
import {
    ErrorCode,
    GenericErrors,
    InternalError,
    InternalStatus,
    StatusCode
} from "../models/InternalComms";
import configOptions from "./config";
import CredentialsProvider from "./CredentialsProvider";

export type LoginErrors =
    | GenericErrors
    | ErrorCode.LOGIN_DISABLED
    | ErrorCode.LOGIN_FAIL
    | ErrorCode.LOGIN_NOCREDS
    | ErrorCode.LOGIN_BAD_OAUTH
    | ErrorCode.LOGIN_RATELIMIT
    | ErrorCode.LOGIN_LOGGING_IN;

export default new (class AuthController extends TypedEmitter {
    /**
     * Our own personal API access, to keep the circularness out.
     */
    private apiClient!: Api<unknown>; // treat it as existing, no login options SHOULD happen while config is being loaded

    private _credentials?: ICredentials;

    public loggingIn = false;

    /**
     * a way to check if the user DELIBERITELY logged out
     */
    public loggedIn = false;

    // error
    private static readonly globalHandledCodes = [400, 401, 403, 406, 409, 426, 500, 501, 503];

    private readonly apiResponseInterceptor = {
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
                    AuthController.globalHandledCodes.includes(error.response.status)
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

                    // do not autologin if the user deliberitely logged out
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

    public constructor() {
        super();
        if (MODE === "DEV") {
            window.authController = this;
        }
    }

    public Initialize() {
        const httpClient = new HttpClient({
            //Yes this is only initialized once even if the configOption changes, this doesn't
            baseURL: configOptions.apipath.value as string,
            withCredentials: false,
            headers: {
                Accept: "application/json",
                Api: `Tgstation.Server.Api/` + API_VERSION,
                "Webpanel-Version": VERSION
            },
            //Global errors are handled via the catch clause and endpoint specific response codes are handled normally
            validateStatus: status => {
                return !AuthController.globalHandledCodes.includes(status);
            }
        });

        httpClient.instance.interceptors.request.use(
            this.apiRequestInterceptor.onFulfilled,
            this.apiRequestInterceptor.onRejected
        );
        httpClient.instance.interceptors.response.use(
            this.apiResponseInterceptor.onFulfilled,
            error => this.apiResponseInterceptor.onRejected(error, httpClient)
        );

        this.apiClient = new Api(httpClient);
    }

    public isTokenValid() {
        const token = CredentialsProvider.token;
        return !!(
            token &&
            token.bearer &&
            (!token.expiresAt || new Date(token.expiresAt).getTime() > Date.now())
        );
    }

    /**
     * Get token while handling validation. Returns undefined IF the cached credential is blank.
     * Will also automatically logout the user.
     *
     * "Why not a getter?" because you cant have async getters.
     */
    public async getToken() {
        const token = CredentialsProvider.token;
        if (!token || !this.isTokenValid()) {
            if ((await this.authenticateCached()).code !== StatusCode.OK) {
                return token;
            }
            this.logout(); // overkill, AuthenticatedCache already runs logout
            return;
        }
        return token;
    }

    /**
     * Get token without handling validation.
     */
    public getTokenUnsafe() {
        return CredentialsProvider.token;
    }

    /**
     * Gets the last used token for logging clearing. Always assume this is invalid
     */
    public getLastToken() {
        return CredentialsProvider.lastToken;
    }

    /**
     * Authenticate using the cached credential information
     */
    public async authenticateCached() {
        if (!this._credentials) {
            return new InternalStatus<null, LoginErrors>({
                code: StatusCode.ERROR,
                error: new InternalError(ErrorCode.LOGIN_NOCREDS, { void: true })
            });
        }
        return await this.authenticate(this._credentials);
    }

    public async waitUntilLoggedIn() {
        return await new Promise<InternalStatus<null, LoginErrors>>(resolve =>
            this.on("loggingInDoneEvent", stat => {
                void resolve(stat);
            })
        );
    }

    /**
     * Attempt to authenticate using the credentials.
     * This **will not** return token from status.
     * @param credential The credentials, either password/username or oauth.
     * @param cacheCredential Should we cache the credentials for later login?
     */
    public async authenticate(credential: ICredentials, cacheCredential = true) {
        if (this.loggingIn) {
            return await this.waitUntilLoggedIn();
        }
        this.loggingIn = true;

        if (!credential) {
            return new InternalStatus<null, LoginErrors>({
                code: StatusCode.ERROR,
                error: new InternalError(ErrorCode.LOGIN_NOCREDS, { void: true })
            });
        }

        if (cacheCredential) {
            this._credentials = credential;
        }

        let response;
        let stat;
        try {
            if (credential.type == CredentialsType.Password) {
                response = await this.apiClient.homeControllerCreateToken({
                    auth: {
                        username: credential.userName,
                        password: credential.password
                    }
                });
            } else if (credential.type == CredentialsType.OAuth) {
                response = await this.apiClient.homeControllerCreateToken({
                    headers: {
                        OAuthProvider: credential.provider,
                        Authorization: `OAuth ${credential.token}`
                    }
                });
            }
        } catch (err) {
            stat = new InternalStatus<null, LoginErrors>({
                code: StatusCode.ERROR,
                error: err as InternalError<LoginErrors>
            });
            this.emit("loggingInDoneEvent", stat);
            this.loggingIn = false;
            return stat;
        }

        if (!response || !response.data) {
            stat = new InternalStatus<null, LoginErrors>({
                code: StatusCode.ERROR,
                error: new InternalError(ErrorCode.APP_FAIL, {
                    jsError: new Error("unknown credential type")
                })
            });
            this.emit("loggingInDoneEvent", stat);
            this.loggingIn = false;
            return stat;
        }

        switch (response.status) {
            case 200: {
                CredentialsProvider.lastToken = CredentialsProvider.token;
                CredentialsProvider.token = response.data as TokenResponse;
                stat = new InternalStatus<null, LoginErrors>({
                    code: StatusCode.OK,
                    payload: null // we do not want to pass the payload out
                });
                this.loggedIn = false;
                break;
            }
            case 401: {
                this.logout();
                console.info("Failed to login");
                stat = new InternalStatus<null, ErrorCode.LOGIN_FAIL>({
                    code: StatusCode.ERROR,
                    error: new InternalError(
                        ErrorCode.LOGIN_FAIL,
                        {
                            errorMessage: response.data as ErrorMessageResponse
                        },
                        response
                    )
                });
                break;
            }
            case 403: {
                this.logout();
                console.info("Account disabled");
                stat = new InternalStatus<null, ErrorCode.LOGIN_DISABLED>({
                    code: StatusCode.ERROR,
                    error: new InternalError(
                        ErrorCode.LOGIN_DISABLED,
                        {
                            errorMessage: response.data as ErrorMessageResponse
                        },
                        response
                    )
                });
                break;
            }
            case 429: {
                this.logout();
                console.log("rate limited");
                stat = new InternalStatus<null, ErrorCode.LOGIN_RATELIMIT>({
                    code: StatusCode.ERROR,
                    error: new InternalError(
                        ErrorCode.LOGIN_RATELIMIT,
                        {
                            errorMessage: response.data as ErrorMessageResponse
                        },
                        response
                    )
                });
                break;
            }
            default: {
                stat = new InternalStatus<null, ErrorCode.UNHANDLED_RESPONSE>({
                    code: StatusCode.ERROR,
                    error: new InternalError(
                        ErrorCode.UNHANDLED_RESPONSE,
                        { axiosResponse: response },
                        response
                    )
                });
                break;
            }
        }
        this.emit("loggingInDoneEvent", stat);
        this.loggingIn = false;
        return stat;
    }

    public logout() {
        CredentialsProvider.lastToken = CredentialsProvider.token;
        this._credentials = undefined;
        CredentialsProvider.token = undefined;
        this.loggedIn = false;
    }
})();
