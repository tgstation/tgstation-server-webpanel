import { ApiClient } from "./_base";
import type {
    ErrorMessageResponse,
    PaginatedUserGroupResponse,
    PermissionSet,
    UserGroupCreateRequest,
    UserGroupResponse,
    UserGroupUpdateRequest,
} from "./generatedcode/schemas";
import InternalError, { ErrorCode, GenericErrors } from "./models/InternalComms/InternalError";
import InternalStatus, { StatusCode } from "./models/InternalComms/InternalStatus";
import ServerClient from "./ServerClient";
import configOptions from "./util/config";

export type UpdateGroupErrors = GenericErrors | ErrorCode.GROUP_NOT_FOUND;
export type listGroupsErrors = GenericErrors;
export type CreateGroupErrors = GenericErrors;
export type DeleteGroupErrors =
    | GenericErrors
    | ErrorCode.GROUP_NOT_FOUND
    | ErrorCode.GROUP_NOT_EMPTY;

export default new (class UserGroupClient extends ApiClient {
    public async updateGroup(
        group: UserGroupUpdateRequest
    ): Promise<InternalStatus<UserGroupResponse, UpdateGroupErrors>> {
        await ServerClient.wait4Init();

        let response;
        try {
            response = await ServerClient.apiClient!["UserGroupController.Update"](null, group);
        } catch (e) {
            return new InternalStatus({
                code: StatusCode.ERROR,
                error: e as InternalError<GenericErrors>,
            });
        }

        switch (response.status) {
            case 200: {
                return new InternalStatus({
                    code: StatusCode.OK,
                    payload: response.data as UserGroupResponse,
                });
            }
            case 410: {
                return new InternalStatus({
                    code: StatusCode.ERROR,
                    error: new InternalError(ErrorCode.GROUP_NOT_FOUND, {
                        errorMessage: response.data as ErrorMessageResponse,
                    }),
                });
            }
            default: {
                return new InternalStatus({
                    code: StatusCode.ERROR,
                    error: new InternalError(
                        ErrorCode.UNHANDLED_RESPONSE,
                        { axiosResponse: response },
                        response
                    ),
                });
            }
        }
    }

    public async listGroups({
        page = 1,
        pageSize = configOptions.itemsperpage.value as number,
    }): Promise<InternalStatus<PaginatedUserGroupResponse, listGroupsErrors>> {
        await ServerClient.wait4Init();

        let response;
        try {
            response = await ServerClient.apiClient!["UserGroupController.List"]({
                pageSize: pageSize,
                page: page,
            });
        } catch (e) {
            return new InternalStatus({
                code: StatusCode.ERROR,
                error: e as InternalError<GenericErrors>,
            });
        }

        switch (response.status) {
            case 200: {
                return new InternalStatus({
                    code: StatusCode.OK,
                    payload: response.data as PaginatedUserGroupResponse,
                });
            }
            default: {
                return new InternalStatus({
                    code: StatusCode.ERROR,
                    error: new InternalError(
                        ErrorCode.UNHANDLED_RESPONSE,
                        { axiosResponse: response },
                        response
                    ),
                });
            }
        }
    }

    public async createGroup(
        name: string,
        permissionSet?: PermissionSet
    ): Promise<InternalStatus<UserGroupResponse, CreateGroupErrors>> {
        await ServerClient.wait4Init();

        let response;
        try {
            response = await ServerClient.apiClient!["UserGroupController.Create"](null, {
                name: name,
                permissionSet: permissionSet,
            } as UserGroupCreateRequest);
        } catch (e) {
            return new InternalStatus({
                code: StatusCode.ERROR,
                error: e as InternalError<GenericErrors>,
            });
        }

        switch (response.status) {
            case 201: {
                return new InternalStatus({
                    code: StatusCode.OK,
                    payload: response.data as UserGroupResponse,
                });
            }
            default: {
                return new InternalStatus({
                    code: StatusCode.ERROR,
                    error: new InternalError(
                        ErrorCode.UNHANDLED_RESPONSE,
                        { axiosResponse: response },
                        response
                    ),
                });
            }
        }
    }

    public async deleteGroup(id: number): Promise<InternalStatus<null, DeleteGroupErrors>> {
        await ServerClient.wait4Init();

        let response;
        try {
            response = await ServerClient.apiClient!["UserGroupController.Delete"]({ id: id });
        } catch (e) {
            return new InternalStatus({
                code: StatusCode.ERROR,
                error: e as InternalError<GenericErrors>,
            });
        }

        switch (response.status) {
            case 204: {
                return new InternalStatus({
                    code: StatusCode.OK,
                    payload: null,
                });
            }
            case 409: {
                return new InternalStatus({
                    code: StatusCode.ERROR,
                    error: new InternalError(ErrorCode.GROUP_NOT_EMPTY, {
                        errorMessage: response.data as ErrorMessageResponse,
                    }),
                });
            }
            case 410: {
                return new InternalStatus({
                    code: StatusCode.ERROR,
                    error: new InternalError(ErrorCode.GROUP_NOT_FOUND, {
                        errorMessage: response.data as ErrorMessageResponse,
                    }),
                });
            }
            default: {
                return new InternalStatus({
                    code: StatusCode.ERROR,
                    error: new InternalError(
                        ErrorCode.UNHANDLED_RESPONSE,
                        { axiosResponse: response },
                        response
                    ),
                });
            }
        }
    }
})();
