import JobsClient, { listJobsErrors } from "../JobsClient";
import InternalError from "../models/InternalComms/InternalError";
import InternalStatus, { StatusCode } from "../models/InternalComms/InternalStatus";
import configOptions from "./config";
import ServerClient from "../ServerClient";
import { Components } from "../generatedcode/_generated";
import { TypedEmitter } from "tiny-typed-emitter";

interface IEvents {
    jobsLoaded: (jobs: InternalStatus<Components.Schemas.Job[], listJobsErrors>) => unknown;
}

export default new (class JobsController extends TypedEmitter<IEvents> {
    private _instance: number | undefined;
    public set instance(id: number) {
        this._instance = id;
        this.restartLoop();
    }

    public lasterror: InternalError<listJobsErrors> | undefined;
    private currentLoop: Date = new Date(0);

    public constructor() {
        super();

        this.loop = this.loop.bind(this);

        //technically not a "cache" but we might as well reload it
        ServerClient.on("purgeCache", () => {
            this.restartLoop();
        });
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

        //now since this is async, it still possible that a single fire gets done after the new loop started, theres no really much that can be done about it
        JobsClient.listJobs(this._instance)
            .then(value => {
                //this check is here because the request itself is async and could return after
                // the loop is terminated, we dont want to contaminate the jobs of an instance
                // with the jobs of another even if it is for a single fire and would eventually
                // get fixed on its own after a few seconds
                if (loopid !== this.currentLoop) return;

                this.emit("jobsLoaded", value);

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
})();
