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

export type LoginErrors =
    | GenericErrors
    | ErrorCode.LOGIN_DISABLED
    | ErrorCode.LOGIN_FAIL
    | ErrorCode.LOGIN_NOCREDS
    | ErrorCode.LOGIN_BAD_OAUTH
    | ErrorCode.LOGIN_RATELIMIT
    | ErrorCode.LOGIN_LOGGING_IN;

interface IEvents {
    loggingInDoneEvent: (status: InternalStatus<null, LoginErrors>) => void;
}

export default new (class AuthController extends TypedEmitter<IEvents> {
    /**
     * Our own personal API access, to keep the circularness out.
     */
    private apiClient!: Api<unknown>; // treat it as existing, no login options SHOULD happen while config is being loaded

    private _credentials?: ICredentials;
    private token?: TokenResponse;
    private lastToken?: TokenResponse;

    public loggingIn = false;

    public constructor() {
        super();
        if (MODE === "DEV") {
            window.authController = this;
        }
    }

    public Initialize() {
        this.apiClient = new Api(
            new HttpClient({
                //Yes this is only initialized once even if the configOption changes, this doesn't
                baseURL: configOptions.apipath.value as string,
                withCredentials: false,
                headers: {
                    Accept: "application/json",
                    Api: `Tgstation.Server.Api/` + API_VERSION,
                    "Webpanel-Version": VERSION
                }
            })
        );
    }

    public isTokenValid() {
        return !!(
            this.token &&
            this.token.bearer &&
            (!this.token.expiresAt || new Date(this.token.expiresAt).getTime() > Date.now())
        );
    }

    /**
     * Get token while handling validation. Returns undefined IF the cached credential is blank.
     * Will also automatically logout the user.
     *
     * "Why not a getter?" because you cant have async getters.
     */
    public async getToken() {
        if (!this.token || !this.isTokenValid()) {
            if ((await this.authenticateCached()).code !== StatusCode.OK) {
                return this.token;
            }
            this.logout(); // overkill, AuthenticatedCache already runs logout
            return;
        }
        return this.token;
    }

    /**
     * Get token without handling validation.
     */
    public getTokenUnsafe() {
        return this.token;
    }

    /**
     * Gets the last used token for logging clearing. Always assume this is invalid
     */
    public getLastToken() {
        return this.lastToken;
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

    /**
     * Attempt to authenticate using the credentials.
     * This **will not** return token from status.
     * @param credential The credentials, either password/username or oauth.
     * @param cacheCredential Should we cache the credentials for later login?
     */
    public async authenticate(credential: ICredentials, cacheCredential = true) {
        if (this.loggingIn) {
            return await new Promise<InternalStatus<null, LoginErrors>>(resolve =>
                this.on("loggingInDoneEvent", stat => {
                    void resolve(stat);
                })
            );
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
            const stat = new InternalStatus<null, LoginErrors>({
                code: StatusCode.ERROR,
                error: err as InternalError<LoginErrors>
            });
            this.emit("loggingInDoneEvent", stat);
            return stat;
        }

        if (!response || !response.data) {
            const stat = new InternalStatus<null, LoginErrors>({
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
                this.lastToken = this.token;
                this.token = response.data as TokenResponse;
                const stat = new InternalStatus<null, LoginErrors>({
                    code: StatusCode.OK,
                    payload: null // we do not want to pass the payload out
                });
                this.emit("loggingInDoneEvent", stat);
                this.loggingIn = false;
                return stat;
            }

            case 401: {
                this.logout();
                console.info("Failed to login");
                const stat = new InternalStatus<null, ErrorCode.LOGIN_FAIL>({
                    code: StatusCode.ERROR,
                    error: new InternalError(
                        ErrorCode.LOGIN_FAIL,
                        {
                            void: true
                        },
                        response
                    )
                });
                this.emit("loggingInDoneEvent", stat);
                this.loggingIn = false;
                return stat;
            }
            case 403: {
                this.logout();
                console.info("Account disabled");
                const stat = new InternalStatus<null, ErrorCode.LOGIN_DISABLED>({
                    code: StatusCode.ERROR,
                    error: new InternalError(
                        ErrorCode.LOGIN_DISABLED,
                        {
                            void: true
                        },
                        response
                    )
                });
                this.emit("loggingInDoneEvent", stat);
                this.loggingIn = false;
                return stat;
            }
            case 429: {
                this.logout();
                console.log("rate limited");
                const stat = new InternalStatus<null, ErrorCode.LOGIN_RATELIMIT>({
                    code: StatusCode.ERROR,
                    error: new InternalError(
                        ErrorCode.LOGIN_RATELIMIT,
                        {
                            errorMessage: response.data as ErrorMessageResponse
                        },
                        response
                    )
                });
                this.emit("loggingInDoneEvent", stat);
                this.loggingIn = false;
                return stat;
            }
            default: {
                const stat = new InternalStatus<null, ErrorCode.UNHANDLED_RESPONSE>({
                    code: StatusCode.ERROR,
                    error: new InternalError(
                        ErrorCode.UNHANDLED_RESPONSE,
                        { axiosResponse: response },
                        response
                    )
                });
                this.emit("loggingInDoneEvent", stat);
                this.loggingIn = false;
                return stat;
            }
        }
    }

    public logout() {
        this.lastToken = this.token;
        this._credentials = undefined;
        this.token = undefined;
    }
})();