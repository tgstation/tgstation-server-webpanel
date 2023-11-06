import React, { useEffect, useState } from "react";

import JobsClient, { TGSJobResponse } from "../../../../ApiClient/JobsClient";
import InternalError, { ErrorCode } from "../../../../ApiClient/models/InternalComms/InternalError";
import { StatusCode } from "../../../../ApiClient/models/InternalComms/InternalStatus";
import JobsController from "../../../../ApiClient/util/JobsController";
import { InstanceEditContext } from "../../../../contexts/InstanceEditContext";
import { RouteData } from "../../../../utils/routes";
import ErrorAlert from "../../../utils/ErrorAlert";
import JobCard from "../../../utils/JobCard";
import { DebugJsonViewer } from "../../../utils/JsonViewer";
import Loading from "../../../utils/Loading";
import PageHelper from "../../../utils/PageHelper";

export default function JobHistory(): JSX.Element {
    const instanceEditContext = React.useContext(InstanceEditContext);

    const [jobs, setJobs] = useState<TGSJobResponse[]>([]);
    const [errors, setErrors] = useState<Array<InternalError<ErrorCode> | undefined>>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(
        RouteData.jobhistorypage.get(instanceEditContext.instance.id) ?? 1
    );
    const [maxPage, setMaxPage] = useState<number | undefined>(undefined);

    //const [];

    useEffect(() => {
        async function loadJobs() {
            const response = await JobsClient.listJobs(instanceEditContext.instance.id, {
                page: page
            });
            if (response.code === StatusCode.OK) {
                if (page > response.payload.totalPages && response.payload.totalPages !== 0)
                    setPage(1);
                setJobs(response.payload.content);
                setMaxPage(response.payload.totalPages);
            } else {
                addError(response.error);
            }
            setLoading(false);
        }

        RouteData.jobhistorypage.set(instanceEditContext.instance.id, page);
        setLoading(true);
        void loadJobs();
    }, [page, instanceEditContext.instance.id]);

    useEffect(() => {}, [errors]);

    function addError(error: InternalError<ErrorCode>): void {
        setErrors(prevState => {
            const errors = Array.from(prevState);
            errors.push(error);
            return errors;
        });
    }

    async function onCancel(job: TGSJobResponse) {
        const status = await JobsClient.deleteJob(job.instanceId, job.id);

        if (status.code === StatusCode.OK) {
            JobsController.fastmode = 5;
        } else {
            addError(status.error);
        }
    }

    if (loading) {
        return <Loading text="loading.instance.jobs.list" />;
    }

    return (
        <div>
            <DebugJsonViewer obj={jobs} />
            {errors.map((err, index) => {
                if (!err) return;
                return (
                    <ErrorAlert
                        key={index}
                        error={err}
                        onClose={() =>
                            setErrors(prev => {
                                const newarr = Array.from(prev);
                                newarr[index] = undefined;
                                return newarr;
                            })
                        }
                    />
                );
            })}
            {jobs
                .sort((a, b) => b.id - a.id)
                .filter(job => !!job.stoppedAt)
                .map(job => (
                    <JobCard job={job} key={job.id} onCancel={onCancel} />
                ))}
            <PageHelper
                selectPage={newPage => setPage(newPage)}
                totalPages={maxPage ?? 1}
                currentPage={page}
            />
        </div>
    );
}
