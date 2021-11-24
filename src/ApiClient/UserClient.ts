import { ApiClient } from "./_base";
import {
    AdministrationRights,
    ErrorMessageResponse,
    InstanceManagerRights ,
    PaginatedUserResponse,
    UserCreateRequest,
    UserResponse,
    UserUpdateRequest
    } from "./generatedcode/generated";
import InternalError, { ErrorCode, GenericErrors } from "./models/InternalComms/InternalError";
import InternalStatus, { StatusCode } from "./models/InternalComms/InternalStatus";
import ServerClient from "./ServerClient";
import configOptions from "./util/config";
import CredentialsProvider from "./util/CredentialsProvider";
import LoginHooks from "./util/LoginHooks";

interface IEvents {
    loadUserInfo: (user: InternalStatus<UserResponse, GenericErrors>) => void;
}

export type GetCurrentUserErrors = GenericErrors;
export type EditUserErrors = GenericErrors | ErrorCode.USER_NOT_FOUND | GetCurrentUserErrors;
export type GetUserErrors = GenericErrors | ErrorCode.USER_NOT_FOUND;
export type CreateUserErrors = GenericErrors | ErrorCode.USER_NO_SYS_IDENT;

export default new (class UserClient extends ApiClient<IEvents> {
    private _cachedUser?: InternalStatus<UserResponse, ErrorCode.OK>;
    public get cachedUser() {
        return this._cachedUser;
    }
    private loadingUserInfo = false;
    //If set to true, all created users will default to having all permissions granted, used by the setup
    public createAllUsersWithAA = false;

    public constructor() {
        super();
        this.getCurrentUser = this.getCurrentUser.bind(this);

        LoginHooks.addHook(() => this.getCurrentUser());
        ServerClient.on("purgeCache", () => {
            this._cachedUser = undefined;
        });
    }

    public async editUser(
        newUser: UserUpdateRequest
    ): Promise<InternalStatus<UserResponse, EditUserErrors>> {
        await ServerClient.wait4Init();
        let response;
        try {
            response = await ServerClient.apiClient!.user.userControllerUpdate(newUser);
        } catch (stat) {
            return new InternalStatus({
                code: StatusCode.ERROR,
                error: stat as InternalError<EditUserErrors>
            });
        }
        // noinspection DuplicatedCode
        switch (response.status) {
            case 200: {
                const current = await this.getCurrentUser();
                if (current.code == StatusCode.OK) {
                    if (current.payload.id == newUser.id) {
                        //if we are editing ourselves, clear cached data to reload permissions on the app
                        ServerClient.emit("purgeCache");
                    }
                } else {
                    return new InternalStatus({
                        code: StatusCode.ERROR,
                        error: current.error
                    });
                }
                return new InternalStatus({
                    code: StatusCode.OK,
                    payload: response.data
                });
            }
            case 404: {
                const errorMessage = response.data as ErrorMessageResponse;
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

    public async getCurrentUser(
        bypassCache?: boolean
    ): Promise<InternalStatus<UserResponse, GetCurrentUserErrors>> {
        await ServerClient.wait4Init();

        if (!CredentialsProvider.isTokenValid()) {
            return new InternalStatus({
                code: StatusCode.ERROR,
                error: new InternalError(ErrorCode.HTTP_ACCESS_DENIED, {
                    void: true
                })
            });
        }

        if (this._cachedUser && !bypassCache) {
            return this._cachedUser;
        }

        if (this.loadingUserInfo) {
            return await new Promise(resolve => {
                const resolver = (user: InternalStatus<UserResponse, GenericErrors>) => {
                    resolve(user);
                    this.removeListener("loadUserInfo", resolver);
                };
                this.on("loadUserInfo", resolver);
            });
        }

        this.loadingUserInfo = true;

        let response;
        try { // UserController_Read
            response = await ServerClient.apiClient!.user.userControllerRead();
        } catch (stat) {
            const res = new InternalStatus<UserResponse, GenericErrors>({
                code: StatusCode.ERROR,
                error: stat as InternalError<GenericErrors>
            });
            this.emit("loadUserInfo", res);
            this.loadingUserInfo = false;
            return res;
        }

        switch (response.status) {
            case 200: {
                const thing = new InternalStatus<UserResponse, ErrorCode.OK>({
                    code: StatusCode.OK,
                    payload: response.data
                });

                this._cachedUser = thing;
                this.emit("loadUserInfo", thing);
                this.loadingUserInfo = false;
                return thing;
            }
            default: {
                const res = new InternalStatus<UserResponse, ErrorCode.UNHANDLED_RESPONSE>({
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

    public async listUsers({
        page = 1,
        pageSize = configOptions.itemsperpage.value as number
    }): Promise<InternalStatus<PaginatedUserResponse, GenericErrors>> {
        await ServerClient.wait4Init();

        let response;
        try {
            response = await ServerClient.apiClient!.user.userControllerList({
                page: page,
                pageSize: pageSize
            });
        } catch (stat) {
            return new InternalStatus({
                code: StatusCode.ERROR,
                error: stat as InternalError<GenericErrors>
            });
        }

        switch (response.status) {
            case 200: {
                const payload = response.data.content!.sort(
                    (a, b) => (a.id || 0) - (b.id || 0)
                );

                return new InternalStatus({
                    code: StatusCode.OK,
                    payload: {
                        ...(response.data),
                        content: payload
                    }
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

    public async getUser(id: number): Promise<InternalStatus<UserResponse, GetUserErrors>> {
        await ServerClient.wait4Init();

        let response;
        try {
            response = await ServerClient.apiClient!.user.userControllerGetId(id);
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
                    payload: response.data
                });
            }
            case 404: {
                const errorMessage = response.data as ErrorMessageResponse;
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

    public async createUser(
        newuser:
            | {
                  name: string;
                  password: string;
                  enabled?: boolean;
                  instanceManagerRights?: InstanceManagerRights;
                  administrationRights?: AdministrationRights;
              }
            | {
                  systemIdentifier: string;
                  enabled?: boolean;
                  instanceManagerRights?: InstanceManagerRights;
                  administrationRights?: AdministrationRights;
              }
    ): Promise<InternalStatus<UserResponse, CreateUserErrors>> {
        await ServerClient.wait4Init();

        if (newuser.enabled === undefined) newuser.enabled = true;
        if (this.createAllUsersWithAA) {
            newuser.instanceManagerRights = 0;
            newuser.administrationRights = 0;

            for (const perm of Object.values(InstanceManagerRights)) {
                if (typeof perm !== "number") continue;
                newuser.instanceManagerRights += perm;
            }

            for (const perm of Object.values(AdministrationRights)) {
                if (typeof perm !== "number") continue;
                newuser.administrationRights += perm;
            }
        }

        let response;
        try {
            response = await ServerClient.apiClient!.user.userControllerCreate(
                newuser as UserCreateRequest
            );
        } catch (stat) {
            return new InternalStatus({
                code: StatusCode.ERROR,
                error: stat as InternalError<GenericErrors>
            });
        }

        switch (response.status) {
            case 201: {
                return new InternalStatus({
                    code: StatusCode.OK,
                    payload: response.data
                });
            }
            case 410: {
                const errorMessage = response.data as ErrorMessageResponse;
                return new InternalStatus({
                    code: StatusCode.ERROR,
                    error: new InternalError(ErrorCode.USER_NO_SYS_IDENT, { errorMessage })
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
