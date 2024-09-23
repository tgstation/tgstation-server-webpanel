import React, { useContext, useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { FormattedMessage } from "react-intl";

import DreamMakerClient from "../../../../ApiClient/DreamMakerClient";
import {
    CompileJobResponse,
    DMApiValidationMode,
    DreamDaemonSecurity,
    DreamMakerRequest,
    DreamMakerResponse,
    DreamMakerRights
} from "../../../../ApiClient/generatedcode/generated";
import InternalError, { ErrorCode } from "../../../../ApiClient/models/InternalComms/InternalError";
import { StatusCode } from "../../../../ApiClient/models/InternalComms/InternalStatus";
import JobsController from "../../../../ApiClient/util/JobsController";
import { InstanceEditContext } from "../../../../contexts/InstanceEditContext";
import { hasDreamMakerRight } from "../../../../utils/misc";
import DeploymentViewer, { DeploymentsData, ViewDataType } from "../../../utils/DeploymentViewer";
import { addError, displayErrors } from "../../../utils/ErrorAlert";
import GenericAlert from "../../../utils/GenericAlert";
import { FieldType } from "../../../utils/InputField";
import InputForm from "../../../utils/InputForm";
import { DebugJsonViewer } from "../../../utils/JsonViewer";
import Loading from "../../../utils/Loading";
import SimpleToolTip from "../../../utils/SimpleTooltip";

export function Deployment(): JSX.Element {
    const instanceEditContext = useContext(InstanceEditContext);
    const errorState = useState<Array<InternalError<ErrorCode> | undefined>>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deployInfo, setDeployInfo] = useState<DreamMakerResponse | null>(null);
    const [compileJobs, setCompileJobs] = useState<CompileJobResponse[] | null>(null);
    const [compileJobsPage, setCompileJobsPage] = useState<number>(1);
    const [compileJobsTotalPages, setCompileJobsTotalPages] = useState<number>(0);

    // adjusts the size of the viewer pages, undefined uses default server page size
    const [compileJobsPageSize, setCompileJobsPageSize] = useState<number | undefined>(5);

    const canRead = hasDreamMakerRight(
        instanceEditContext.instancePermissionSet,
        DreamMakerRights.Read
    );
    const canCompile = hasDreamMakerRight(
        instanceEditContext.instancePermissionSet,
        DreamMakerRights.Compile
    );
    const canReadDeployments = hasDreamMakerRight(
        instanceEditContext.instancePermissionSet,
        DreamMakerRights.CompileJobs
    );

    async function loadDeployInfo() {
        if (!canRead) return setIsLoading(false);

        setIsLoading(true);
        const response = await DreamMakerClient.getDeployInfo(instanceEditContext.instance.id);
        setIsLoading(false);

        if (response.code === StatusCode.OK) {
            setDeployInfo(response.payload);
        } else {
            addError(errorState, response.error);
        }
    }

    async function loadCompileJobs(page: number): Promise<void> {
        if (!canReadDeployments) {
            return;
        }

        // loading is handled in viewer component
        setCompileJobs(null);
        const response = await DreamMakerClient.listCompileJobs(instanceEditContext.instance.id, {
            page,
            pageSize: compileJobsPageSize
        });

        if (response.code === StatusCode.OK) {
            if (!compileJobsPageSize) setCompileJobsPageSize(response.payload.pageSize);

            setCompileJobsTotalPages(response.payload.totalPages);
            setCompileJobsPage(page);
            setCompileJobs(response.payload.content);
        } else {
            addError(errorState, response.error);
        }
    }

    useEffect(() => {
        void loadDeployInfo();
        void loadCompileJobs(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [instanceEditContext.instance.id]);

    let timeout = undefined;
    const parsedTimeMatch = /(?:(?<days>\d+)\.)?(?<hours>\d+):(?<minutes>\d+):(?<seconds>\d+)/.exec(
        deployInfo?.timeout ?? ""
    );
    if (parsedTimeMatch) {
        const parsedTime = parsedTimeMatch.groups!;
        timeout =
            (parseInt(parsedTime.days ?? 0) * 24 + parseInt(parsedTime.hours)) * 60 +
            parseInt(parsedTime.minutes) +
            parseInt(parsedTime.seconds) / 60;
    }

    const fields = {
        projectName: {
            type: FieldType.String as FieldType.String,
            name: "fields.instance.deploy.projectname",
            tooltip: "fields.instance.deploy.projectname.desc",
            defaultValue: deployInfo?.projectName,
            disabled: !hasDreamMakerRight(
                instanceEditContext.instancePermissionSet,
                DreamMakerRights.SetDme
            )
        },
        compilerAdditionalArguments: {
            type: FieldType.String as FieldType.String,
            name: "fields.instance.deploy.compilerargs",
            tooltip: "fields.instance.deploy.compilerargs.desc",
            defaultValue: deployInfo?.compilerAdditionalArguments,
            disabled: !hasDreamMakerRight(
                instanceEditContext.instancePermissionSet,
                DreamMakerRights.SetCompilerArguments
            )
        },
        timeout: {
            type: FieldType.Number as FieldType.Number,
            name: "fields.instance.deploy.timeout",
            tooltip: "fields.instance.deploy.timeout.desc",
            defaultValue: timeout,
            disabled: !hasDreamMakerRight(
                instanceEditContext.instancePermissionSet,
                DreamMakerRights.SetTimeout
            )
        },
        apiValidationPort: {
            type: FieldType.Number as FieldType.Number,
            min: 0,
            max: 65535,
            name: "fields.instance.deploy.apiport",
            tooltip: "fields.instance.deploy.apiport.desc",
            defaultValue: deployInfo?.apiValidationPort,
            disabled: !hasDreamMakerRight(
                instanceEditContext.instancePermissionSet,
                DreamMakerRights.SetApiValidationPort
            )
        },
        apiValidationSecurityLevel: {
            type: FieldType.Enum as FieldType.Enum,
            enum: DreamDaemonSecurity,
            name: "fields.instance.deploy.seclevel",
            tooltip: "fields.instance.deploy.seclevel.desc",
            defaultValue: deployInfo?.apiValidationSecurityLevel,
            disabled: !hasDreamMakerRight(
                instanceEditContext.instancePermissionSet,
                DreamMakerRights.SetSecurityLevel
            )
        },
        dmApiValidationMode: {
            type: FieldType.Enum as FieldType.Enum,
            enum: DMApiValidationMode,
            name: "fields.instance.deploy.validateapi",
            tooltip: "fields.instance.deploy.validateapi.desc",
            defaultValue: deployInfo?.dmApiValidationMode,
            disabled: !hasDreamMakerRight(
                instanceEditContext.instancePermissionSet,
                DreamMakerRights.SetApiValidationRequirement
            )
        }
    };

    let deploymentViewData: DeploymentsData | null = null;
    const paging = {
        currentPage: compileJobsPage,
        totalPages: compileJobsTotalPages,
        loadPage: loadCompileJobs,
        pageSize: compileJobsPageSize ?? 0 // will always be set before being accessed
    };

    if (!canReadDeployments) {
        deploymentViewData = {
            viewDataType: ViewDataType.CompileJobs,
            paging
        };
    } else if (compileJobs) {
        deploymentViewData = {
            viewDataType: ViewDataType.CompileJobs,
            compileJobs,
            paging
        };
    }

    return (
        <div className="text-center">
            <DebugJsonViewer obj={{ deployInfo }} />
            {displayErrors(errorState)}
            {canReadDeployments ? (
                <DeploymentViewer viewData={deploymentViewData} />
            ) : (
                <GenericAlert title="view.instance.no_compile_jobs" />
            )}
            <hr />
            <h3>
                <FormattedMessage id="view.instance.deploy.title" />
            </h3>
            {!canRead ? <GenericAlert title="view.instance.no_metadata" /> : null}
            {isLoading ? (
                <Loading text="loading.deployments" />
            ) : (
                <>
                    <InputForm
                        hideDisabled={!canRead}
                        fields={fields}
                        onSave={async _result => {
                            let newTimeout: undefined | string = undefined;
                            if (_result.timeout) {
                                const days = Math.floor(_result.timeout / (24 * 60));
                                _result.timeout -= days * (24 * 60);
                                const hours = Math.floor(_result.timeout / 60);
                                _result.timeout -= hours * 60;
                                const minutes = Math.floor(_result.timeout);
                                _result.timeout -= minutes;
                                const seconds = Math.floor(_result.timeout * 60);
                                if (days) {
                                    newTimeout = `${days}.${hours}:${minutes}:${seconds}`;
                                } else {
                                    newTimeout = `${hours}:${minutes}:${seconds}`;
                                }
                            }

                            const result = {
                                ..._result,
                                timeout: newTimeout
                            } as DreamMakerRequest;

                            setIsLoading(true);
                            const response = await DreamMakerClient.updateDeployInfo(
                                instanceEditContext.instance.id,
                                result
                            );
                            if (response.code === StatusCode.ERROR) {
                                addError(errorState, response.error);
                            } else {
                                await loadDeployInfo();
                            }
                            setIsLoading(false);
                        }}
                    />
                    <hr />
                    <SimpleToolTip
                        tooltipid="generic.no_perm"
                        show={canCompile ? false : undefined}>
                        <Button
                            disabled={!canCompile}
                            onClick={() =>
                                void (async () => {
                                    const response = await DreamMakerClient.startCompile(
                                        instanceEditContext.instance.id
                                    );
                                    if (response.code === StatusCode.ERROR) {
                                        addError(errorState, response.error);
                                    } else {
                                        JobsController.registerJob(
                                            response.payload,
                                            instanceEditContext.instance.id
                                        );
                                        JobsController.fastmode = 5;
                                    }
                                })()
                            }>
                            <FormattedMessage id="view.instance.deploy.deploy" />
                        </Button>
                    </SimpleToolTip>
                </>
            )}
        </div>
    );
}
