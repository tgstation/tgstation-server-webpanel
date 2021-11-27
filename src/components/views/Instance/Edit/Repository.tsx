import React, { useContext, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";

import { ErrorCode as TGSErrorCode } from "../../../../ApiClient/generatedcode/_enums";
import { RepositoryResponse } from "../../../../ApiClient/generatedcode/schemas";
import InternalError, { ErrorCode } from "../../../../ApiClient/models/InternalComms/InternalError";
import { StatusCode } from "../../../../ApiClient/models/InternalComms/InternalStatus";
import RepositoryClient from "../../../../ApiClient/RepositoryClient";
import JobsController from "../../../../ApiClient/util/JobsController";
import { InstanceEditContext } from "../../../../contexts/InstanceEditContext";
import { addError, displayErrors } from "../../../utils/ErrorAlert";
import { FieldType } from "../../../utils/InputField";
import InputForm from "../../../utils/InputForm";
import { DebugJsonViewer } from "../../../utils/JsonViewer";
import Loading from "../../../utils/Loading";
import JobsClient from "../../../../ApiClient/JobsClient";
import GenericAlert from "../../../utils/GenericAlert";

export default function Repository(): JSX.Element {
    const instanceEditContext = useContext(InstanceEditContext);

    const errorState = useState<Array<InternalError<ErrorCode> | undefined>>([]);
    const [repositoryInfo, setRepositoryInfo] = useState<RepositoryResponse>();
    const [isCloning, setIsCloning] = useState(false);
    const [isUnableHookClone, setIsUnableHookClone] = useState(false);

    useEffect(() => void fetchRepositoryInfo(), []);

    async function fetchRepositoryInfo() {
        const response = await RepositoryClient.getRepository(instanceEditContext.instance.id);

        setIsCloning(false);
        if (response.code === StatusCode.ERROR) {
            if (
                response.error.code === ErrorCode.HTTP_DATA_INEGRITY &&
                response.error.originalErrorMessage?.errorCode === TGSErrorCode.RepoCloning
            ) {
                setIsUnableHookClone(false);
                setIsCloning(true);
                const response2 = await JobsClient.listActiveJobs(instanceEditContext.instance.id, {
                    page: 1,
                    pageSize: 100
                });
                if (response2.code === StatusCode.OK) {
                    const cloneJob = response2.payload.content
                        .sort((a, b) => b.id - a.id)
                        .find(
                            job =>
                                job.description.includes("Clone") &&
                                job.description.includes("repository")
                        );
                    if (cloneJob) {
                        JobsController.registerCallback(cloneJob.id, fetchRepositoryInfo);
                    } else {
                        setIsUnableHookClone(true);
                    }
                } else {
                    setIsUnableHookClone(true);
                }
            } else {
                addError(errorState, response.error);
            }
        } else {
            setRepositoryInfo(response.payload);
        }
    }

    function cloneMode(): JSX.Element {
        const fields = {
            origin: {
                type: FieldType.String as FieldType.String,
                name: "fields.repository.url"
            },
            reference: {
                type: FieldType.String as FieldType.String,
                name: "fields.repository.ref",
                defaultValue: "main"
            },
            accessUser: {
                type: FieldType.String as FieldType.String,
                name: "fields.repository.gituser",
                defaultValue: ""
            },
            accessToken: {
                type: FieldType.String as FieldType.Password,
                name: "fields.repository.gitpassword",
                defaultValue: ""
            },
            updateSubmodules: {
                type: FieldType.Boolean as FieldType.Boolean,
                name: "field.repository.enablesubmodules",
                defaultValue: true
            }
        };

        return (
            <InputForm
                fields={fields}
                onSave={async result => {
                    const response = await RepositoryClient.cloneRepository(
                        instanceEditContext.instance.id,
                        result
                    );
                    console.log(response);
                    if (response.code === StatusCode.OK) {
                        await fetchRepositoryInfo();
                        JobsController.restartLoop();
                    }
                }}
                includeAll
            />
        );
    }

    // https://github.com/yogstation13/yogstation.git
    // https://github.com/alexkar598/dmapitest.git

    if (isCloning) {
        return (
            <>
                {isUnableHookClone ? (
                    <GenericAlert title="view.instance.repo.canthookclone" />
                ) : null}
                <Loading text="loading.repo.cloning" />
            </>
        );
    }

    if (!repositoryInfo) {
        return <>{displayErrors(errorState)}</>;
    }

    return (
        <>
            <DebugJsonViewer obj={repositoryInfo} />
            {displayErrors(errorState)}
            <Button
                onClick={() => {
                    void RepositoryClient.deleteRepository(instanceEditContext.instance.id);
                }}>
                Delete Repo
            </Button>
            {repositoryInfo.origin ? "there's a repo" : cloneMode()}
        </>
    );
}
