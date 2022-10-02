import { ApiClient } from "./_base";
import type { ErrorMessageResponse } from "./generatedcode/generated";
import InternalError, { ErrorCode, GenericErrors } from "./models/InternalComms/InternalError";
import InternalStatus, { StatusCode } from "./models/InternalComms/InternalStatus";
import ServerClient from "./ServerClient";

export type DownloadErrors = GenericErrors | ErrorCode.TRANSFER_NOT_AVAILABLE;
export type UploadErrors =
    | GenericErrors
    | ErrorCode.TRANSFER_NOT_AVAILABLE
    | ErrorCode.UPLOAD_FAILED;

export default new (class TransferClient extends ApiClient {
    public async Download(ticket: string): Promise<InternalStatus<Blob, DownloadErrors>> {
        await ServerClient.wait4Init();

        let response;
        try {
            response = await ServerClient.apiClient!.transfer.transferControllerDownload(
                {
                    ticket: ticket
                },
                {
                    headers: {
                        Accept: "application/json, application/octet-stream"
                    },
                    format: "blob"
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
                    payload: response.data as Blob
                });
            }
            case 410: {
                return new InternalStatus({
                    code: StatusCode.ERROR,
                    error: new InternalError(ErrorCode.TRANSFER_NOT_AVAILABLE, {
                        errorMessage: response.data as ErrorMessageResponse
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

    public async Upload(
        ticket: string,
        file: ArrayBuffer
    ): Promise<InternalStatus<null, UploadErrors>> {
        await ServerClient.wait4Init();

        let response;
        try {
            response = await ServerClient.apiClient!.transfer.transferControllerUpload(
                {
                    ticket: ticket
                },
                (file as unknown) as File,
                {
                    headers: {
                        "Content-Type": "application/octect-stream"
                    }
                }
            );
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
                    error: new InternalError(ErrorCode.UPLOAD_FAILED, {
                        void: true
                    })
                });
            }
            case 410: {
                return new InternalStatus({
                    code: StatusCode.ERROR,
                    error: new InternalError(ErrorCode.TRANSFER_NOT_AVAILABLE, {
                        errorMessage: response.data as ErrorMessageResponse
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
