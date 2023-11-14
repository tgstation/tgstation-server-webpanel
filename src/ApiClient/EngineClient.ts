import { ApiClient } from "./_base";
import {
    EngineInstallResponse,
    EngineResponse,
    EngineVersion,
    ErrorMessageResponse,
    JobResponse,
    PaginatedEngineResponse
} from "./generatedcode/generated";
import InternalError, { ErrorCode, GenericErrors } from "./models/InternalComms/InternalError";
import InternalStatus, { StatusCode } from "./models/InternalComms/InternalStatus";
import ServerClient from "./ServerClient";
import TransferClient, { UploadErrors } from "./TransferClient";
import configOptions from "./util/config";

export type DeleteErrors = GenericErrors | ErrorCode.ENGINE_VERSION_NOT_FOUND;

export default new (class EngineClient extends ApiClient {
    public async getActiveVersion(
        instance: number
    ): Promise<InternalStatus<EngineResponse, GenericErrors>> {
        await ServerClient.wait4Init();

        let response;
        try {
            response = await ServerClient.apiClient!.api.engineControllerRead({
                headers: {
                    Instance: instance.toString()
                }
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
                    payload: response.data as EngineResponse
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

    public async listAllVersions(
        instance: number,
        { page = 1, pageSize = configOptions.itemsperpage.value as number }
    ): Promise<InternalStatus<PaginatedEngineResponse, GenericErrors>> {
        await ServerClient.wait4Init();

        let response;
        try {
            response = await ServerClient.apiClient!.api.engineControllerList(
                {
                    page: page,
                    pageSize: pageSize
                },
                {
                    headers: {
                        Instance: instance.toString()
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
                return new InternalStatus({
                    code: StatusCode.OK,
                    payload: response.data as PaginatedEngineResponse
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

    public async deleteVersion(
        instance: number,
        engineVersion: EngineVersion
    ): Promise<InternalStatus<JobResponse, DeleteErrors>> {
        await ServerClient.wait4Init();

        let response;
        try {
            response = await ServerClient.apiClient!.api.engineControllerDelete(
                {
                    engineVersion
                },
                {
                    headers: {
                        Instance: instance.toString()
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
            case 202: {
                const responseData = response.data as JobResponse;
                return new InternalStatus({
                    code: StatusCode.OK,
                    payload: responseData
                });
            }
            case 409:
                return new InternalStatus({
                    code: StatusCode.ERROR,
                    error: new InternalError(ErrorCode.HTTP_DATA_INEGRITY, {
                        errorMessage: response.data as ErrorMessageResponse
                    })
                });
            case 410: {
                return new InternalStatus({
                    code: StatusCode.ERROR,
                    error: new InternalError(
                        ErrorCode.ENGINE_VERSION_NOT_FOUND,
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

    public async switchActive(
        instance: number,
        engineVersion: EngineVersion,
        file?: ArrayBuffer
    ): Promise<InternalStatus<EngineInstallResponse, UploadErrors>> {
        await ServerClient.wait4Init();

        let response;
        try {
            response = await ServerClient.apiClient!.api.engineControllerUpdate(
                {
                    engineVersion,
                    uploadCustomZip: !!file
                },
                {
                    headers: {
                        Instance: instance.toString()
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
            case 200:
            case 202: {
                const responseData = response.data as EngineInstallResponse;
                if (responseData.fileTicket) {
                    if (file) {
                        const response2 = await TransferClient.Upload(
                            responseData.fileTicket,
                            file
                        );
                        if (response2.code === StatusCode.OK) {
                            return new InternalStatus({
                                code: StatusCode.OK,
                                payload: responseData
                            });
                        } else {
                            return new InternalStatus({
                                code: StatusCode.ERROR,
                                error: response2.error
                            });
                        }
                    } else {
                        return new InternalStatus({
                            code: StatusCode.ERROR,
                            error: new InternalError(ErrorCode.APP_FAIL, {
                                jsError: Error(
                                    "switchActive is uploading a custom zip without actually having a zip file to upload"
                                )
                            })
                        });
                    }
                }

                return new InternalStatus({
                    code: StatusCode.OK,
                    payload: responseData
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
