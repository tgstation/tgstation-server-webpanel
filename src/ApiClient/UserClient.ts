import { TypedEmitter } from "tiny-typed-emitter/lib";
import { Components } from "./generatedcode/_generated";
import InternalStatus, { StatusCode } from "./models/InternalComms/InternalStatus";
import InternalError, { ErrorCode, GenericErrors } from "./models/InternalComms/InternalError";
import LoginHooks from "./util/LoginHooks";
import ServerClient from "./ServerClient";

interface IEvents {
    loadUserInfo: (user: InternalStatus<Components.Schemas.User, GenericErrors>) => void;
}

export type ChangePasswordErrors = GenericErrors | ErrorCode.USER_NOT_FOUND;
export type GetUserErrors = GenericErrors | ErrorCode.USER_NOT_FOUND;

export default new (class UserClient extends TypedEmitter<IEvents> {
    private _cachedUser?: InternalStatus<Components.Schemas.User, ErrorCode.OK>;
    public get cachedUser() {
        return this._cachedUser;
    }
    private loadingUserInfo = false;

    public constructor() {
        super();
        this.getCurrentUser = this.getCurrentUser.bind(this);

        LoginHooks.addHook(this.getCurrentUser);
        ServerClient.on("purgeCache", () => {
            this._cachedUser = undefined;
        });
    }

    public async changeOwnPassword(
        password: string
    ): Promise<InternalStatus<Components.Schemas.User, ChangePasswordErrors>> {
        await ServerClient.wait4Init();

        const thing = await this.getCurrentUser();
        switch (thing.code) {
            case StatusCode.ERROR: {
                return thing;
            }
            case StatusCode.OK: {
                let response;
                try {
                    response = await ServerClient.apiClient!.UserController_Update(null, {
                        id: thing.payload!.id,
                        password: password
                    });
                } catch (stat) {
                    return new InternalStatus({
                        code: StatusCode.ERROR,
                        error: stat as InternalError<ChangePasswordErrors>
                    });
                }
                // noinspection DuplicatedCode
                switch (response.status) {
                    case 200: {
                        return new InternalStatus({
                            code: StatusCode.OK,
                            payload: response.data as Components.Schemas.User
                        });
                    }
                    case 404: {
                        const errorMessage = response.data as Components.Schemas.ErrorMessage;
                        return new InternalStatus({
                            code: StatusCode.ERROR,
                            error: new InternalError(ErrorCode.USER_NOT_FOUND, { errorMessage })
                        });
                    }
                    default: {
                        return new InternalStatus({
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
        }
    }

    public async getCurrentUser(): Promise<InternalStatus<Components.Schemas.User, GenericErrors>> {
        await ServerClient.wait4Init();
        if (this._cachedUser) {
            return this._cachedUser;
        }

        if (this.loadingUserInfo) {
            return await new Promise(resolve => {
                const resolver = (user: InternalStatus<Components.Schemas.User, GenericErrors>) => {
                    resolve(user);
                    this.removeListener("loadUserInfo", resolver);
                };
                this.on("loadUserInfo", resolver);
            });
        }

        this.loadingUserInfo = true;

        let response;
        try {
            response = await ServerClient.apiClient!.UserController_Read();
        } catch (stat) {
            const res = new InternalStatus<Components.Schemas.User, GenericErrors>({
                code: StatusCode.ERROR,
                error: stat as InternalError<GenericErrors>
            });
            this.emit("loadUserInfo", res);
            this.loadingUserInfo = false;
            return res;
        }

        switch (response.status) {
            case 200: {
                const thing = new InternalStatus<Components.Schemas.User, ErrorCode.OK>({
                    code: StatusCode.OK,
                    payload: response.data as Components.Schemas.User
                });

                this._cachedUser = thing;
                this.emit("loadUserInfo", thing);
                this.loadingUserInfo = false;
                return thing;
            }
            default: {
                const res = new InternalStatus<
                    Components.Schemas.User,
                    ErrorCode.UNHANDLED_RESPONSE
                >({
                    code: StatusCode.ERROR,
                    error: new InternalError(
                        ErrorCode.UNHANDLED_RESPONSE,
                        { axiosResponse: response },
                        response
                    )
                });
                this.emit("loadUserInfo", res);
                this.loadingUserInfo = false;
                return res;
            }
        }
    }

    public async listUsers(): Promise<InternalStatus<Components.Schemas.User[], GenericErrors>> {
        await ServerClient.wait4Init();

        let response;
        try {
            response = await ServerClient.apiClient!.UserController_List();
        } catch (stat) {
            return new InternalStatus({
                code: StatusCode.ERROR,
                error: stat as InternalError<GenericErrors>
            });
        }

        switch (response.status) {
            case 200: {
                return new InternalStatus({
                    code: StatusCode.OK,
                    payload: response.data as Components.Schemas.User[]
                });
            }
            default: {
                return new InternalStatus({
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

    public async getUser(
        id: number
    ): Promise<InternalStatus<Components.Schemas.User, GetUserErrors>> {
        await ServerClient.wait4Init();

        let response;
        try {
            response = await ServerClient.apiClient!.UserController_GetId({ id: id });
        } catch (stat) {
            return new InternalStatus({
                code: StatusCode.ERROR,
                error: stat as InternalError<GenericErrors>
            });
        }
        // noinspection DuplicatedCode
        switch (response.status) {
            case 200: {
                return new InternalStatus({
                    code: StatusCode.OK,
                    payload: response.data as Components.Schemas.User
                });
            }
            case 404: {
                const errorMessage = response.data as Components.Schemas.ErrorMessage;
                return new InternalStatus({
                    code: StatusCode.ERROR,
                    error: new InternalError(ErrorCode.USER_NOT_FOUND, { errorMessage })
                });
            }
            default: {
                return new InternalStatus({
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
})();
