import { DreamDaemonResponse, ErrorMessageResponse, JobResponse } from "./generatedcode/schemas";
import InternalError, { ErrorCode, GenericErrors } from "./models/InternalComms/InternalError";
import InternalStatus, { StatusCode } from "./models/InternalComms/InternalStatus";
import ServerClient from "./ServerClient";

export type getWatchdogStatusErrors = GenericErrors | ErrorCode.WATCHDOG_NO_DB_ENTITY;
export type updateWatchdogStatusErrors = GenericErrors | ErrorCode.WATCHDOG_NO_DB_ENTITY;
export default new (class DreamDaemonClient {
    public async getWatchdogStatus(
        instance: number
    ): Promise<InternalStatus<DreamDaemonResponse, getWatchdogStatusErrors>> {
        await ServerClient.wait4Init();

        let response;
        try {
            response = await ServerClient.apiClient!.DreamDaemonController_Read({
                Instance: instance
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
                        ErrorCode.WATCHDOG_NO_DB_ENTITY,
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
            response = await ServerClient.apiClient!.DreamDaemonController_Update(
                {
                    Instance: instance
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
                    payload: response.data as DreamDaemonResponse
                });
            }
            case 410: {
                return new InternalStatus({
                    code: StatusCode.ERROR,
                    error: new InternalError(
                        ErrorCode.WATCHDOG_NO_DB_ENTITY,
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
            response = await ServerClient.apiClient!.DreamDaemonController_Create({
                Instance: instance
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
            response = await ServerClient.apiClient!.DreamDaemonController_Delete({
                Instance: instance
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
            response = await ServerClient.apiClient!.DreamDaemonController_Restart({
                Instance: instance
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
            response = await ServerClient.apiClient!.DreamDaemonController_CreateDump({
                Instance: instance
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
