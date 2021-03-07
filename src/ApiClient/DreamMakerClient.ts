import { Components } from "./generatedcode/_generated";
import InternalError, { ErrorCode, GenericErrors } from "./models/InternalComms/InternalError";
import InternalStatus, { StatusCode } from "./models/InternalComms/InternalStatus";
import ServerClient from "./ServerClient";

export type deployErrors = GenericErrors;

export default new (class DreamMakerClient {
    public async deploy(
        instanceid: number
    ): Promise<InternalStatus<Components.Schemas.JobResponse, deployErrors>> {
        await ServerClient.wait4Init();
        let response;
        try {
            response = await ServerClient.apiClient!.DreamMakerController_Create({
                Instance: instanceid
            });
        } catch (stat) {
            const res = new InternalStatus<Components.Schemas.JobResponse, GenericErrors>({
                code: StatusCode.ERROR,
                error: stat as InternalError<GenericErrors>
            });
            return res;
        }

        switch (response.status) {
            case 202: {
                const res = new InternalStatus<Components.Schemas.JobResponse, ErrorCode.OK>({
                    code: StatusCode.OK,
                    payload: response.data as Components.Schemas.JobResponse
                });

                return res;
            }
            default: {
                const res = new InternalStatus<Components.Schemas.JobResponse, GenericErrors>({
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
