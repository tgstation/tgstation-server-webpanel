import { Components } from "./generatedcode/_generated";
import InternalError, { ErrorCode, GenericErrors } from "./models/InternalComms/InternalError";
import InternalStatus, { StatusCode } from "./models/InternalComms/InternalStatus";
import ServerClient from "./ServerClient";

export type getCurrentInstanceUserErrors = GenericErrors;

export default new (class InstanceUserClient {
    public async getCurrentInstanceUser(
        instanceid: number
    ): Promise<InternalStatus<Components.Schemas.InstanceUser, getCurrentInstanceUserErrors>> {
        await ServerClient.wait4Init();

        let response;
        try {
            response = await ServerClient.apiClient!.InstanceUserController_Read({
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
                    payload: response.data as Components.Schemas.InstanceUser
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
