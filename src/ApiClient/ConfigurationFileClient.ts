import { ApiClient } from "./_base";
import {
    ConfigurationControllerUpdatePayload,
    ConfigurationFileRequest,
    ConfigurationFileResponse,
    ErrorMessageResponse,
    PaginatedConfigurationFileResponse
} from "./generatedcode/generated";
import { DownloadedConfigFile } from "./models/DownloadedConfigFile";
import InternalError, { ErrorCode, GenericErrors } from "./models/InternalComms/InternalError";
import InternalStatus, { StatusCode } from "./models/InternalComms/InternalStatus";
import ServerClient from "./ServerClient";
import TransferClient, { DownloadErrors, UploadErrors } from "./TransferClient";
import configOptions from "./util/config";

export type ConfigErrors =
    | GenericErrors
    | ErrorCode.CONFIG_FILE_IO_ERROR
    | ErrorCode.CONFIG_FILE_NOT_FOUND;

export type ConfigDirectoryErrors = GenericErrors | ErrorCode.CONFIG_FILE_DIRECTORY_NOT_FOUND;

export default new (class ConfigurationFileClient extends ApiClient {
    public async addDirectory(
        instance: number,
        path: ConfigurationFileRequest
    ): Promise<InternalStatus<ConfigurationFileResponse | null, GenericErrors>> {
        await ServerClient.wait4Init();

        let response;
        try {
            response = await ServerClient.apiClient!.config.configurationControllerCreateDirectory(
                path,
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
            case 200:
            case 201: {
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

    public async writeConfigFile(
        instance: number,
        filePath: ConfigurationControllerUpdatePayload,
        file: ArrayBuffer
    ): Promise<InternalStatus<ConfigurationFileResponse | null, GenericErrors | UploadErrors>> {
        await ServerClient.wait4Init();

        let response;
        try {
            response = await ServerClient.apiClient!.config.configurationControllerUpdate(
                filePath,
                {
                    headers: { Instance: instance.toString() }
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
                    payload: null
                });
            }
            case 202: {
                const upload = await TransferClient.Upload(
                    (response.data as ConfigurationFileResponse).fileTicket,
                    file
                );
                if (upload.code === StatusCode.OK) {
                    return new InternalStatus({
                        code: StatusCode.OK,
                        payload: null
                    });
                }
                return new InternalStatus({ code: StatusCode.ERROR, error: upload.error });
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

    public async getConfigFile(
        instance: number,
        filePath: string
    ): Promise<InternalStatus<DownloadedConfigFile, ConfigErrors | DownloadErrors>> {
        await ServerClient.wait4Init();

        let response;
        try {
            response = await ServerClient.apiClient!.config.configurationControllerFile(filePath, {
                headers: { Instance: instance.toString() }
            });
        } catch (stat) {
            return new InternalStatus({
                code: StatusCode.ERROR,
                error: stat as InternalError<GenericErrors>
            });
        }

        switch (response.status) {
            case 200: {
                const contents = await TransferClient.Download(
                    (response.data as ConfigurationFileResponse).fileTicket
                );

                if (contents.code === StatusCode.OK) {
                    const temp: DownloadedConfigFile = Object.assign(
                        { content: contents.payload },
                        response.data as ConfigurationFileResponse
                    );
                    return new InternalStatus({
                        code: StatusCode.OK,
                        payload: temp
                    });
                }
                return new InternalStatus({ code: StatusCode.ERROR, error: contents.error });
            }
            case 410: {
                const errorMessage = response.data as ErrorMessageResponse;
                return new InternalStatus({
                    code: StatusCode.ERROR,
                    error: new InternalError(
                        ErrorCode.CONFIG_FILE_NOT_FOUND,
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

    public async getDirectory(
        instance: number,
        directoryPath: string,
        { page = 1, pageSize = configOptions.itemsperpage.value as number }
    ): Promise<InternalStatus<PaginatedConfigurationFileResponse, ConfigDirectoryErrors>> {
        await ServerClient.wait4Init();

        let response;
        try {
            response = await ServerClient.apiClient!.config.configurationControllerDirectory(
                {
                    directoryPath,
                    pageSize: pageSize,
                    page: page
                },
                { headers: { Instance: instance.toString() } }
            );
        } catch (stat) {
            return new InternalStatus({
                code: StatusCode.ERROR,
                error: stat as InternalError<ConfigDirectoryErrors>
            });
        }

        switch (response.status) {
            case 200: {
                return new InternalStatus({
                    code: StatusCode.OK,
                    payload: response.data as PaginatedConfigurationFileResponse
                });
            }

            case 410: {
                const errorMessage = response.data as ErrorMessageResponse;
                return new InternalStatus({
                    code: StatusCode.ERROR,
                    error: new InternalError(
                        ErrorCode.CONFIG_FILE_DIRECTORY_NOT_FOUND,
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

    public async getRootDirectory(
        instance: number,
        { page = 1, pageSize = configOptions.itemsperpage.value as number }
    ): Promise<InternalStatus<PaginatedConfigurationFileResponse, ConfigDirectoryErrors>> {
        await ServerClient.wait4Init();

        let response;
        try {
            response = await ServerClient.apiClient!.config.configurationControllerList(
                {
                    pageSize: pageSize,
                    page: page
                },
                { headers: { Instance: instance.toString() } }
            );
        } catch (stat) {
            return new InternalStatus({
                code: StatusCode.ERROR,
                error: stat as InternalError<ConfigDirectoryErrors>
            });
        }

        switch (response.status) {
            case 200: {
                return new InternalStatus({
                    code: StatusCode.OK,
                    payload: response.data as PaginatedConfigurationFileResponse
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

    public async deleteDirectory(
        instance: number,
        directory: ConfigurationFileRequest
    ): Promise<InternalStatus<ConfigurationFileResponse | null, GenericErrors>> {
        await ServerClient.wait4Init();

        let response;
        try {
            response = await ServerClient.apiClient!.config.configurationControllerDeleteDirectory(
                directory,
                { headers: { Instance: instance.toString() } }
            );
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
})();
