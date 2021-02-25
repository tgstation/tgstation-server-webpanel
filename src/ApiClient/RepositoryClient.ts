import { Components } from "./generatedcode/_generated";
import InternalError, { ErrorCode, GenericErrors } from "./models/InternalComms/InternalError";
import InternalStatus, { StatusCode } from "./models/InternalComms/InternalStatus";
import ServerClient from "./ServerClient";

export type getCurrentRepositoryErrors = GenericErrors;
export type cloneRepositoryErrors = GenericErrors;

export default new (class RepositoryClient {
    public async getCurrent(
        instanceid: number
    ): Promise<InternalStatus<Components.Schemas.RepositoryResponse, getCurrentRepositoryErrors>> {
        await ServerClient.wait4Init();
        let response;
        try {
            response = await ServerClient.apiClient!.RepositoryController_Read({
                Instance: instanceid
            });
        } catch (stat) {
            const res = new InternalStatus<Components.Schemas.RepositoryResponse, GenericErrors>({
                code: StatusCode.ERROR,
                error: stat as InternalError<GenericErrors>
            });
            return res;
        }

        switch (response.status) {
            case 200:
            case 201: {
                const res = new InternalStatus<Components.Schemas.RepositoryResponse, ErrorCode.OK>(
                    {
                        code: StatusCode.OK,
                        payload: response.data as Components.Schemas.RepositoryResponse
                    }
                );

                return res;
            }
            default: {
                const res = new InternalStatus<
                    Components.Schemas.RepositoryResponse,
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

    public async clone(
        model: Components.Schemas.RepositoryCreateRequest,
        instanceid: number
    ): Promise<InternalStatus<Components.Schemas.RepositoryResponse, cloneRepositoryErrors>> {
        await ServerClient.wait4Init();
        let response;
        try {
            response = await ServerClient.apiClient!.RepositoryController_Create(
                {
                    Instance: instanceid
                },
                model
            );
        } catch (stat) {
            const res = new InternalStatus<Components.Schemas.RepositoryResponse, GenericErrors>({
                code: StatusCode.ERROR,
                error: stat as InternalError<GenericErrors>
            });
            return res;
        }

        switch (response.status) {
            case 201: {
                const res = new InternalStatus<Components.Schemas.RepositoryResponse, ErrorCode.OK>(
                    {
                        code: StatusCode.OK,
                        payload: response.data as Components.Schemas.RepositoryResponse
                    }
                );

                return res;
            }
            default: {
                const res = new InternalStatus<
                    Components.Schemas.RepositoryResponse,
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
})();
