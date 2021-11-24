import { ApiClient } from "./_base";
import type { ErrorMessageResponse, JobResponse, PaginatedJobResponse } from "./generatedcode/generated";
import InternalError, { ErrorCode, GenericErrors } from "./models/InternalComms/InternalError";
import InternalStatus, { StatusCode } from "./models/InternalComms/InternalStatus";
import ServerClient from "./ServerClient";
import configOptions from "./util/config";

export type listJobsErrors = GenericErrors;
export type getJobErrors = GenericErrors | ErrorCode.JOB_JOB_NOT_FOUND;
export type deleteJobErrors =
    | GenericErrors
    | ErrorCode.JOB_JOB_NOT_FOUND
    | ErrorCode.JOB_JOB_COMPLETE;

export type PaginatedTGSJobResponse = Omit<PaginatedJobResponse, "content"> & {
    content: TGSJobResponse[];
};
export type TGSJobResponse = JobResponse & {
    instanceid: number;
    canCancel?: boolean;
};

export default new (class JobsClient extends ApiClient {
    public async listActiveJobs(
        instanceid: number,
        { page = 1, pageSize = configOptions.itemsperpage.value as number }
    ): Promise<InternalStatus<PaginatedTGSJobResponse, listJobsErrors>> {
        await ServerClient.wait4Init();

        let response;
        try {
            response = await ServerClient.apiClient!.job.jobControllerRead({
                page: page,
                pageSize: pageSize
            },
            {
                headers: {
                    Instance: (instanceid as unknown as string)
                }
            });
        } catch (stat) {
            return new InternalStatus<PaginatedTGSJobResponse, listJobsErrors>({
                code: StatusCode.ERROR,
                error: stat as InternalError<GenericErrors>
            });
        }

        switch (response.status) {
            case 200: {
                const newContent = response.data.content!.map(job => {
                    return {
                        ...job,
                        instanceid: instanceid
                    };
                });

                return new InternalStatus<PaginatedTGSJobResponse, listJobsErrors>({
                    code: StatusCode.OK,
                    payload: {
                        ...(response.data),
                        content: newContent
                    }
                });
            }
            default: {
                return new InternalStatus<PaginatedTGSJobResponse, listJobsErrors>({
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

    public async getJob(
        instanceid: number,
        jobid: number
    ): Promise<InternalStatus<TGSJobResponse, getJobErrors>> {
        await ServerClient.wait4Init();

        let response;
        try {
            response = await ServerClient.apiClient!.job.jobControllerGetId(jobid,
                {
                    headers: {
                        Instance: (instanceid as unknown as string)
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
                const job = {
                    ...(response.data),
                    instanceid: instanceid
                };
                return new InternalStatus({
                    code: StatusCode.OK,
                    payload: job
                });
            }
            case 404: {
                return new InternalStatus({
                    code: StatusCode.ERROR,
                    error: new InternalError(ErrorCode.JOB_JOB_NOT_FOUND, {
                        errorMessage: response.data as ErrorMessageResponse
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

    public async deleteJob(
        instanceid: number,
        jobid: number
    ): Promise<InternalStatus<TGSJobResponse, deleteJobErrors>> {
        await ServerClient.wait4Init();

        let response;
        try {
            response = await ServerClient.apiClient!.job.jobControllerDelete(jobid,
                {
                    headers: {
                        Instance: (instanceid as unknown as string)
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
                const job = {
                    ...(response.data),
                    instanceid: instanceid
                };
                return new InternalStatus({
                    code: StatusCode.OK,
                    payload: job
                });
            }
            case 404: {
                return new InternalStatus({
                    code: StatusCode.ERROR,
                    error: new InternalError(ErrorCode.JOB_JOB_NOT_FOUND, {
                        errorMessage: response.data as ErrorMessageResponse
                    })
                });
            }
            case 410: {
                return new InternalStatus({
                    code: StatusCode.ERROR,
                    error: new InternalError(ErrorCode.JOB_JOB_COMPLETE, {
                        void: true
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

    public async listJobs(
        instanceid: number,
        { page = 1, pageSize = configOptions.itemsperpage.value as number }
    ): Promise<InternalStatus<PaginatedTGSJobResponse, GenericErrors>> {
        await ServerClient.wait4Init();

        let response;
        try {
            response = await ServerClient.apiClient!.job.jobControllerList({
                pageSize,
                page
            },
            {
                headers: {
                    Instance: (instanceid as unknown as string)
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
                const newContent = response.data.content!.map(job => {
                    return {
                        ...job,
                        instanceid: instanceid
                    };
                });

                return new InternalStatus<PaginatedTGSJobResponse, listJobsErrors>({
                    code: StatusCode.OK,
                    payload: {
                        ...response.data,
                        content: newContent
                    }
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
