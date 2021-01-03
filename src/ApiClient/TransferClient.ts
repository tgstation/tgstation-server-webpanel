import { Components } from "./generatedcode/_generated";
import InternalError, { ErrorCode, GenericErrors } from "./models/InternalComms/InternalError";
import InternalStatus, { StatusCode } from "./models/InternalComms/InternalStatus";
import ServerClient from "./ServerClient";

export type DownloadErrors = GenericErrors | ErrorCode.TRANSFER_NOT_AVAILABLE;

export default new (class TransferClient {
    public async Download(ticket: string): Promise<InternalStatus<string, DownloadErrors>> {
        await ServerClient.wait4Init();

        let response;
        try {
            response = await ServerClient.apiClient!.TransferController_Download(
                {
                    ticket: ticket
                },
                null,
                {
                    headers: {
                        Accept: "application/json, application/octet-stream"
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
                    payload: (response.data as unknown) as string
                });
            }
            case 410: {
                return new InternalStatus({
                    code: StatusCode.ERROR,
                    error: new InternalError(ErrorCode.TRANSFER_NOT_AVAILABLE, {
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
