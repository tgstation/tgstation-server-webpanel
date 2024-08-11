import React, { useContext, useEffect, useState } from "react";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { FormattedMessage, injectIntl, WrappedComponentProps } from "react-intl";
import { gte as SemVerGte } from "semver";

import DreamDaemonClient from "../../../../ApiClient/DreamDaemonClient";
import {
    DreamDaemonRequest,
    DreamDaemonResponse,
    DreamDaemonRights,
    DreamDaemonSecurity,
    DreamDaemonVisibility,
    EngineType,
    WatchdogStatus
} from "../../../../ApiClient/generatedcode/generated";
import InternalError, { ErrorCode } from "../../../../ApiClient/models/InternalComms/InternalError";
import { StatusCode } from "../../../../ApiClient/models/InternalComms/InternalStatus";
import JobsController from "../../../../ApiClient/util/JobsController";
import { InstanceEditContext } from "../../../../contexts/InstanceEditContext";
import { hasDreamDaemonRight } from "../../../../utils/misc";
import DeploymentViewer, { ViewDataType, WatchdogData } from "../../../utils/DeploymentViewer";
import { addError, displayErrors } from "../../../utils/ErrorAlert";
import GenericAlert from "../../../utils/GenericAlert";
import InputField, { FieldType } from "../../../utils/InputField";
import InputForm from "../../../utils/InputForm";
import { DebugJsonViewer } from "../../../utils/JsonViewer";
import Loading from "../../../utils/Loading";

enum GracefulAction {
    None,
    Stop,
    Restart
}

function Server(props: WrappedComponentProps): JSX.Element {
    const instanceEditContext = useContext(InstanceEditContext);
    const [watchdogSettings, setWatchdogSettings] = useState<DreamDaemonResponse>();
    const [loading, setLoading] = useState(false);
    const errorState = useState<Array<InternalError<ErrorCode> | undefined>>([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => void loadWatchdogSettings(), [instanceEditContext.instance.id]);

    async function loadWatchdogSettings(): Promise<void> {
        if (
            !hasDreamDaemonRight(
                instanceEditContext.instancePermissionSet,
                DreamDaemonRights.ReadMetadata
            )
        ) {
            return setWatchdogSettings({});
        }

        const response = await DreamDaemonClient.getWatchdogStatus(instanceEditContext.instance.id);
        if (response.code === StatusCode.ERROR) {
            addError(errorState, response.error);
        } else {
            setWatchdogSettings(response.payload);
        }
    }
    async function saveWatchdogSettings(newSettings: DreamDaemonRequest): Promise<void> {
        setLoading(true);
        const response = await DreamDaemonClient.updateWatchdogStatus(
            instanceEditContext.instance.id,
            newSettings
        );
        if (response.code === StatusCode.ERROR) {
            addError(errorState, response.error);
        }
        await loadWatchdogSettings();
        setLoading(false);
    }

    async function startWatchdog(): Promise<void> {
        setLoading(true);
        const response = await DreamDaemonClient.startWatchdog(instanceEditContext.instance.id);
        if (response.code === StatusCode.ERROR) {
            addError(errorState, response.error);
        } else {
            JobsController.registerCallback(response.payload.id, () => void loadWatchdogSettings());
            JobsController.fastmode = 5;
            await loadWatchdogSettings();
        }
        setLoading(false);
    }

    async function stopWatchdog(): Promise<void> {
        if (!confirm(props.intl.formatMessage({ id: "view.instance.server.prompt.stop" }))) {
            return;
        }

        setLoading(true);
        const response = await DreamDaemonClient.stopWatchdog(instanceEditContext.instance.id);
        if (response.code === StatusCode.ERROR) {
            addError(errorState, response.error);
        } else {
            await loadWatchdogSettings();
        }
        setLoading(false);
    }

    async function restartWatchdog(): Promise<void> {
        if (!confirm(props.intl.formatMessage({ id: "view.instance.server.prompt.restart" }))) {
            return;
        }

        setLoading(true);
        const response = await DreamDaemonClient.restartWatchdog(instanceEditContext.instance.id);
        if (response.code === StatusCode.ERROR) {
            addError(errorState, response.error);
        } else {
            JobsController.registerCallback(response.payload.id, () => void loadWatchdogSettings());
            JobsController.fastmode = 5;
            await loadWatchdogSettings();
        }
        setLoading(false);
    }

    async function dumpWatchdog(): Promise<void> {
        setLoading(true);
        const response = await DreamDaemonClient.dumpWatchdog(instanceEditContext.instance.id);
        if (response.code === StatusCode.ERROR) {
            addError(errorState, response.error);
        } else {
            JobsController.fastmode = 5;
        }
        setLoading(false);
    }

    if (!watchdogSettings) {
        return <>{displayErrors(errorState)}</>;
    }

    if (loading) {
        return <Loading />;
    }

    const fields = {
        autoStart: {
            type: FieldType.Boolean as FieldType.Boolean,
            name: "fields.instance.watchdog.autostart",
            defaultValue: watchdogSettings.autoStart,
            disabled: !hasDreamDaemonRight(
                instanceEditContext.instancePermissionSet,
                DreamDaemonRights.SetAutoStart
            )
        },
        startProfiler: {
            type: FieldType.Boolean as FieldType.Boolean,
            name: "fields.instance.watchdog.autostartprofiler",
            defaultValue: watchdogSettings.startProfiler,
            disabled: !hasDreamDaemonRight(
                instanceEditContext.instancePermissionSet,
                DreamDaemonRights.SetProfiler
            )
        },
        logOutput: {
            type: FieldType.Boolean as FieldType.Boolean,
            name: "fields.instance.watchdog.logoutput",
            defaultValue: watchdogSettings.logOutput,
            disabled: !hasDreamDaemonRight(
                instanceEditContext.instancePermissionSet,
                DreamDaemonRights.SetLogOutput
            )
        },
        port: {
            type: FieldType.Number as FieldType.Number,
            name: "fields.instance.watchdog.port",
            defaultValue: watchdogSettings.port,
            min: 0,
            max: 65535,
            disabled: !hasDreamDaemonRight(
                instanceEditContext.instancePermissionSet,
                DreamDaemonRights.SetPort
            )
        },
        visibility: {
            type: FieldType.Enum as FieldType.Enum,
            name: "fields.instance.watchdog.visibility",
            defaultValue: watchdogSettings.visibility,
            enum: DreamDaemonVisibility,
            disabled: !hasDreamDaemonRight(
                instanceEditContext.instancePermissionSet,
                DreamDaemonRights.SetVisibility
            )
        },
        securityLevel: {
            type: FieldType.Enum as FieldType.Enum,
            name: "fields.instance.watchdog.securitylevel",
            defaultValue: watchdogSettings.securityLevel,
            enum: DreamDaemonSecurity,
            disabled: !hasDreamDaemonRight(
                instanceEditContext.instancePermissionSet,
                DreamDaemonRights.SetSecurity
            )
        },
        startupTimeout: {
            type: FieldType.Number as FieldType.Number,
            name: "fields.instance.watchdog.timeout.startup",
            defaultValue: watchdogSettings.startupTimeout,
            min: 0,
            disabled: !hasDreamDaemonRight(
                instanceEditContext.instancePermissionSet,
                DreamDaemonRights.SetStartupTimeout
            )
        },
        topicRequestTimeout: {
            type: FieldType.Number as FieldType.Number,
            name: "fields.instance.watchdog.timeout.topic",
            defaultValue: watchdogSettings.topicRequestTimeout,
            min: 0,
            disabled: !hasDreamDaemonRight(
                instanceEditContext.instancePermissionSet,
                DreamDaemonRights.SetTopicTimeout
            )
        },
        healthCheckSeconds: {
            type: FieldType.Number as FieldType.Number,
            name: "fields.instance.watchdog.healthcheck",
            defaultValue: watchdogSettings.healthCheckSeconds,
            min: 0,
            disabled: !hasDreamDaemonRight(
                instanceEditContext.instancePermissionSet,
                DreamDaemonRights.SetHealthCheckInterval
            )
        },
        dumpOnHealthCheckRestart: {
            type: FieldType.Boolean as FieldType.Boolean,
            name: "fields.instance.watchdog.dumpOnHealthCheckRestart",
            defaultValue: watchdogSettings.dumpOnHealthCheckRestart,
            disabled: !hasDreamDaemonRight(
                instanceEditContext.instancePermissionSet,
                DreamDaemonRights.CreateDump
            )
        },
        minidumps: {
            type: FieldType.Boolean as FieldType.Boolean,
            name: "fields.instance.watchdog.minidumps",
            defaultValue: watchdogSettings.minidumps,
            disabled: !hasDreamDaemonRight(
                instanceEditContext.instancePermissionSet,
                DreamDaemonRights.SetMinidumps
            )
        },
        allowWebClient: {
            type: FieldType.Boolean as FieldType.Boolean,
            name: "fields.instance.watchdog.allowwebclient",
            defaultValue: watchdogSettings.allowWebClient,
            disabled: !hasDreamDaemonRight(
                instanceEditContext.instancePermissionSet,
                DreamDaemonRights.SetWebClient
            )
        },
        additionalParameters: {
            type: FieldType.String as FieldType.String,
            name: "fields.instance.watchdog.additionalparams",
            defaultValue: watchdogSettings.additionalParameters,
            disabled: !hasDreamDaemonRight(
                instanceEditContext.instancePermissionSet,
                DreamDaemonRights.SetAdditionalParameters
            )
        },
        mapThreads: {
            type: FieldType.Number as FieldType.Number,
            name: "fields.instance.watchdog.mapthreads",
            defaultValue: watchdogSettings.mapThreads,
            disabled: !hasDreamDaemonRight(
                instanceEditContext.instancePermissionSet,
                DreamDaemonRights.SetMapThreads
            )
        },
        openDreamTopicPort: {
            type: FieldType.Number as FieldType.Number,
            name: "fields.instance.watchdog.od_topic_port",
            tooltip: "fields.instance.watchdog.od_topic_port.desc",
            defaultValue: watchdogSettings.openDreamTopicPort,
            min: 0,
            max: 65535,
            disabled: !hasDreamDaemonRight(
                instanceEditContext.instancePermissionSet,
                DreamDaemonRights.SetPort
            )
        }
    };

    const anyEditableField = Object.values(fields).some(field => !field.disabled);

    const no_perm_tooltip = (
        <Tooltip id="generic.no_perm">
            <FormattedMessage id="generic.no_perm" />
        </Tooltip>
    );

    const canStart = hasDreamDaemonRight(
        instanceEditContext.instancePermissionSet,
        DreamDaemonRights.Start
    );
    const canStop = hasDreamDaemonRight(
        instanceEditContext.instancePermissionSet,
        DreamDaemonRights.Shutdown
    );
    const canRestart = hasDreamDaemonRight(
        instanceEditContext.instancePermissionSet,
        DreamDaemonRights.Restart
    );
    const canDump = hasDreamDaemonRight(
        instanceEditContext.instancePermissionSet,
        DreamDaemonRights.CreateDump
    );
    const canMetadata = hasDreamDaemonRight(
        instanceEditContext.instancePermissionSet,
        DreamDaemonRights.ReadMetadata
    );
    const canGracefulAny =
        hasDreamDaemonRight(
            instanceEditContext.instancePermissionSet,
            DreamDaemonRights.SoftShutdown
        ) ||
        hasDreamDaemonRight(
            instanceEditContext.instancePermissionSet,
            DreamDaemonRights.SoftRestart
        );
    const canActionAny = canStart || canStop || canRestart || canDump;

    const canBroadcast = hasDreamDaemonRight(
        instanceEditContext.instancePermissionSet,
        DreamDaemonRights.BroadcastMessage
    );

    const broadcastNotAllowed =
        !canBroadcast ||
        (canMetadata &&
            (watchdogSettings.status !== WatchdogStatus.Online ||
                (watchdogSettings.activeCompileJob?.dmApiVersion != null &&
                    !SemVerGte(watchdogSettings.activeCompileJob?.dmApiVersion, "5.7.0"))));

    const broadcastFields = {
        message: {
            type: FieldType.String as FieldType.String,
            name: "fields.instance.watchdog.broadcast",
            defaultValue: "",
            disabled: broadcastNotAllowed,
            tooltip: "fields.instance.watchdog.broadcast.desc"
        }
    };

    const canViewDeployment = hasDreamDaemonRight(
        instanceEditContext.instancePermissionSet,
        DreamDaemonRights.ReadRevision
    );

    let deploymentViewData: WatchdogData | null = null;
    if (watchdogSettings) {
        deploymentViewData = {
            viewDataType: ViewDataType.Watchdog,
            activeCompileJob: watchdogSettings.activeCompileJob,
            stagedCompileJob: watchdogSettings.stagedCompileJob
        };
    }

    const OneGibibyte = 1073741824;
    const ramUsage = watchdogSettings?.immediateMemoryUsage;

    return (
        <div className="text-center">
            <DebugJsonViewer obj={watchdogSettings} />
            {displayErrors(errorState)}
            <h2 className="text-center">
                <FormattedMessage id="view.instance.server.status" />
                <Badge
                    pill
                    variant={
                        watchdogSettings.status === WatchdogStatus.Online
                            ? "success"
                            : watchdogSettings.status === WatchdogStatus.Offline
                              ? "danger"
                              : "warning"
                    }>
                    <FormattedMessage
                        id={`view.instance.server.status.${
                            WatchdogStatus[watchdogSettings.status!]
                        }`}
                    />
                </Badge>
            </h2>
            {ramUsage ? (
                <h4>
                    <Badge
                        pill
                        variant={
                            deploymentViewData?.activeCompileJob?.engineVersion.engine ==
                            EngineType.OpenDream
                                ? "success"
                                : ramUsage > OneGibibyte * 3
                                  ? "danger"
                                  : ramUsage > OneGibibyte * 2
                                    ? "warning"
                                    : "success"
                        }>
                        <div>
                            <FormattedMessage id="view.instance.server.status.ram" />
                            :&nbsp;
                            {Math.round((ramUsage / OneGibibyte) * 100) / 100}
                            GB
                        </div>
                    </Badge>
                </h4>
            ) : null}
            <hr />
            {canViewDeployment ? (
                <DeploymentViewer viewData={deploymentViewData} />
            ) : (
                <GenericAlert title="view.instance.no_compile_jobs" />
            )}
            <hr />
            <h3 className="text-center">
                <FormattedMessage id="view.instance.server.settings" />
            </h3>
            {!canMetadata ? (
                anyEditableField ? (
                    <GenericAlert title="view.instance.no_metadata" />
                ) : (
                    <GenericAlert title="view.instance.server.no_metadata_and_no_settings" />
                )
            ) : null}
            <InputForm fields={fields} onSave={saveWatchdogSettings} hideDisabled={!canMetadata} />
            <hr />
            <h3 className="text-center">
                <FormattedMessage id="view.instance.server.actions" />
            </h3>
            {canActionAny ? (
                <>
                    {!canMetadata ? (
                        <GenericAlert title="view.instance.server.no_metadata_actions" />
                    ) : null}
                    <div className="text-center mb-3">
                        <OverlayTrigger
                            overlay={no_perm_tooltip}
                            show={canStart ? false : undefined}>
                            <Button
                                variant="success"
                                className="mx-2"
                                onClick={() => void startWatchdog()}
                                disabled={
                                    (canMetadata &&
                                        watchdogSettings.status != WatchdogStatus.Offline) ||
                                    !canStart
                                }>
                                <FormattedMessage id="view.instance.server.start" />
                            </Button>
                        </OverlayTrigger>
                        <OverlayTrigger
                            overlay={no_perm_tooltip}
                            show={canStop ? false : undefined}>
                            <Button
                                variant="danger"
                                className="mx-2"
                                onClick={() => void stopWatchdog()}
                                disabled={
                                    (canMetadata &&
                                        watchdogSettings.status == WatchdogStatus.Offline) ||
                                    !canStop
                                }>
                                <FormattedMessage id="view.instance.server.stop" />
                            </Button>
                        </OverlayTrigger>
                        <OverlayTrigger
                            overlay={no_perm_tooltip}
                            show={canRestart ? false : undefined}>
                            <Button
                                variant="warning"
                                className="mx-2"
                                onClick={() => void restartWatchdog()}
                                disabled={
                                    (canMetadata &&
                                        watchdogSettings.status == WatchdogStatus.Offline) ||
                                    !canRestart
                                }>
                                <FormattedMessage id="view.instance.server.restart" />
                            </Button>
                        </OverlayTrigger>
                        <OverlayTrigger
                            overlay={no_perm_tooltip}
                            show={canDump ? false : undefined}>
                            <Button
                                variant="info"
                                className="mx-2"
                                onClick={() => void dumpWatchdog()}
                                disabled={
                                    (canMetadata &&
                                        watchdogSettings.status != WatchdogStatus.Online) ||
                                    !canDump
                                }>
                                <FormattedMessage id="view.instance.server.dump" />
                            </Button>
                        </OverlayTrigger>
                    </div>
                </>
            ) : (
                <GenericAlert title="view.instance.server.no_actions" />
            )}
            {!canMetadata && canGracefulAny ? (
                <GenericAlert title="view.instance.server.no_metadata_graceful" />
            ) : null}

            {canMetadata || canGracefulAny ? (
                <div className="w-75 mx-auto">
                    <InputField
                        name="view.instance.graceful"
                        type={FieldType.Enum}
                        enum={GracefulAction}
                        tooltip="view.instance.graceful.desc"
                        defaultValue={
                            watchdogSettings.softRestart
                                ? GracefulAction.Restart
                                : watchdogSettings.softShutdown
                                  ? GracefulAction.Stop
                                  : GracefulAction.None
                        }
                        disabled={!canGracefulAny}
                        onChange={_result => {
                            const result = _result as GracefulAction;

                            switch (result) {
                                case GracefulAction.None:
                                    if (
                                        !watchdogSettings?.softRestart &&
                                        !watchdogSettings?.softShutdown
                                    )
                                        return;
                                    void saveWatchdogSettings({
                                        softShutdown: watchdogSettings.softShutdown
                                            ? false
                                            : undefined,
                                        softRestart: watchdogSettings.softRestart
                                            ? false
                                            : undefined
                                    });
                                    break;
                                case GracefulAction.Stop:
                                    if (watchdogSettings?.softShutdown) return;
                                    void saveWatchdogSettings({
                                        softShutdown: true
                                    });
                                    break;
                                case GracefulAction.Restart:
                                    if (watchdogSettings?.softRestart) return;
                                    void saveWatchdogSettings({
                                        softRestart: true
                                    });
                                    break;
                            }
                        }}
                    />
                </div>
            ) : canActionAny ? (
                <GenericAlert title="view.instance.server.no_graceful" />
            ) : null}

            <div className="w-75 mx-auto">
                <br />
                <InputForm
                    fields={broadcastFields}
                    onSave={fieldsResult => {
                        void saveWatchdogSettings({
                            broadcastMessage: fieldsResult.message
                        });
                    }}
                    saveMessageId="view.instance.server.broadcast"
                />
            </div>
        </div>
    );
}

export default injectIntl(Server);
