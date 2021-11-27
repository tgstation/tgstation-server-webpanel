import { ApiClient } from "./_base";
import {
    ErrorMessageResponse,
    RepositoryCreateRequest,
    RepositoryResponse,
    RepositoryUpdateRequest
} from "./generatedcode/schemas";
import InternalError, { ErrorCode, GenericErrors } from "./models/InternalComms/InternalError";
import InternalStatus, { StatusCode } from "./models/InternalComms/InternalStatus";
import ServerClient from "./ServerClient";

export type cloneRepositoryErrors = GenericErrors | ErrorCode.NO_DB_ENTITY;
export type deleteRepositoryErrors = GenericErrors | ErrorCode.NO_DB_ENTITY;
export type getRepositoryErrors = GenericErrors | ErrorCode.NO_DB_ENTITY;
export type editRepositoryErrors = GenericErrors | ErrorCode.NO_DB_ENTITY;

export default new (class RepositoryClient extends ApiClient {
    public async cloneRepository(
        instanceid: number,
        settings: RepositoryCreateRequest
    ): Promise<InternalStatus<RepositoryResponse, cloneRepositoryErrors>> {
        await ServerClient.wait4Init();

        let response;
        try {
            response = await ServerClient.apiClient!.RepositoryController_Create(
                {
                    Instance: instanceid
                },
                settings
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
                    payload: response.data as RepositoryResponse
                });
            }
            case 410: {
                return new InternalStatus({
                    code: StatusCode.ERROR,
                    error: new InternalError(
                        ErrorCode.NO_DB_ENTITY,
                        {
                            errorMessage: response.data as ErrorMessageResponse
                        },
                        response
                    )
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

    public async deleteRepository(
        instanceid: number
    ): Promise<InternalStatus<RepositoryResponse, deleteRepositoryErrors>> {
        await ServerClient.wait4Init();

        let response;
        try {
            response = await ServerClient.apiClient!.RepositoryController_Delete({
                Instance: instanceid
            });
        } catch (stat) {
            return new InternalStatus({
                code: StatusCode.ERROR,
                error: stat as InternalError<GenericErrors>
            });
        }

        switch (response.status) {
            case 202: {
                return new InternalStatus({
                    code: StatusCode.OK,
                    payload: response.data as RepositoryResponse
                });
            }
            case 410: {
                return new InternalStatus({
                    code: StatusCode.ERROR,
                    error: new InternalError(
                        ErrorCode.NO_DB_ENTITY,
                        {
                            errorMessage: response.data as ErrorMessageResponse
                        },
                        response
                    )
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

    public async getRepository(
        instanceid: number
    ): Promise<
        InternalStatus<RepositoryResponse & { bootstrapped?: boolean }, getRepositoryErrors>
    > {
        await ServerClient.wait4Init();

        let response;
        try {
            response = await ServerClient.apiClient!.RepositoryController_Read({
                Instance: instanceid
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
                    payload: response.data as RepositoryResponse
                });
            }
            case 201: {
                return new InternalStatus({
                    code: StatusCode.OK,
                    payload: Object.assign(
                        { bootstraped: true },
                        response.data as RepositoryResponse
                    )
                });
            }
            case 410: {
                return new InternalStatus({
                    code: StatusCode.ERROR,
                    error: new InternalError(
                        ErrorCode.NO_DB_ENTITY,
                        {
                            errorMessage: response.data as ErrorMessageResponse
                        },
                        response
                    )
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

    public async editRepository(
        instanceid: number,
        newSettings: RepositoryUpdateRequest
    ): Promise<
        InternalStatus<RepositoryResponse & { longRunning?: boolean }, editRepositoryErrors>
    > {
        await ServerClient.wait4Init();

        let response;
        try {
            response = await ServerClient.apiClient!.RepositoryController_Update(
                {
                    Instance: instanceid
                },
                newSettings
            );
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
                    payload: response.data as RepositoryResponse
                });
            }
            case 202: {
                return new InternalStatus({
                    code: StatusCode.OK,
                    payload: Object.assign(
                        { longRunning: true },
                        response.data as RepositoryResponse
                    )
                });
            }
            case 410: {
                return new InternalStatus({
                    code: StatusCode.ERROR,
                    error: new InternalError(
                        ErrorCode.NO_DB_ENTITY,
                        {
                            errorMessage: response.data as ErrorMessageResponse
                        },
                        response
                    )
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
