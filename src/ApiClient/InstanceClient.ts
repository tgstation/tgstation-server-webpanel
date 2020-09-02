import ServerClient from "./ServerClient";
import InternalStatus, { StatusCode } from "./models/InternalComms/InternalStatus";
import InternalError, { ErrorCode, GenericErrors } from "./models/InternalComms/InternalError";
import { Components } from "./generatedcode/_generated";

export type ListInstancesErrors = GenericErrors;

export default new (class InstanceClient {
    public async listInstances(): Promise<
        InternalStatus<Components.Schemas.Instance[], ListInstancesErrors>
    > {
        await ServerClient.wait4Init();

        let response;
        try {
            response = await ServerClient.apiClient!.InstanceController_List();
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
                    payload: response.data as Components.Schemas.Instance[]
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
