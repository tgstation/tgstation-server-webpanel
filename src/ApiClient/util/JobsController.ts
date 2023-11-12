import * as signalR from "@microsoft/signalr";
import { gte as SemVerGte, satisfies as SemverSatisfies } from "semver";
import { TypedEmitter } from "tiny-typed-emitter";

import { resolvePermissionSet } from "../../utils/misc";
import {
    AdministrationRights,
    ByondRights,
    ChatBotRights,
    ConfigurationRights,
    DreamDaemonRights,
    DreamMakerRights,
    ErrorCode as TGSErrorCode,
    InstanceManagerRights,
    InstancePermissionSetRights,
    InstanceResponse,
    JobResponse,
    RepositoryRights,
    RightsType
} from "../generatedcode/generated";
import InstanceClient from "../InstanceClient";
import InstancePermissionSetClient from "../InstancePermissionSetClient";
import JobsClient, { TGSJobResponse } from "../JobsClient";
import InternalError, { ErrorCode } from "../models/InternalComms/InternalError";
import { StatusCode } from "../models/InternalComms/InternalStatus";
import ServerClient from "../ServerClient";
import UserClient from "../UserClient";
import configOptions from "./config";
import LoginHooks from "./LoginHooks";

interface IEvents {
    jobsLoaded: () => unknown;
}

export default new (class JobsController extends TypedEmitter<IEvents> {
    private fastmodecount = 0;
    public set fastmode(cycles: number) {
        const doStuff = async () => {
            if (await this.jobsHubSupported()) {
                return;
            }

            console.log(`JobsController going in fastmode for ${cycles} cycles`);
            this.fastmodecount = cycles;
            await this.restartLoop();
        };
        void doStuff();
    }

    private currentLoop: Date = new Date(0);
    public accessibleInstances = new Map<number, InstanceResponse>();

    private enableJobProgressWorkaround?: boolean;

    public errors: InternalError[] = [];
    public nextRetry: Date | null;
    public jobs = new Map<number, TGSJobResponse>();
    public jobsByInstance = new Map<number, Map<number, TGSJobResponse>>();
    private jobCallback = new Map<number, Set<(job: TGSJobResponse) => unknown>>();
    private lastSeenJob = -1;

    private connection: signalR.HubConnection | null;

    public async reset(clearJobs: boolean): Promise<void> {
        console.log("JobsController resetting");
        if (clearJobs) {
            this.jobs = new Map<number, TGSJobResponse>();
            this.jobsByInstance = new Map<number, Map<number, TGSJobResponse>>();
        }

        try {
            await this.reloadAccessibleInstances();
        } catch (e) {
            this.errors.push(
                new InternalError(ErrorCode.APP_FAIL, { jsError: Error(e as string) })
            );
            return;
        }

        await this.restartLoop();
    }

    public constructor() {
        super();

        this.connection = null;
        this.nextRetry = null;
        this.loop = this.loop.bind(this);
        this.reset = this.reset.bind(this);
        this.cleanConnection = this.cleanConnection.bind(this);
        this.restartLoop = this.restartLoop.bind(this);
    }

    private async cleanConnection(): Promise<void> {
        if (!(await this.jobsHubSupported())) {
            return;
        }

        console.log("JobsController: cleanConnection");

        if (this.connection) {
            console.log("Stopping and removing active hub connection");
            await this.connection.stop();
            this.connection = null;
        }

        this.errors = [];
        this.nextRetry = null;
        this.jobs = new Map<number, TGSJobResponse>();
        this.jobsByInstance = new Map<number, Map<number, TGSJobResponse>>();
        this.emit("jobsLoaded");
    }

    public init() {
        window.clients["JobsController"] = this;

        //technically not a "cache" but we might as well reload it
        ServerClient.on("purgeCache", () => void this.reset(true));
        ServerClient.on("logout", () => void this.cleanConnection());

        InstanceClient.on("instanceChange", () => void this.reset(false));
        // eslint-disable-next-line @typescript-eslint/require-await
        LoginHooks.addHook(async () => {
            console.log("JobsController resetting due to login");
            await this.reset(true);
        });

        ServerClient.on("loadServerInfo", response => {
            if (response.code === StatusCode.OK) {
                //A bug in versions below 4.11.0 makes it so that /Job/List doesn't report back progress. If we are running on a higher version, theres no point in enabling the workaround
                this.enableJobProgressWorkaround = SemverSatisfies(
                    response.payload.version,
                    "<4.11.0"
                );
            }
        });
    }

    private async reloadAccessibleInstances(loop = false): Promise<void> {
        const allInstances: InstanceResponse[] = [];

        const instances1 = await InstanceClient.listInstances({ pageSize: 100 });
        if (instances1.code === StatusCode.ERROR) {
            this.errors.push(instances1.error);
            return;
        } else {
            allInstances.push(...instances1.payload.content);
        }
        for (let i = 2; i <= instances1.payload.totalPages; i++) {
            const instances2 = await InstanceClient.listInstances({ page: i, pageSize: 100 });
            if (instances2.code === StatusCode.ERROR) {
                this.errors.push(instances2.error);
                return;
            } else {
                allInstances.push(...instances2.payload.content);
            }
        }

        const updatedSet = new Map<number, InstanceResponse>();

        const work = allInstances
            .filter(instance => instance.online && instance.accessible)
            .map(instance => {
                return InstancePermissionSetClient.getCurrentInstancePermissionSet(
                    instance.id
                ).then(permissionSet => {
                    if (permissionSet.code === StatusCode.ERROR) {
                        //If its access denied, it means we have view all instances but we dont have access to the instance itself
                        if (permissionSet.error.code !== ErrorCode.HTTP_ACCESS_DENIED) {
                            this.errors.push(permissionSet.error);
                        }
                        return;
                    }
                    updatedSet.set(instance.id, instance);
                });
            });

        await Promise.all(work);

        this.accessibleInstances = updatedSet;

        if (loop) {
            window.setTimeout(
                () => void this.reloadAccessibleInstances(true),
                configOptions.instanceprobetimer.value as number
            );
        }
    }

    private async jobsHubSupported(): Promise<boolean> {
        if (this.connection) {
            return true;
        }

        const serverInfo = await ServerClient.getServerInfo();
        if (serverInfo.code === StatusCode.OK) {
            return SemVerGte(serverInfo.payload.apiVersion, "9.13.0");
        }

        console.warn("Failed to retrieve server info to determin jobs hub support!");

        return false;
    }

    public async restartLoop(): Promise<void> {
        if (!(await this.jobsHubSupported())) {
            //we use an actual date object here because it could help prevent really weird timing
            // issues as two different date objects cannot be equal
            // despite the date being
            const initDate = new Date(Date.now());
            this.currentLoop = initDate;
            window.setTimeout(() => {
                this.loop(initDate).catch(e =>
                    this.errors.push(new InternalError(ErrorCode.APP_FAIL, { jsError: Error(e) }))
                );
            }, 0);

            return;
        }

        if (this.connection) {
            console.log(
                `Restart loop called with an active connection. State is: ${this.connection.state}`
            );
            await this.connection.stop();
        }

        this.nextRetry = null;

        let apiPath = configOptions.apipath.value as string;
        if (!apiPath.endsWith("/")) {
            apiPath = apiPath + "/";
        }

        const localConnection = (this.connection = new signalR.HubConnectionBuilder()
            .withUrl(`${apiPath}hubs/jobs`, {
                accessTokenFactory: async () => {
                    const token = await ServerClient.wait4Token();
                    return token.bearer;
                },
                transport: signalR.HttpTransportType.ServerSentEvents,
                headers: ServerClient.defaultHeaders
            })
            .withAutomaticReconnect({
                nextRetryDelayInMilliseconds: (retryContext: signalR.RetryContext) => {
                    if (retryContext.previousRetryCount == 0) {
                        return 0;
                    }

                    const nextRetryMs = Math.min(2 ** retryContext.previousRetryCount, 30) * 1000;
                    const retryDate = new Date();
                    retryDate.setMilliseconds(retryDate.getMilliseconds() + nextRetryMs);
                    this.nextRetry = retryDate;
                    this.emit("jobsLoaded");
                    return nextRetryMs;
                }
            })
            .build());

        localConnection.on("ReceiveJobUpdate", (job: JobResponse) => {
            this.registerJob(job, job.instanceId);
            this.emit("jobsLoaded");
        });

        let justReconnected = true;
        let reconnectionTimeout: NodeJS.Timeout | null = null;
        localConnection.onreconnected(() => {
            this.nextRetry = null;
            justReconnected = true;
            this.emit("jobsLoaded");
            console.log("Jobs hub connection re-established, running refresh...");

            // at this point we need to manually load all the jobs we have registered in case they've completed in the hub and are no longer receiving updates
            const forcedRefresh = async () => {
                clearTimeout(reconnectionTimeout!);
                reconnectionTimeout = null;
                if (localConnection.state !== signalR.HubConnectionState.Connected) {
                    return;
                }

                justReconnected = false;

                this.errors = [];
                this.emit("jobsLoaded");
                await this.reloadAccessibleInstances(false);
                await this.loop((this.currentLoop = new Date()));
            };

            if (reconnectionTimeout) {
                clearTimeout(reconnectionTimeout);
            }

            reconnectionTimeout = setTimeout(() => void forcedRefresh(), 3000);
        });

        localConnection.onreconnecting(() => {
            if (justReconnected) {
                if (reconnectionTimeout) {
                    clearTimeout(reconnectionTimeout);
                    reconnectionTimeout = null;
                }

                const relog = async () => {
                    // we reconnected and then got disconnected? That's an auth issue
                    const result = await ServerClient.login();
                    if (result.code != StatusCode.OK) {
                        ServerClient.logout();
                    } else {
                        justReconnected = false;
                    }
                };

                void relog();
                return;
            }

            this.errors = [];
            this.errors.push(new InternalError(ErrorCode.BAD_HUB_CONNECTION, { void: true }));
            this.emit("jobsLoaded");
        });

        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        localConnection.start().catch(error => {
            this.errors = [];
            if (error instanceof Error) {
                this.errors.push(
                    new InternalError(ErrorCode.BAD_HUB_CONNECTION, { jsError: error })
                );
            } else {
                this.errors.push(new InternalError(ErrorCode.BAD_HUB_CONNECTION, { void: true }));
            }
            this.emit("jobsLoaded");
            this.connection = null;
        });
    }

    private _registerJob(job: TGSJobResponse, instanceid?: number): void;
    // noinspection JSUnusedLocalSymbols
    private _registerJob(job: JobResponse, instanceid: number): void;
    private _registerJob(_job: JobResponse | TGSJobResponse, instanceid?: number) {
        const job = _job as TGSJobResponse;
        if (this.jobs.has(job.id) && this.jobs.get(job.id)!.stoppedAt) {
            console.warn(
                `Receieved job update for ${job.id} after it completed! Incoming job was${
                    job.stoppedAt ? "" : " not"
                } completed.`
            );
            return;
        }

        if (instanceid) job.instanceId = instanceid;
        const instanceSet = this.jobsByInstance.get(job.instanceId) ?? new Map();
        this.jobsByInstance.set(job.instanceId, instanceSet);
        instanceSet.set(job.id, job);
        this.jobs.set(job.id, job);
    }

    public registerJob(job: TGSJobResponse, instanceid?: number): void;
    public registerJob(job: JobResponse, instanceid: number): void;
    public registerJob(_job: JobResponse | TGSJobResponse, instanceid?: number) {
        this._registerJob(_job, instanceid);

        const doStuff = async () => {
            if (!(await this.jobsHubSupported())) {
                console.log(
                    "Server does not support jobs hub, restarting loop due to job registration."
                );
                await this.restartLoop();
            }
        };

        void doStuff();
    }

    private async loop(loopid: Date) {
        //so loops get initialiazed with the current time, it keeps track of which loop to run with
        // that initialization date in currentLoop if the currentLoop isnt equal to the one provided
        // to the loop, it means that the loop was
        // replaced so we dont try to call for another one
        if (loopid !== this.currentLoop) {
            return;
        }

        //time to clear out errors
        this.errors = [];

        let totalActiveJobs = 0;
        const work: Promise<void>[] = [];

        //We can't update the value immediatly or instances will conflict with each other and prevent some jobs from fetching
        let tempLastSeenJob = this.lastSeenJob;
        for (const instanceid of this.accessibleInstances.keys()) {
            const processJobs = async (jobs: TGSJobResponse[]) => {
                for (const job of jobs) {
                    this._registerJob(job);
                    tempLastSeenJob = Math.max(tempLastSeenJob, job.id);
                }

                const remoteActive = jobs.map(job => job.id);
                const localActive = Array.from(this.jobs.values())
                    .filter(job => !job.stoppedAt)
                    .filter(job => job.instanceId === instanceid)
                    .map(job => job.id);
                const manualIds = localActive.filter(jobId => !remoteActive.includes(jobId));

                const instanceSet = this.jobsByInstance.get(instanceid) ?? new Map();
                this.jobsByInstance.set(instanceid, instanceSet);
                const work: Promise<void>[] = [];
                manualIds.forEach(jobId => {
                    work.push(
                        JobsClient.getJob(instanceid, jobId).then(job => {
                            if (job.code === StatusCode.ERROR) {
                                this.errors.push(job.error);
                                return;
                            }
                            instanceSet.set(job.payload.id, job.payload);
                            this.jobs.set(job.payload.id, job.payload);
                        })
                    );
                });
                await Promise.all(work);

                if (loopid !== this.currentLoop) return;

                totalActiveJobs += jobs.length;
            };

            const processError = (error: InternalError) => {
                if (
                    error.code === ErrorCode.HTTP_DATA_INEGRITY &&
                    error.originalErrorMessage?.errorCode === TGSErrorCode.InstanceOffline
                ) {
                    console.log(
                        `[JobsController] Clearing instance ${instanceid} as it is now offline`
                    );
                    this.accessibleInstances.delete(instanceid);
                    //Probably a good idea to reload the list at this point
                    this.reloadAccessibleInstances().catch(e => {
                        this.errors.push(
                            new InternalError(ErrorCode.APP_FAIL, { jsError: Error(e) })
                        );
                    });
                } else {
                    this.errors.push(error);
                }
            };

            const fetchJobs =
                this.lastSeenJob === -1 ? JobsClient.listActiveJobs : JobsClient.listJobs;
            //now since this is async, it still possible that a single fire gets done after the new loop started, theres no really much that can be done about it
            work.push(
                fetchJobs(instanceid, { page: 1, pageSize: 10 })
                    .then(async value => {
                        //this check is here because the request itself is async and could return after
                        // the loop is terminated, we dont want to contaminate the jobs of an instance
                        // with the jobs of another even if it is for a single fire and would eventually
                        // get fixed on its own after a few seconds
                        if (loopid !== this.currentLoop) return;

                        if (value.code === StatusCode.OK) {
                            let lastPayload = value.payload.content;
                            fetchLoop: for (let i = 2; i <= value.payload.totalPages; i++) {
                                for (const job of lastPayload) {
                                    //We reached the last page of usable content, break the loop
                                    if (job.id <= this.lastSeenJob) {
                                        break fetchLoop;
                                    }
                                }
                                const jobs2 = await fetchJobs(instanceid, {
                                    page: i,
                                    pageSize: 10
                                });
                                if (jobs2.code === StatusCode.ERROR) {
                                    processError(jobs2.error);
                                    return;
                                } else {
                                    value.payload.content.push(...jobs2.payload.content);
                                    lastPayload = value.payload.content;
                                }
                            }
                            if (loopid !== this.currentLoop) return;
                            await processJobs(
                                value.payload.content.filter(
                                    job => job.id > this.lastSeenJob || this.jobs.has(job.id)
                                )
                            );
                        } else {
                            processError(value.error);
                        }
                    })
                    .catch(reason => {
                        console.error(reason);
                    })
            );
        }

        await Promise.all(work);

        this.lastSeenJob = tempLastSeenJob;

        work.length = 0;
        for (const job of this.jobs.values()) {
            if (
                this.enableJobProgressWorkaround &&
                job.progress === undefined &&
                !job.stoppedAt &&
                this.accessibleInstances.has(job.instanceId)
            ) {
                work.push(
                    JobsClient.getJob(job.instanceId, job.id).then(progressedjob => {
                        if (loopid !== this.currentLoop) return;
                        if (progressedjob.code === StatusCode.OK) {
                            job.progress = progressedjob.payload.progress;
                        } else {
                            if (
                                progressedjob.error.code === ErrorCode.HTTP_DATA_INEGRITY &&
                                progressedjob.error.originalErrorMessage?.errorCode ===
                                    TGSErrorCode.InstanceOffline
                            ) {
                                console.log(
                                    `[JobsController] Clearing instance ${job.instanceId} as it is now offline`
                                );
                                this.accessibleInstances.delete(job.instanceId);
                                //Probably a good idea to reload the list at this point
                                this.reloadAccessibleInstances().catch(e => {
                                    this.errors.push(
                                        new InternalError(ErrorCode.APP_FAIL, { jsError: Error(e) })
                                    );
                                });
                            } else {
                                this.errors.push(progressedjob.error);
                            }
                        }
                    })
                );
            }

            work.push(
                this.canCancel(job, this.errors).then(canCancel => {
                    if (loopid !== this.currentLoop) return;
                    job.canCancel = canCancel;
                })
            );
        }

        //populate fields on jobs
        await Promise.all(work);
        if (loopid !== this.currentLoop) return;

        this.emit("jobsLoaded");

        for (const job of this.jobs.values()) {
            if (!job.stoppedAt) continue;
            const callbacks = this.jobCallback.get(job.id);
            if (!callbacks) continue;
            for (const callback of callbacks) {
                callback(job);
            }
            this.jobCallback.delete(job.id);
        }

        if (this.fastmodecount && loopid === this.currentLoop) {
            window.setTimeout(() => {
                this.loop(loopid).catch(e =>
                    this.errors.push(new InternalError(ErrorCode.APP_FAIL, { jsError: Error(e) }))
                );
            }, 800);
            this.fastmodecount--;
            console.log(`JobsController will remain in fastmode for ${this.fastmodecount} cycles`);
        } else {
            window.setTimeout(() => {
                this.loop(loopid).catch(e =>
                    this.errors.push(new InternalError(ErrorCode.APP_FAIL, { jsError: Error(e) }))
                );
            }, (totalActiveJobs ? (configOptions.jobpollactive.value as number) : (configOptions.jobpollinactive.value as number)) * 1000);
        }
    }

    private async canCancel(
        job: Readonly<TGSJobResponse>,
        errors: InternalError<ErrorCode>[]
    ): Promise<boolean> {
        //we dont need to reevalutate stuff that we already know
        if (job.canCancel !== undefined) return job.canCancel;

        if (job.cancelRightsType === undefined) {
            return true;
        }

        switch (job.cancelRightsType as RightsType) {
            case RightsType.Administration: {
                const userInfo = await UserClient.getCurrentUser();
                if (userInfo.code === StatusCode.OK) {
                    const required = job.cancelRight as AdministrationRights;
                    return !!(
                        resolvePermissionSet(userInfo.payload).administrationRights & required
                    );
                } else {
                    errors.push(userInfo.error);
                    return false;
                }
            }
            case RightsType.InstanceManager: {
                const userInfo = await UserClient.getCurrentUser();
                if (userInfo.code === StatusCode.OK) {
                    const required = job.cancelRight as InstanceManagerRights;
                    return !!(
                        resolvePermissionSet(userInfo.payload).instanceManagerRights & required
                    );
                } else {
                    errors.push(userInfo.error);
                    return false;
                }
            }
            case RightsType.Byond: {
                const InstancePermissionSet = await InstancePermissionSetClient.getCurrentInstancePermissionSet(
                    job.instanceId
                );
                if (InstancePermissionSet.code === StatusCode.OK) {
                    const required = job.cancelRight as ByondRights;
                    return !!(InstancePermissionSet.payload.byondRights & required);
                } else {
                    errors.push(InstancePermissionSet.error);
                    return false;
                }
            }
            case RightsType.ChatBots: {
                const InstancePermissionSet = await InstancePermissionSetClient.getCurrentInstancePermissionSet(
                    job.instanceId
                );
                if (InstancePermissionSet.code === StatusCode.OK) {
                    const required = job.cancelRight as ChatBotRights;
                    return !!(InstancePermissionSet.payload.chatBotRights & required);
                } else {
                    errors.push(InstancePermissionSet.error);
                    return false;
                }
            }
            case RightsType.Configuration: {
                const InstancePermissionSet = await InstancePermissionSetClient.getCurrentInstancePermissionSet(
                    job.instanceId
                );
                if (InstancePermissionSet.code === StatusCode.OK) {
                    const required = job.cancelRight as ConfigurationRights;
                    return !!(InstancePermissionSet.payload.configurationRights & required);
                } else {
                    errors.push(InstancePermissionSet.error);
                    return false;
                }
            }
            case RightsType.DreamDaemon: {
                const InstancePermissionSet = await InstancePermissionSetClient.getCurrentInstancePermissionSet(
                    job.instanceId
                );
                if (InstancePermissionSet.code === StatusCode.OK) {
                    const required = job.cancelRight as DreamDaemonRights;
                    return !!(InstancePermissionSet.payload.dreamDaemonRights & required);
                } else {
                    errors.push(InstancePermissionSet.error);
                    return false;
                }
            }
            case RightsType.DreamMaker: {
                const InstancePermissionSet = await InstancePermissionSetClient.getCurrentInstancePermissionSet(
                    job.instanceId
                );
                if (InstancePermissionSet.code === StatusCode.OK) {
                    const required = job.cancelRight as DreamMakerRights;
                    return !!(InstancePermissionSet.payload.dreamMakerRights & required);
                } else {
                    errors.push(InstancePermissionSet.error);
                    return false;
                }
            }
            case RightsType.InstancePermissionSet: {
                const InstancePermissionSet = await InstancePermissionSetClient.getCurrentInstancePermissionSet(
                    job.instanceId
                );
                if (InstancePermissionSet.code === StatusCode.OK) {
                    const required = job.cancelRight as InstancePermissionSetRights;
                    return !!(InstancePermissionSet.payload.instancePermissionSetRights & required);
                } else {
                    errors.push(InstancePermissionSet.error);
                    return false;
                }
            }
            case RightsType.Repository: {
                const InstancePermissionSet = await InstancePermissionSetClient.getCurrentInstancePermissionSet(
                    job.instanceId
                );
                if (InstancePermissionSet.code === StatusCode.OK) {
                    const required = job.cancelRight as RepositoryRights;
                    return !!(InstancePermissionSet.payload.repositoryRights & required);
                } else {
                    errors.push(InstancePermissionSet.error);
                    return false;
                }
            }
        }
    }

    public async cancelJob(
        jobid: number,
        onError: (error: InternalError<ErrorCode>) => void
    ): Promise<boolean> {
        const job = this.jobs.get(jobid);

        //no we cant cancel jobs we arent aware of yet
        if (!job) return false;

        const deleteInfo = await JobsClient.deleteJob(job.instanceId, jobid);
        if (deleteInfo.code === StatusCode.OK) {
            return true;
        } else {
            onError(deleteInfo.error);
            return false;
        }
    }

    public clearJob(jobid: number, noEmit = false): boolean {
        const job = this.jobs.get(jobid);

        //no we cant cancel jobs we arent aware of yet
        if (!job) return false;

        this.jobsByInstance.get(job.instanceId)?.delete(jobid);
        this.jobs.delete(jobid);
        if (!noEmit) {
            this.emit("jobsLoaded");
        }
        return true;
    }

    public registerCallback(jobid: number, callback: (job: TGSJobResponse) => unknown): void {
        const set = this.jobCallback.get(jobid) ?? new Set();
        set.add(callback);
        this.jobCallback.set(jobid, set);
    }
})();
