import { ApiClient } from "./_base";
import type {
    DreamDaemonResponse,
    ErrorMessageResponse,
    JobResponse
} from "./generatedcode/generated";
import InternalError, { ErrorCode, GenericErrors } from "./models/InternalComms/InternalError";
import InternalStatus, { StatusCode } from "./models/InternalComms/InternalStatus";
import ServerClient from "./ServerClient";

export type getWatchdogStatusErrors = GenericErrors | ErrorCode.NO_DB_ENTITY;
export type updateWatchdogStatusErrors = GenericErrors | ErrorCode.NO_DB_ENTITY;
export default new (class DreamDaemonClient extends ApiClient {
    public async getWatchdogStatus(
        instance: number
    ): Promise<InternalStatus<DreamDaemonResponse, getWatchdogStatusErrors>> {
        await ServerClient.wait4Init();

        let response;
        try {
            response = await ServerClient.apiClient!.dreamDaemon.dreamDaemonControllerRead({
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
                    payload: response.data as DreamDaemonResponse
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

    public async updateWatchdogStatus(
        instance: number,
        newSettings: DreamDaemonResponse
    ): Promise<InternalStatus<DreamDaemonResponse, updateWatchdogStatusErrors>> {
        await ServerClient.wait4Init();

        let response;
        try {
            response = await ServerClient.apiClient!.dreamDaemon.dreamDaemonControllerUpdate(
                newSettings,
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
                    payload: response.data as DreamDaemonResponse
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

    public async startWatchdog(
        instance: number
    ): Promise<InternalStatus<JobResponse, GenericErrors>> {
        await ServerClient.wait4Init();

        let response;
        try {
            response = await ServerClient.apiClient!.dreamDaemon.dreamDaemonControllerCreate({
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
            case 202: {
                return new InternalStatus({
                    code: StatusCode.OK,
                    payload: response.data as JobResponse
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

    public async stopWatchdog(instance: number): Promise<InternalStatus<null, GenericErrors>> {
        await ServerClient.wait4Init();

        let response;
        try {
            response = await ServerClient.apiClient!.dreamDaemon.dreamDaemonControllerDelete({
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
            case 204: {
                return new InternalStatus({
                    code: StatusCode.OK,
                    payload: null
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

    public async restartWatchdog(
        instance: number
    ): Promise<InternalStatus<JobResponse, GenericErrors>> {
        await ServerClient.wait4Init();

        let response;
        try {
            response = await ServerClient.apiClient!.dreamDaemon.dreamDaemonControllerRestart({
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
            case 202: {
                return new InternalStatus({
                    code: StatusCode.OK,
                    payload: response.data as JobResponse
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

    public async dumpWatchdog(
        instance: number
    ): Promise<InternalStatus<JobResponse, GenericErrors>> {
        await ServerClient.wait4Init();

        let response;
        try {
            response = await ServerClient.apiClient!.dreamDaemon.dreamDaemonControllerCreateDump({
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
            case 202: {
                return new InternalStatus({
                    code: StatusCode.OK,
                    payload: response.data as JobResponse
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
