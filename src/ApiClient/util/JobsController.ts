import JobsClient, { getJobErrors, listJobsErrors } from "../JobsClient";
import InternalStatus, { StatusCode } from "../models/InternalComms/InternalStatus";
import configOptions from "./config";
import ServerClient from "../ServerClient";
import { Components } from "../generatedcode/_generated";
import { TypedEmitter } from "tiny-typed-emitter";
import InternalError from "../models/InternalComms/InternalError";

interface IEvents {
    jobsLoaded: () => unknown;
}

export default new (class JobsController extends TypedEmitter<IEvents> {
    private _instance: number | undefined;
    public set instance(id: number) {
        this._instance = id;
        this.reset();
    }

    private currentLoop: Date = new Date(0);

    public errors: InternalError<getJobErrors | listJobsErrors>[] = [];
    public jobs: Map<number, Components.Schemas.Job> = new Map<number, Components.Schemas.Job>();

    private reset() {
        this.jobs = new Map<number, Components.Schemas.Job>();

        //TODO: debug
        this.jobs.set(22, {
            description: "Doing a normal boring task like any other",
            id: 22,
            startedBy: {
                id: 1,
                instanceManagerRights: 0,
                administrationRights: 0,
                name: "UwU Girl"
            },
            progress: 15,
            startedAt: "2020-09-11"
        });
        this.restartLoop();
    }

    public constructor() {
        super();

        this.loop = this.loop.bind(this);
        this.reset = this.reset.bind(this);

        //technically not a "cache" but we might as well reload it
        ServerClient.on("purgeCache", this.reset);
    }

    public restartLoop() {
        //we use an actual date object here because it could help prevent really weird timing
        // issues as two different date objects cannot be equal
        // despite the date being
        const initDate = new Date(Date.now());
        this.currentLoop = initDate;
        this.loop(initDate);
    }

    private loop(loopid: Date) {
        //if we dont got an instance to check, dont check
        // normally we should have an instance id, but this is in case we dont
        if (this._instance === undefined) {
            return;
        }

        //so loops get initialiazed with the current time, it keeps track of which loop to run with
        // that initialization date in currentLoop if the currentLoop isnt equal to the one provided
        // to the loop, it means that the loop was
        // replaced so we dont try to call for another one
        if (loopid !== this.currentLoop) {
            return;
        }

        //time to clear out errors
        this.errors = [];

        //now since this is async, it still possible that a single fire gets done after the new loop started, theres no really much that can be done about it
        JobsClient.listJobs(this._instance)
            .then(async value => {
                //this check is here because the request itself is async and could return after
                // the loop is terminated, we dont want to contaminate the jobs of an instance
                // with the jobs of another even if it is for a single fire and would eventually
                // get fixed on its own after a few seconds
                if (loopid !== this.currentLoop) return;

                value.payload = [
                    {
                        description: "Doing a normal boring task like any other",
                        id: 17,
                        startedBy: {
                            id: 1,
                            instanceManagerRights: 0,
                            administrationRights: 0,
                            name: "UwU Boy"
                        },
                        progress: 34,
                        startedAt: "2020-09-11"
                    },
                    {
                        description:
                            "Doing a normal boring task like any other with some more text poggers",
                        id: 18,
                        startedBy: {
                            id: 1,
                            instanceManagerRights: 0,
                            administrationRights: 0,
                            name: "UwU Boy"
                        },
                        cancelled: true,
                        startedAt: "2020-09-11"
                    },
                    {
                        description:
                            "Doing a normal boring task like any other with some more text poggers",
                        id: 19,
                        startedBy: {
                            id: 1,
                            instanceManagerRights: 0,
                            administrationRights: 0,
                            name: "UwU Boy"
                        },
                        progress: 69,
                        startedAt: "2020-09-11",
                        stoppedAt: "2020-09-12"
                    },
                    {
                        description:
                            "Doing a normal boring task like any other with some more text poggers",
                        id: 21,
                        startedBy: {
                            id: 1,
                            instanceManagerRights: 0,
                            administrationRights: 0,
                            name: "UwU Boy"
                        },
                        progress: 34,
                        startedAt: "2020-09-11",
                        exceptionDetails: "Grrrr"
                    }
                ];

                if (value.code === StatusCode.OK) {
                    for (const job of value.payload!) {
                        this.jobs.set(job.id, job);
                    }

                    //we check all jobs we have locally against the active jobs we got in the reply so
                    // we can query jobs which we didnt get informed about manually
                    const localids = Array.from(this.jobs, ([, job]) => job.id);
                    const remoteids = value.payload!.map(job => job.id);

                    const manualids = localids.filter(x => !remoteids.includes(x));
                    console.log("Manually querying jobs:", manualids);

                    const work: Promise<void>[] = [];
                    for (const id of manualids) {
                        work.push(
                            JobsClient.getJob(this._instance!, id).then(status => {
                                if (status.code === StatusCode.OK) {
                                    this.jobs.set(id, status.payload!);
                                } else {
                                    this.errors.push(status.error!);
                                }
                            })
                        );
                    }
                    await Promise.all(work);
                } else {
                    this.errors.push(value.error!);
                }

                this.emit("jobsLoaded");

                if (value.code === StatusCode.OK) {
                    window.setTimeout(
                        () => this.loop(loopid),
                        (value.payload!.length
                            ? (configOptions.jobpollactive.value as number)
                            : (configOptions.jobpollinactive.value as number)) * 1000
                    );
                } else {
                    window.setTimeout(
                        () => this.loop(loopid),
                        configOptions.jobpollactive.value as number
                    );
                }
            })
            .catch(reason => {
                console.error(reason);
            });
    }

    //TODO: remove
    // eslint-disable-next-line @typescript-eslint/require-await
    public async cancelOrClear(jobid: number) {
        const job = this.jobs.get(jobid);

        //no we cant cancel jobs we arent aware of yet
        if (!job) return;

        //just clear out the job
        if (job.exceptionDetails || job.cancelled || job.stoppedAt) {
            this.jobs.delete(jobid);
            this.emit("jobsLoaded");
        }
    }
})();
