import { ApiClient } from "./_base";
import type {
    ErrorMessageResponse,
    InstancePermissionSetRequest,
    InstancePermissionSetResponse,
    PaginatedInstancePermissionSetResponse
} from "./generatedcode/generated";
import InternalError, { ErrorCode, GenericErrors } from "./models/InternalComms/InternalError";
import InternalStatus, { StatusCode } from "./models/InternalComms/InternalStatus";
import ServerClient from "./ServerClient";
import configOptions from "./util/config";

interface IEvents {
    loadInstancePermissionSet: (
        user: InternalStatus<InstancePermissionSetResponse, GenericErrors>
    ) => void;
}

export type getCurrentInstancePermissionSetErrors = GenericErrors;
export type getByPermissionSetIdErrors = GenericErrors | ErrorCode.NO_DB_ENTITY;
export type createInstancePermissionSetErrors = GenericErrors | ErrorCode.NO_DB_ENTITY;
export type updateInstancePermissionSetErrors = GenericErrors | ErrorCode.NO_DB_ENTITY;
export type deleteInstancePermissionSetErrors = GenericErrors | ErrorCode.NO_DB_ENTITY;
export type listInstancePermissionSetErrors = GenericErrors;

export default new (class InstancePermissionSetClient extends ApiClient<IEvents> {
    private _cachedInstancePermissionSet: Map<
        number,
        InternalStatus<InstancePermissionSetResponse, ErrorCode.OK>
    > = new Map<number, InternalStatus<InstancePermissionSetResponse, ErrorCode.OK>>();

    private loadingInstancePermissionSetInfo: Map<number, boolean> = new Map<number, boolean>();

    public constructor() {
        super();

        ServerClient.on("purgeCache", () => {
            this._cachedInstancePermissionSet.clear();
        });
    }

    public async listInstancePermissionSets(
        instanceid: number,
        { page = 1, pageSize = configOptions.itemsperpage.value as number }
    ): Promise<
        InternalStatus<PaginatedInstancePermissionSetResponse, listInstancePermissionSetErrors>
    > {
        await ServerClient.wait4Init();

        let response;
        try {
            response = await ServerClient.apiClient!.api.instancePermissionSetControllerList(
                {
                    page: page,
                    pageSize: pageSize
                },
                {
                    headers: {
                        Instance: instanceid.toString()
                    }
                }
            );
        } catch (stat) {
            return new InternalStatus({
                code: StatusCode.ERROR,
                error: stat as InternalError<GenericErrors>
            });
        }

        switch (response.status) {
            case 200: {
                const res = new InternalStatus<
                    PaginatedInstancePermissionSetResponse,
                    ErrorCode.OK
                >({
                    code: StatusCode.OK,
                    payload: response.data as PaginatedInstancePermissionSetResponse
                });
                return res;
            }
            default: {
                const res = new InternalStatus<
                    PaginatedInstancePermissionSetResponse,
                    GenericErrors
                >({
                    code: StatusCode.ERROR,
                    error: new InternalError(
                        ErrorCode.UNHANDLED_RESPONSE,
                        { axiosResponse: response },
                        response
                    )
                });
                return res;
            }
        }
    }

    public async getCurrentInstancePermissionSet(
        instanceid: number,
        noCache?: boolean
    ): Promise<
        InternalStatus<InstancePermissionSetResponse, getCurrentInstancePermissionSetErrors>
    > {
        await ServerClient.wait4Init();

        if (!noCache && this._cachedInstancePermissionSet.has(instanceid)) {
            return this._cachedInstancePermissionSet.get(instanceid)!;
        }

        if (this.loadingInstancePermissionSetInfo.get(instanceid)) {
            return await new Promise(resolve => {
                const resolver = (
                    user: InternalStatus<InstancePermissionSetResponse, GenericErrors>
                ) => {
                    resolve(user);
                    this.removeListener("loadInstancePermissionSet", resolver);
                };
                this.on("loadInstancePermissionSet", resolver);
            });
        }

        this.loadingInstancePermissionSetInfo.set(instanceid, true);

        let response;
        try {
            response = await ServerClient.apiClient!.api.instancePermissionSetControllerRead({
                headers: {
                    Instance: instanceid.toString()
                }
            });
        } catch (stat) {
            const res = new InternalStatus<InstancePermissionSetResponse, GenericErrors>({
                code: StatusCode.ERROR,
                error: stat as InternalError<GenericErrors>
            });
            this.emit("loadInstancePermissionSet", res);
            this.loadingInstancePermissionSetInfo.set(instanceid, false);
            return res;
        }

        switch (response.status) {
            case 200: {
                const res = new InternalStatus<InstancePermissionSetResponse, ErrorCode.OK>({
                    code: StatusCode.OK,
                    payload: response.data as InstancePermissionSetResponse
                });

                this._cachedInstancePermissionSet.set(instanceid, res);
                this.emit("loadInstancePermissionSet", res);
                this.loadingInstancePermissionSetInfo.set(instanceid, false);
                return res;
            }
            default: {
                const res = new InternalStatus<InstancePermissionSetResponse, GenericErrors>({
                    code: StatusCode.ERROR,
                    error: new InternalError(
                        ErrorCode.UNHANDLED_RESPONSE,
                        { axiosResponse: response },
                        response
                    )
                });
                this.emit("loadInstancePermissionSet", res);
                this.loadingInstancePermissionSetInfo.set(instanceid, false);
                return res;
            }
        }
    }

    public async getByPermissionSetId(
        instanceid: number,
        permissionSetId: number
    ): Promise<InternalStatus<InstancePermissionSetResponse, getByPermissionSetIdErrors>> {
        await ServerClient.wait4Init();

        let response;
        try {
            response = await ServerClient.apiClient!.api.instancePermissionSetControllerGetId(
                permissionSetId,
                {
                    headers: {
                        Instance: instanceid.toString()
                    }
                }
            );
        } catch (stat) {
            const res = new InternalStatus<
                InstancePermissionSetResponse,
                getByPermissionSetIdErrors
            >({
                code: StatusCode.ERROR,
                error: stat as InternalError<getByPermissionSetIdErrors>
            });
            return res;
        }

        switch (response.status) {
            case 200: {
                const res = new InternalStatus<InstancePermissionSetResponse, ErrorCode.OK>({
                    code: StatusCode.OK,
                    payload: response.data as InstancePermissionSetResponse
                });
                return res;
            }
            case 410:
                return new InternalStatus({
                    code: StatusCode.ERROR,
                    error: new InternalError(ErrorCode.NO_DB_ENTITY, {
                        errorMessage: response.data as ErrorMessageResponse
                    })
                });
            default: {
                const res = new InternalStatus<
                    InstancePermissionSetResponse,
                    getByPermissionSetIdErrors
                >({
                    code: StatusCode.ERROR,
                    error: new InternalError(
                        ErrorCode.UNHANDLED_RESPONSE,
                        { axiosResponse: response },
                        response
                    )
                });
                return res;
            }
        }
    }

    public async createInstancePermissionSet(
        instanceid: number,
        instancePermissionSet: InstancePermissionSetRequest
    ): Promise<InternalStatus<InstancePermissionSetResponse, createInstancePermissionSetErrors>> {
        await ServerClient.wait4Init();

        let response;
        try {
            response = await ServerClient.apiClient!.api.instancePermissionSetControllerCreate(
                instancePermissionSet,
                {
                    headers: {
                        Instance: instanceid.toString()
                    }
                }
            );
        } catch (stat) {
            const res = new InternalStatus<
                InstancePermissionSetResponse,
                createInstancePermissionSetErrors
            >({
                code: StatusCode.ERROR,
                error: stat as InternalError<createInstancePermissionSetErrors>
            });
            return res;
        }

        switch (response.status) {
            case 201: {
                const res = new InternalStatus<InstancePermissionSetResponse, ErrorCode.OK>({
                    code: StatusCode.OK,
                    payload: response.data as InstancePermissionSetResponse
                });
                return res;
            }
            case 410:
                return new InternalStatus({
                    code: StatusCode.ERROR,
                    error: new InternalError(ErrorCode.NO_DB_ENTITY, {
                        errorMessage: response.data as ErrorMessageResponse
                    })
                });
            default: {
                const res = new InternalStatus<
                    InstancePermissionSetResponse,
                    createInstancePermissionSetErrors
                >({
                    code: StatusCode.ERROR,
                    error: new InternalError(
                        ErrorCode.UNHANDLED_RESPONSE,
                        { axiosResponse: response },
                        response
                    )
                });
                return res;
            }
        }
    }

    public async updateInstancePermissionSet(
        instanceid: number,
        instancePermissionSet: InstancePermissionSetRequest
    ): Promise<InternalStatus<InstancePermissionSetResponse, updateInstancePermissionSetErrors>> {
        await ServerClient.wait4Init();

        let response;
        try {
            response = await ServerClient.apiClient!.api.instancePermissionSetControllerUpdate(
                instancePermissionSet,
                {
                    headers: {
                        Instance: instanceid.toString()
                    }
                }
            );
        } catch (stat) {
            const res = new InternalStatus<
                InstancePermissionSetResponse,
                updateInstancePermissionSetErrors
            >({
                code: StatusCode.ERROR,
                error: stat as InternalError<updateInstancePermissionSetErrors>
            });
            return res;
        }

        switch (response.status) {
            case 200: {
                const res = new InternalStatus<InstancePermissionSetResponse, ErrorCode.OK>({
                    code: StatusCode.OK,
                    payload: response.data as InstancePermissionSetResponse
                });
                return res;
            }
            case 410:
                return new InternalStatus({
                    code: StatusCode.ERROR,
                    error: new InternalError(ErrorCode.NO_DB_ENTITY, {
                        errorMessage: response.data as ErrorMessageResponse
                    })
                });
            default: {
                const res = new InternalStatus<
                    InstancePermissionSetResponse,
                    updateInstancePermissionSetErrors
                >({
                    code: StatusCode.ERROR,
                    error: new InternalError(
                        ErrorCode.UNHANDLED_RESPONSE,
                        { axiosResponse: response },
                        response
                    )
                });
                return res;
            }
        }
    }

    public async deleteInstancePermissionSet(
        instanceid: number,
        permissionSetId: number
    ): Promise<InternalStatus<InstancePermissionSetResponse, deleteInstancePermissionSetErrors>> {
        await ServerClient.wait4Init();

        let response;
        try {
            response = await ServerClient.apiClient!.api.instancePermissionSetControllerDelete(
                permissionSetId,
                {
                    headers: {
                        Instance: instanceid.toString()
                    }
                }
            );
        } catch (stat) {
            const res = new InternalStatus<
                InstancePermissionSetResponse,
                deleteInstancePermissionSetErrors
            >({
                code: StatusCode.ERROR,
                error: stat as InternalError<deleteInstancePermissionSetErrors>
            });
            return res;
        }

        switch (response.status) {
            case 204: {
                return new InternalStatus({
                    code: StatusCode.OK,
                    payload: { permissionSetId } as InstancePermissionSetResponse
                });
            }
            case 410:
                return new InternalStatus({
                    code: StatusCode.ERROR,
                    error: new InternalError(ErrorCode.NO_DB_ENTITY, {
                        errorMessage: response.data as ErrorMessageResponse
                    })
                });
            default: {
                const res = new InternalStatus<
                    InstancePermissionSetResponse,
                    deleteInstancePermissionSetErrors
                >({
                    code: StatusCode.ERROR,
                    error: new InternalError(
                        ErrorCode.UNHANDLED_RESPONSE,
                        { axiosResponse: response },
                        response
                    )
                });
                return res;
            }
        }
    }
})();
