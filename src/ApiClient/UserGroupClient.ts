import { Components } from "./generatedcode/_generated";
import InternalError, { ErrorCode, GenericErrors } from "./models/InternalComms/InternalError";
import InternalStatus, { StatusCode } from "./models/InternalComms/InternalStatus";
import ServerClient from "./ServerClient";
import UserGroupUpdateRequest = Components.Schemas.UserGroupUpdateRequest;

export type UpdateGroupErrors = GenericErrors | ErrorCode.GROUP_NOT_FOUND;
export type listGroupsErrors = GenericErrors;
export type CreateGroupErrors = GenericErrors;
export type DeleteGroupErrors =
    | GenericErrors
    | ErrorCode.GROUP_NOT_FOUND
    | ErrorCode.GROUP_NOT_EMPTY;

export default new (class UserGroupClient {
    public async updateGroup(
        group: UserGroupUpdateRequest
    ): Promise<InternalStatus<Components.Schemas.UserGroupResponse, UpdateGroupErrors>> {
        await ServerClient.wait4Init();

        let response;
        try {
            response = await ServerClient.apiClient!.UserGroupController_Update(null, group);
        } catch (e) {
            return new InternalStatus({
                code: StatusCode.ERROR,
                error: e as InternalError<GenericErrors>
            });
        }

        switch (response.status) {
            case 200: {
                return new InternalStatus({
                    code: StatusCode.OK,
                    payload: response.data as Components.Schemas.UserGroupResponse
                });
            }
            case 410: {
                return new InternalStatus({
                    code: StatusCode.ERROR,
                    error: new InternalError(ErrorCode.GROUP_NOT_FOUND, {
                        errorMessage: response.data as Components.Schemas.ErrorMessageResponse
                    })
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

    public async listGroups(): Promise<
        InternalStatus<Components.Schemas.UserGroupResponse[], listGroupsErrors>
    > {
        await ServerClient.wait4Init();

        let response;
        try {
            response = await ServerClient.apiClient!.UserGroupController_List({
                pageSize: 100,
                page: 1
            });
        } catch (e) {
            return new InternalStatus({
                code: StatusCode.ERROR,
                error: e as InternalError<GenericErrors>
            });
        }

        switch (response.status) {
            case 200: {
                return new InternalStatus({
                    code: StatusCode.OK,
                    payload: (response.data as Components.Schemas.PaginatedUserGroupResponse)
                        .content
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

    public async createGroup(
        name: string,
        permissionSet?: Components.Schemas.PermissionSet
    ): Promise<InternalStatus<Components.Schemas.UserGroupResponse, CreateGroupErrors>> {
        await ServerClient.wait4Init();

        let response;
        try {
            response = await ServerClient.apiClient!.UserGroupController_Create(null, {
                name: name,
                permissionSet: permissionSet
            } as Components.Schemas.UserGroupCreateRequest);
        } catch (e) {
            return new InternalStatus({
                code: StatusCode.ERROR,
                error: e as InternalError<GenericErrors>
            });
        }

        switch (response.status) {
            case 201: {
                return new InternalStatus({
                    code: StatusCode.OK,
                    payload: response.data as Components.Schemas.UserGroupResponse
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

    public async deleteGroup(id: number): Promise<InternalStatus<null, DeleteGroupErrors>> {
        await ServerClient.wait4Init();

        let response;
        try {
            response = await ServerClient.apiClient!.UserGroupController_Delete({ id: id });
        } catch (e) {
            return new InternalStatus({
                code: StatusCode.ERROR,
                error: e as InternalError<GenericErrors>
            });
        }

        switch (response.status) {
            case 204: {
                return new InternalStatus({
                    code: StatusCode.OK,
                    payload: null
                });
            }
            case 409: {
                return new InternalStatus({
                    code: StatusCode.ERROR,
                    error: new InternalError(ErrorCode.GROUP_NOT_EMPTY, {
                        errorMessage: response.data as Components.Schemas.ErrorMessageResponse
                    })
                });
            }
            case 410: {
                return new InternalStatus({
                    code: StatusCode.ERROR,
                    error: new InternalError(ErrorCode.GROUP_NOT_FOUND, {
                        errorMessage: response.data as Components.Schemas.ErrorMessageResponse
                    })
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
