import { ApiClient } from "./_base";
import type {
    AdministrationResponse,
    ErrorMessageResponse,
    LogFileResponse,
    PaginatedLogFileResponse
} from "./generatedcode/generated";
import { DownloadedLog } from "./models/DownloadedLog";
import InternalError, { ErrorCode, GenericErrors } from "./models/InternalComms/InternalError";
import InternalStatus, { StatusCode } from "./models/InternalComms/InternalStatus";
import ServerClient from "./ServerClient";
import TransferClient, { DownloadErrors } from "./TransferClient";
import configOptions from "./util/config";

interface IEvents {
    loadAdminInfo: (user: InternalStatus<AdministrationResponse, AdminInfoErrors>) => void;
}

export type AdminInfoErrors =
    | GenericErrors
    | ErrorCode.ADMIN_GITHUB_RATE
    | ErrorCode.ADMIN_GITHUB_ERROR;

export type RestartErrors = GenericErrors | ErrorCode.ADMIN_WATCHDOG_UNAVAIL;

export type UpdateErrors =
    | GenericErrors
    | ErrorCode.ADMIN_WATCHDOG_UNAVAIL
    | ErrorCode.ADMIN_VERSION_NOT_FOUND
    | ErrorCode.ADMIN_GITHUB_RATE
    | ErrorCode.ADMIN_GITHUB_ERROR;

export type LogsErrors = GenericErrors | ErrorCode.ADMIN_LOGS_IO_ERROR;

export type LogErrors = GenericErrors | ErrorCode.ADMIN_LOGS_IO_ERROR;

export default new (class AdminClient extends ApiClient<IEvents> {
    private _cachedAdminInfo?: InternalStatus<AdministrationResponse, ErrorCode.OK>;
    public get cachedAdminInfo() {
        return this._cachedAdminInfo;
    }
    private loadingAdminInfo = false;

    public constructor() {
        super();
        ServerClient.on("purgeCache", () => {
            this._cachedAdminInfo = undefined;
        });
    }

    public async getAdminInfo(): Promise<InternalStatus<AdministrationResponse, AdminInfoErrors>> {
        await ServerClient.wait4Init();
        if (this._cachedAdminInfo) {
            return this._cachedAdminInfo;
        }

        if (this.loadingAdminInfo) {
            return await new Promise(resolve => {
                const resolver = (
                    user: InternalStatus<AdministrationResponse, AdminInfoErrors>
                ) => {
                    resolve(user);
                    this.removeListener("loadAdminInfo", resolver);
                };
                this.on("loadAdminInfo", resolver);
            });
        }

        this.loadingAdminInfo = true;

        let response;
        try {
            response = await ServerClient.apiClient!.administration.administrationControllerRead();
        } catch (stat) {
            const res = new InternalStatus<AdministrationResponse, AdminInfoErrors>({
                code: StatusCode.ERROR,
                error: stat as InternalError<AdminInfoErrors>
            });
            this.emit("loadAdminInfo", res);
            this.loadingAdminInfo = false;
            return res;
        }

        switch (response.status) {
            case 200: {
                const thing = new InternalStatus<AdministrationResponse, ErrorCode.OK>({
                    code: StatusCode.OK,
                    payload: response.data as AdministrationResponse
                });

                this._cachedAdminInfo = thing;
                this.emit("loadAdminInfo", thing);
                this.loadingAdminInfo = false;
                return thing;
            }
            case 424: {
                const errorMessage = response.data as ErrorMessageResponse;
                const thing = new InternalStatus<
                    AdministrationResponse,
                    ErrorCode.ADMIN_GITHUB_RATE
                >({
                    code: StatusCode.ERROR,
                    error: new InternalError(
                        ErrorCode.ADMIN_GITHUB_RATE,
                        { errorMessage },
                        response
                    )
                });
                this.emit("loadAdminInfo", thing);
                this.loadingAdminInfo = false;
                return thing;
            }
            case 429: {
                const errorMessage = response.data as ErrorMessageResponse;
                const thing = new InternalStatus<
                    AdministrationResponse,
                    ErrorCode.ADMIN_GITHUB_ERROR
                >({
                    code: StatusCode.ERROR,
                    error: new InternalError(
                        ErrorCode.ADMIN_GITHUB_ERROR,
                        { errorMessage },
                        response
                    )
                });
                this.emit("loadAdminInfo", thing);
                this.loadingAdminInfo = false;
                return thing;
            }
            default: {
                const res = new InternalStatus<
                    AdministrationResponse,
                    ErrorCode.UNHANDLED_RESPONSE
                >({
                    code: StatusCode.ERROR,
                    error: new InternalError(
                        ErrorCode.UNHANDLED_RESPONSE,
                        { axiosResponse: response },
                        response
                    )
                });
                this.emit("loadAdminInfo", res);
                this.loadingAdminInfo = false;
                return res;
            }
        }
    }

    public async restartServer(): Promise<InternalStatus<null, RestartErrors>> {
        await ServerClient.wait4Init();

        let response;
        try {
            response =
                await ServerClient.apiClient!.administration.administrationControllerDelete();
        } catch (stat) {
            return new InternalStatus({
                code: StatusCode.ERROR,
                error: stat as InternalError<RestartErrors>
            });
        }

        switch (response.status) {
            case 204: {
                return new InternalStatus({
                    code: StatusCode.OK,
                    payload: null
                });
            }
            case 422: {
                const errorMessage = response.data as ErrorMessageResponse;
                return new InternalStatus({
                    code: StatusCode.ERROR,
                    error: new InternalError(
                        ErrorCode.ADMIN_WATCHDOG_UNAVAIL,
                        { errorMessage },
                        response
                    )
                });
            }
            default: {
                return new InternalStatus<null, ErrorCode.UNHANDLED_RESPONSE>({
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

    public async updateServer(newVersion: string): Promise<InternalStatus<null, UpdateErrors>> {
        await ServerClient.wait4Init();

        let response;
        try {
            response = await ServerClient.apiClient!.administration.administrationControllerUpdate({
                newVersion
            });
        } catch (stat) {
            return new InternalStatus({
                code: StatusCode.ERROR,
                error: stat as InternalError<UpdateErrors>
            });
        }

        switch (response.status) {
            case 202: {
                return new InternalStatus({
                    code: StatusCode.OK,
                    payload: null
                });
            }
            case 410: {
                const errorMessage = response.data as ErrorMessageResponse;
                return new InternalStatus({
                    code: StatusCode.ERROR,
                    error: new InternalError(
                        ErrorCode.ADMIN_VERSION_NOT_FOUND,
                        { errorMessage },
                        response
                    )
                });
            }
            case 422: {
                const errorMessage = response.data as ErrorMessageResponse;
                return new InternalStatus({
                    code: StatusCode.ERROR,
                    error: new InternalError(
                        ErrorCode.ADMIN_WATCHDOG_UNAVAIL,
                        { errorMessage },
                        response
                    )
                });
            }
            case 424: {
                const errorMessage = response.data as ErrorMessageResponse;
                return new InternalStatus<null, ErrorCode.ADMIN_GITHUB_RATE>({
                    code: StatusCode.ERROR,
                    error: new InternalError(
                        ErrorCode.ADMIN_GITHUB_RATE,
                        { errorMessage },
                        response
                    )
                });
            }
            case 429: {
                const errorMessage = response.data as ErrorMessageResponse;
                return new InternalStatus<null, ErrorCode.ADMIN_GITHUB_ERROR>({
                    code: StatusCode.ERROR,
                    error: new InternalError(
                        ErrorCode.ADMIN_GITHUB_ERROR,
                        { errorMessage },
                        response
                    )
                });
            }
            default: {
                return new InternalStatus<null, ErrorCode.UNHANDLED_RESPONSE>({
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

    public async getLogs({
        page = 1,
        pageSize = configOptions.itemsperpage.value as number
    }): Promise<InternalStatus<PaginatedLogFileResponse, LogsErrors>> {
        await ServerClient.wait4Init();

        let response;
        try {
            response =
                await ServerClient.apiClient!.administration.administrationControllerListLogs({
                    pageSize: pageSize,
                    page: page
                });
        } catch (stat) {
            return new InternalStatus({
                code: StatusCode.ERROR,
                error: stat as InternalError<LogsErrors>
            });
        }

        switch (response.status) {
            case 200: {
                return new InternalStatus({
                    code: StatusCode.OK,
                    payload: response.data as PaginatedLogFileResponse
                });
            }
            case 409: {
                const errorMessage = response.data as ErrorMessageResponse;
                return new InternalStatus({
                    code: StatusCode.ERROR,
                    error: new InternalError(
                        ErrorCode.ADMIN_LOGS_IO_ERROR,
                        { errorMessage },
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

    public async getLog(
        logName: string
    ): Promise<InternalStatus<DownloadedLog, LogErrors | DownloadErrors>> {
        await ServerClient.wait4Init();

        let response;
        try {
            response = await ServerClient.apiClient!.administration.administrationControllerGetLog(
                logName
            );
        } catch (stat) {
            return new InternalStatus({
                code: StatusCode.ERROR,
                error: stat as InternalError<GenericErrors>
            });
        }
        switch (response.status) {
            case 200: {
                const contents = await TransferClient.Download(
                    (response.data as LogFileResponse).fileTicket
                );
                if (contents.code === StatusCode.OK) {
                    //Object.assign() is a funky function but all it does is copy everything from the second object to the first object
                    const temp: DownloadedLog = Object.assign(
                        { content: contents.payload },
                        response.data as LogFileResponse
                    );
                    return new InternalStatus({
                        code: StatusCode.OK,
                        payload: temp
                    });
                } else {
                    return new InternalStatus({
                        code: StatusCode.ERROR,
                        error: contents.error
                    });
                }
            }
            case 409: {
                const errorMessage = response.data as ErrorMessageResponse;
                return new InternalStatus({
                    code: StatusCode.ERROR,
                    error: new InternalError(
                        ErrorCode.ADMIN_LOGS_IO_ERROR,
                        { errorMessage },
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
})();
