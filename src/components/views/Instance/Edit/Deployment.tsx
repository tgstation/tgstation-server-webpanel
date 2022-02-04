import React, { useContext, useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { FormattedMessage } from "react-intl";

import DreamMakerClient from "../../../../ApiClient/DreamMakerClient";
import {
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

    const canRead = hasDreamMakerRight(
        instanceEditContext.instancePermissionSet,
        DreamMakerRights.Read
    );
    const canCompile = hasDreamMakerRight(
        instanceEditContext.instancePermissionSet,
        DreamMakerRights.Compile
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

    useEffect(() => {
        void loadDeployInfo();
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
            min: 1,
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
        requireDMApiValidation: {
            type: FieldType.Boolean as FieldType.Boolean,
            name: "fields.instance.deploy.validateapi",
            tooltip: "fields.instance.deploy.validateapi.desc",
            defaultValue: deployInfo?.requireDMApiValidation,
            disabled: !hasDreamMakerRight(
                instanceEditContext.instancePermissionSet,
                DreamMakerRights.SetApiValidationRequirement
            )
        }
    };

    return (
        <div className="text-center">
            <DebugJsonViewer obj={{ deployInfo }} />
            <h3>
                <FormattedMessage id="view.instance.deploy.title" />
            </h3>
            {!canRead ? <GenericAlert title="view.instance.no_metadata" /> : null}
            {displayErrors(errorState)}
            {isLoading ? (
                <Loading />
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
                            onClick={async () => {
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
                            }}>
                            <FormattedMessage id="view.instance.deploy.deploy" />
                        </Button>
                    </SimpleToolTip>
                </>
            )}
        </div>
    );
}
