import { ApiClient } from "./_base";
import type {
    ErrorMessageResponse,
    InstanceCreateRequest,
    InstanceResponse,
    InstanceUpdateRequest,
    PaginatedInstanceResponse
} from "./generatedcode/generated";
import InternalError, { ErrorCode, GenericErrors } from "./models/InternalComms/InternalError";
import InternalStatus, { StatusCode } from "./models/InternalComms/InternalStatus";
import ServerClient from "./ServerClient";
import configOptions from "./util/config";

export type ListInstancesErrors = GenericErrors;
export type CreateInstanceErrors = GenericErrors;
export type EditInstanceErrors = GenericErrors | ErrorCode.NO_DB_ENTITY;
export type GetInstanceErrors = GenericErrors | ErrorCode.NO_DB_ENTITY;

interface IEvents {
    instanceChange: (instanceId: number) => void;
}

export default new (class InstanceClient extends ApiClient<IEvents> {
    public async listInstances({
        page = 1,
        pageSize = configOptions.itemsperpage.value as number
    } = {}): Promise<InternalStatus<PaginatedInstanceResponse, ListInstancesErrors>> {
        await ServerClient.wait4Init();

        let response;
        try {
            response = await ServerClient.apiClient!.instance.instanceControllerList({
                pageSize: pageSize,
                page: page
            });
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
                    payload: response.data
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

    public async editInstance(
        instance: InstanceUpdateRequest
    ): Promise<InternalStatus<InstanceResponse, EditInstanceErrors>> {
        await ServerClient.wait4Init();

        let response;
        try {
            response = await ServerClient.apiClient!.instance.instanceControllerUpdate(instance);
            this.emit("instanceChange", instance.id || NaN);
        } catch (stat) {
            return new InternalStatus({
                code: StatusCode.ERROR,
                error: stat as InternalError<GenericErrors>
            });
        }
        switch (response.status) {
            case 200:
            case 202: {
                const instance = response.data;

                return new InternalStatus({
                    code: StatusCode.OK,
                    payload: instance
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

    public async createInstance(
        instance: InstanceCreateRequest
    ): Promise<InternalStatus<InstanceResponse, CreateInstanceErrors>> {
        await ServerClient.wait4Init();

        let response;
        try {
            response = await ServerClient.apiClient!.instance.instanceControllerCreate(instance);
        } catch (stat) {
            return new InternalStatus({
                code: StatusCode.ERROR,
                error: stat as InternalError<GenericErrors>
            });
        }
        switch (response.status) {
            case 200:
            case 201: {
                const instance = response.data;

                this.emit("instanceChange", instance.id || NaN);

                return new InternalStatus({
                    code: StatusCode.OK,
                    payload: instance
                });
            }
            case 409:
                return new InternalStatus({
                    code: StatusCode.ERROR,
                    error: new InternalError(ErrorCode.HTTP_DATA_INEGRITY, {
                        errorMessage: response.data as ErrorMessageResponse
                    })
                });
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

    public async getInstance(
        instanceid: number
    ): Promise<InternalStatus<InstanceResponse, GetInstanceErrors>> {
        await ServerClient.wait4Init();

        let response;
        try {
            response = await ServerClient.apiClient!.instance.instanceControllerGetId(instanceid);
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
                    payload: response.data
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
