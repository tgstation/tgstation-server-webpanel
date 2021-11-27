import { ApiClient } from "./_base";
import {
    ByondInstallResponse,
    ByondResponse,
    PaginatedByondResponse
} from "./generatedcode/generated";
import InternalError, { ErrorCode, GenericErrors } from "./models/InternalComms/InternalError";
import InternalStatus, { StatusCode } from "./models/InternalComms/InternalStatus";
import ServerClient from "./ServerClient";
import TransferClient, { UploadErrors } from "./TransferClient";
import configOptions from "./util/config";

export default new (class ByondClient extends ApiClient {
    public async getActiveVersion(
        instance: number
    ): Promise<InternalStatus<ByondResponse, GenericErrors>> {
        await ServerClient.wait4Init();

        let response;
        try {
            response = await ServerClient.apiClient!.byond.byondControllerRead({
                headers: {
                    Instance: instance as unknown as string // hacky way of forcing strings
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
                    payload: response.data as ByondResponse
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
    ): Promise<InternalStatus<PaginatedByondResponse, GenericErrors>> {
        await ServerClient.wait4Init();

        let response;
        try {
            response = await ServerClient.apiClient!.byond.byondControllerList(
                {
                    page: page,
                    pageSize: pageSize
                },
                {
                    headers: {
                        Instance: instance as unknown as string
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
                    payload: response.data as PaginatedByondResponse
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
        version: string,
        file?: ArrayBuffer
    ): Promise<InternalStatus<ByondInstallResponse, UploadErrors>> {
        await ServerClient.wait4Init();

        let response;
        try {
            response = await ServerClient.apiClient!.byond.byondControllerUpdate(
                {
                    version: version,
                    uploadCustomZip: !!file
                },
                {
                    headers: {
                        Instance: instance as unknown as string
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
                const responseData = (response.data as ByondInstallResponse);
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
