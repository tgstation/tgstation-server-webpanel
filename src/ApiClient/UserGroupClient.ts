//https://stackoverflow.com/questions/40510611/typescript-interface-require-one-of-two-properties-to-exist
//name describes what it does, makes the passed type only require 1 property, the others being optional
import { Components } from "./generatedcode/_generated";
import InternalError, { ErrorCode, GenericErrors } from "./models/InternalComms/InternalError";
import InternalStatus, { StatusCode } from "./models/InternalComms/InternalStatus";
import ServerClient from "./ServerClient";

type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
    {
        [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
    }[Keys];

export type UpdateGroupErrors = GenericErrors | ErrorCode.GROUP_NOT_FOUND;
export type listGroupsErrors = GenericErrors;
export type CreateGroupErrors = GenericErrors;
export type DeleteGroupErrors =
    | GenericErrors
    | ErrorCode.GROUP_NOT_FOUND
    | ErrorCode.GROUP_NOT_EMPTY;

export default new (class UserGroupClient {
    public async updateGroup(
        id: number,
        group: RequireAtLeastOne<Omit<Omit<Components.Schemas.UserGroup, "id">, "users">>
    ): Promise<InternalStatus<Components.Schemas.UserGroup, UpdateGroupErrors>> {
        await ServerClient.wait4Init();

        let response;
        try {
            //God I hate how awful JS can look sometimes, this creates a copy of the group argument and overrides the id property
            // on the copy to be the id argument. This is so the argument isn't mutated
            const requestObj: Components.Schemas.UserGroup = Object.assign(
                Object.assign({}, group),
                { id: id }
            ) as Components.Schemas.UserGroup;
            response = await ServerClient.apiClient!.UserGroupController_Update(null, requestObj);
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
                    payload: response.data as Components.Schemas.UserGroup
                });
            }
            case 410: {
                return new InternalStatus({
                    code: StatusCode.ERROR,
                    error: new InternalError(ErrorCode.GROUP_NOT_FOUND, {
                        errorMessage: response.data as Components.Schemas.ErrorMessage
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
        InternalStatus<Components.Schemas.UserGroup[], listGroupsErrors>
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
                    payload: (response.data as Components.Schemas.PaginatedUserGroup)!.content
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
    ): Promise<InternalStatus<Components.Schemas.UserGroup, CreateGroupErrors>> {
        await ServerClient.wait4Init();

        let response;
        try {
            response = await ServerClient.apiClient!.UserGroupController_Create(null, {
                name: name,
                permissionSet: permissionSet
            } as Components.Schemas.UserGroup);
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
                    payload: response.data as Components.Schemas.UserGroup
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
                        errorMessage: response.data as Components.Schemas.ErrorMessage
                    })
                });
            }
            case 410: {
                return new InternalStatus({
                    code: StatusCode.ERROR,
                    error: new InternalError(ErrorCode.GROUP_NOT_FOUND, {
                        errorMessage: response.data as Components.Schemas.ErrorMessage
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
