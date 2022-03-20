import { ApiClient } from "./_base";
import {
    CompileJobResponse,
    DreamMakerRequest,
    DreamMakerResponse,
    ErrorMessageResponse,
    JobResponse,
    PaginatedCompileJobResponse
} from "./generatedcode/generated";
import InternalError, { ErrorCode, GenericErrors } from "./models/InternalComms/InternalError";
import InternalStatus, { StatusCode } from "./models/InternalComms/InternalStatus";
import ServerClient from "./ServerClient";
import configOptions from "./util/config";

type getDeployInfoErrors = GenericErrors;
type startCompileErrors = GenericErrors;
type updateDeployInfoErrors = GenericErrors | ErrorCode.NO_DB_ENTITY;
type listCompileJobsErrors = GenericErrors;
type getCompileJobErrors = GenericErrors | ErrorCode.COMPILE_JOB_NOT_FOUND;

export default new (class DreamDaemonClient extends ApiClient {
    public async getDeployInfo(
        instance: number
    ): Promise<InternalStatus<DreamMakerResponse, getDeployInfoErrors>> {
        await ServerClient.wait4Init();

        let response;
        try {
            response = await ServerClient.apiClient!.dreamMaker.dreamMakerControllerRead({
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
                    payload: response.data as DreamMakerResponse
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

    public async startCompile(
        instance: number
    ): Promise<InternalStatus<JobResponse, startCompileErrors>> {
        await ServerClient.wait4Init();

        let response;
        try {
            response = await ServerClient.apiClient!.dreamMaker.dreamMakerControllerCreate({
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

    public async updateDeployInfo(
        instance: number,
        settings: DreamMakerRequest
    ): Promise<InternalStatus<DreamMakerResponse | null, updateDeployInfoErrors>> {
        await ServerClient.wait4Init();

        let response;
        try {
            response = await ServerClient.apiClient!.dreamMaker.dreamMakerControllerUpdate(
                settings,
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
                    payload: response.data as DreamMakerResponse
                });
            }
            case 204: {
                return new InternalStatus({
                    code: StatusCode.OK,
                    payload: null
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

    public async listCompileJobs(
        instance: number,
        { page = 1, pageSize = configOptions.itemsperpage.value as number }
    ): Promise<InternalStatus<PaginatedCompileJobResponse, listCompileJobsErrors>> {
        await ServerClient.wait4Init();

        let response;
        try {
            response = await ServerClient.apiClient!.dreamMaker.dreamMakerControllerList(
                { page, pageSize },
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
                    payload: response.data as PaginatedCompileJobResponse
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

    public async getCompileJob(
        instance: number,
        compileJob: number
    ): Promise<InternalStatus<CompileJobResponse, getCompileJobErrors>> {
        await ServerClient.wait4Init();

        let response;
        try {
            response = await ServerClient.apiClient!.dreamMaker.dreamMakerControllerGetId(
                compileJob,
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
                    payload: response.data as CompileJobResponse
                });
            }
            case 404: {
                return new InternalStatus({
                    code: StatusCode.ERROR,
                    error: new InternalError(
                        ErrorCode.COMPILE_JOB_NOT_FOUND,
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
})();
