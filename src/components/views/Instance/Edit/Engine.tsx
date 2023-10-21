import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { ChangeEvent } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import FormControl from "react-bootstrap/FormControl";
import InputGroup from "react-bootstrap/InputGroup";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { FormattedMessage } from "react-intl";

import EngineClient from "../../../../ApiClient/EngineClient";
import {
    EngineResponse,
    EngineRights,
    EngineType,
    EngineVersion
} from "../../../../ApiClient/generatedcode/generated";
import InternalError, { ErrorCode } from "../../../../ApiClient/models/InternalComms/InternalError";
import { StatusCode } from "../../../../ApiClient/models/InternalComms/InternalStatus";
import JobsController from "../../../../ApiClient/util/JobsController";
import { InstanceEditContext } from "../../../../contexts/InstanceEditContext";
import GithubClient from "../../../../utils/GithubClient";
import { hasEngineRight } from "../../../../utils/misc";
import { RouteData } from "../../../../utils/routes";
import ErrorAlert from "../../../utils/ErrorAlert";
import GenericAlert from "../../../utils/GenericAlert";
import { DebugJsonViewer } from "../../../utils/JsonViewer";
import Loading from "../../../utils/Loading";
import PageHelper from "../../../utils/PageHelper";

interface IProps {}

interface IState {
    errors: Array<InternalError<ErrorCode> | undefined>;
    versions: EngineResponse[];
    activeVersion?: EngineVersion;
    latestByondVersion: EngineVersion;
    latestODVersion: EngineVersion;
    selectedByondVersion?: EngineVersion;
    selectedODVersion?: EngineVersion;
    loading: boolean;
    customFile?: File | null;
    page: number;
    maxPage?: number;
}

class Engine extends React.Component<IProps, IState> {
    public declare context: InstanceEditContext;
    public constructor(props: IProps) {
        super(props);

        const initByond = {
            version: "514.1589",
            engine: EngineType.Byond
        };
        const initOD = {
            engine: EngineType.OpenDream,
            sourceSHA: "fab769776dada6b9bcad546094d78c604049e0e9"
        };
        this.state = {
            versions: [],
            errors: [],
            latestByondVersion: initByond,
            latestODVersion: initOD,
            loading: true,
            page: RouteData.byondlistpage ?? 1
        };
    }

    private addError(error: InternalError<ErrorCode>): void {
        this.setState(prevState => {
            const errors = Array.from(prevState.errors);
            errors.push(error);
            return {
                errors
            };
        });
    }

    private async loadVersions() {
        if (hasEngineRight(this.context.instancePermissionSet, EngineRights.ListInstalled)) {
            const response = await EngineClient.listAllVersions(this.context.instance.id, {
                page: this.state.page
            });
            if (response.code === StatusCode.OK) {
                if (
                    this.state.page > response.payload.totalPages &&
                    response.payload.totalPages !== 0
                ) {
                    this.setState({
                        page: 1
                    });
                    return;
                }

                this.setState({
                    versions: response.payload.content,
                    maxPage: response.payload.totalPages
                });
            } else {
                this.addError(response.error);
            }
        }

        if (hasEngineRight(this.context.instancePermissionSet, EngineRights.ReadActive)) {
            const response2 = await EngineClient.getActiveVersion(this.context.instance.id);
            if (response2.code === StatusCode.OK) {
                this.setState({
                    activeVersion: response2.payload.engineVersion
                });
            } else {
                this.addError(response2.error);
            }
        }
    }

    private async switchVersion(version: EngineVersion, useCustom: boolean): Promise<void> {
        this.setState({
            loading: true
        });
        const response = await EngineClient.switchActive(
            this.context.instance.id,
            version,
            useCustom && this.state.customFile
                ? await this.state.customFile.arrayBuffer()
                : undefined
        );
        if (response.code === StatusCode.ERROR) {
            this.addError(response.error);
        } else {
            if (useCustom) {
                this.setState({
                    customFile: null
                });
            }
            if (response.payload.installJob) {
                JobsController.registerJob(response.payload.installJob, this.context.instance.id);
                JobsController.registerCallback(
                    response.payload.installJob.id,
                    () => void this.loadVersions()
                );
            } else {
                await this.loadVersions();
            }
        }
        this.setState({
            loading: false
        });
    }

    public async componentDidUpdate(
        prevProps: Readonly<IProps>,
        prevState: Readonly<IState>
    ): Promise<void> {
        if (prevState.page !== this.state.page) {
            RouteData.byondlistpage = this.state.page;
            await this.loadVersions();
        }
    }

    public async componentDidMount(): Promise<void> {
        const odGetPromise = GithubClient.getLatestDefaultCommit("OpenDreamProject", "OpenDream");
        fetch("https://secure.byond.com/download/version.txt")
            .then(res => res.text())
            .then(data => data.split("\n"))
            .then(versions => versions[0])
            .then(version => {
                const engineVersion: EngineVersion = {
                    engine: EngineType.Byond,
                    version
                };
                this.setState({
                    latestByondVersion: engineVersion,
                    selectedByondVersion: engineVersion,
                    loading: false
                });
            })
            .catch(e => {
                this.addError(new InternalError(ErrorCode.APP_FAIL, { jsError: Error(e) }));
                this.setState({
                    loading: false
                });
            });

        await this.loadVersions();

        const odLatestCommit = await odGetPromise;
        if (odLatestCommit.code === StatusCode.ERROR) {
            this.addError(odLatestCommit.error);
            return;
        }

        const newVer = {
            engine: EngineType.OpenDream,
            sourceSHA: odLatestCommit.payload
        };

        this.setState(prev => {
            return {
                latestODVersion: newVer,
                selectedODVersion:
                    this.makeUniqueStringForVersion(prev.latestODVersion) ==
                    this.makeUniqueStringForVersion(prev.selectedODVersion ?? prev.latestODVersion)
                        ? newVer
                        : prev.selectedODVersion
            };
        });
    }

    public render(): React.ReactNode {
        if (this.state.loading) {
            return <Loading text="loading.byond" />;
        }

        const canSeeVersions = hasEngineRight(
            this.context.instancePermissionSet,
            EngineRights.ListInstalled
        );
        const canSeeCurrent = hasEngineRight(
            this.context.instancePermissionSet,
            EngineRights.ReadActive
        );
        const canInstallAndSwitchByond = hasEngineRight(
            this.context.instancePermissionSet,
            EngineRights.InstallOfficialOrChangeActiveByondVersion
        );
        const canInstallAndSwitchOD = hasEngineRight(
            this.context.instancePermissionSet,
            EngineRights.InstallOfficialOrChangeActiveOpenDreamVersion
        );
        const canDelete = hasEngineRight(
            this.context.instancePermissionSet,
            EngineRights.DeleteInstall
        );

        return (
            <div className="text-center">
                <DebugJsonViewer obj={this.state} />
                <h1>
                    <FormattedMessage id="view.instance.engine" />
                </h1>
                {this.state.errors.map((err, index) => {
                    if (!err) return;
                    return (
                        <ErrorAlert
                            key={index}
                            error={err}
                            onClose={() =>
                                this.setState(prev => {
                                    const newarr = Array.from(prev.errors);
                                    newarr[index] = undefined;
                                    return {
                                        errors: newarr
                                    };
                                })
                            }
                        />
                    );
                })}
                {canSeeVersions ? (
                    <>
                        {!canSeeCurrent ? (
                            <GenericAlert title="view.instance.engine.current_denied" />
                        ) : null}
                        <div>
                            {this.state.versions.map(item => {
                                // noinspection JSBitwiseOperatorUsage
                                return (
                                    <InputGroup
                                        className="w-md-25 mb-1 mx-auto d-flex"
                                        key={this.makeUniqueStringForVersion(item.engineVersion)}>
                                        {canInstallAndSwitchByond || canSeeCurrent ? (
                                            <InputGroup.Prepend>
                                                <InputGroup.Radio
                                                    name="byond"
                                                    id={this.makeUniqueStringForVersion(
                                                        item.engineVersion
                                                    )}
                                                    value={Engine.friendlyVersion(
                                                        item.engineVersion
                                                    )}
                                                    disabled={
                                                        item.engineVersion.engine ===
                                                        EngineType.Byond
                                                            ? !canInstallAndSwitchByond
                                                            : item.engineVersion.engine ===
                                                              EngineType.OpenDream
                                                            ? !canInstallAndSwitchOD
                                                            : false
                                                    }
                                                    checked={
                                                        this.makeUniqueStringForVersion(
                                                            item.engineVersion
                                                        ) ===
                                                        this.makeUniqueStringForVersion(
                                                            this.state.activeVersion
                                                        )
                                                    }
                                                    onChange={async () => {
                                                        await this.switchVersion(
                                                            item.engineVersion,
                                                            false
                                                        );
                                                    }}
                                                />
                                            </InputGroup.Prepend>
                                        ) : null}
                                        <label
                                            className="flex-grow-1 m-0"
                                            htmlFor={this.makeUniqueStringForVersion(
                                                item.engineVersion
                                            )}>
                                            <OverlayTrigger
                                                overlay={this.tooltip(
                                                    "view.instance.engine.custom"
                                                )}
                                                show={
                                                    item.engineVersion.customIteration
                                                        ? undefined
                                                        : false
                                                }>
                                                {({ ref, ...triggerHandler }) => (
                                                    <InputGroup.Text
                                                        className="w-100"
                                                        {...triggerHandler}>
                                                        {Engine.friendlyVersion(item.engineVersion)}
                                                        {item.engineVersion.customIteration ? (
                                                            <div
                                                                className={"ml-auto"}
                                                                ref={
                                                                    ref as React.Ref<HTMLDivElement>
                                                                }>
                                                                <FontAwesomeIcon
                                                                    fixedWidth
                                                                    icon="info"
                                                                />
                                                            </div>
                                                        ) : null}
                                                    </InputGroup.Text>
                                                )}
                                            </OverlayTrigger>
                                        </label>
                                        {this.makeUniqueStringForVersion(item.engineVersion) !==
                                        this.makeUniqueStringForVersion(
                                            this.state.activeVersion
                                        ) ? (
                                            <InputGroup.Append>
                                                <OverlayTrigger
                                                    overlay={this.tooltip("generic.no_perm")}
                                                    show={!canDelete ? undefined : false}>
                                                    <Button
                                                        variant="danger"
                                                        disabled={!canDelete}
                                                        onClick={async () => {
                                                            this.setState({
                                                                loading: true
                                                            });
                                                            const response = await EngineClient.deleteVersion(
                                                                this.context.instance.id,
                                                                item.engineVersion
                                                            );
                                                            if (
                                                                response.code === StatusCode.ERROR
                                                            ) {
                                                                this.addError(response.error);
                                                            } else {
                                                                JobsController.registerJob(
                                                                    response.payload,
                                                                    this.context.instance.id
                                                                );
                                                                JobsController.registerCallback(
                                                                    response.payload.id,
                                                                    () => void this.loadVersions()
                                                                );
                                                            }
                                                            this.setState({
                                                                loading: false
                                                            });
                                                        }}>
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </Button>
                                                </OverlayTrigger>
                                            </InputGroup.Append>
                                        ) : null}
                                    </InputGroup>
                                );
                            })}
                        </div>
                        <PageHelper
                            className="mt-4"
                            selectPage={newPage => this.setState({ page: newPage })}
                            totalPages={this.state.maxPage ?? 1}
                            currentPage={this.state.page}
                        />
                    </>
                ) : canSeeCurrent ? (
                    <>
                        <GenericAlert title="view.instance.engine.list_denied" />
                        <FormattedMessage
                            id="view.instance.engine.current_version"
                            values={{ version: this.state.activeVersion }}
                        />
                    </>
                ) : (
                    <GenericAlert title="view.instance.engine.current_and_list_denied" />
                )}
                <hr />
                {this.renderByondInstall()}
                <hr />
                {this.renderODInstall()}
            </div>
        );
    }

    private tooltip(innerid?: string): JSX.Element {
        if (!innerid) return <React.Fragment />;

        return (
            <Tooltip id={innerid}>
                <FormattedMessage id={innerid} />
            </Tooltip>
        );
    }

    private renderByondInstall(): React.ReactNode {
        const canInstallCustomByond = hasEngineRight(
            this.context.instancePermissionSet,
            EngineRights.InstallCustomByondVersion
        );
        const canInstallAndSwitchByond = hasEngineRight(
            this.context.instancePermissionSet,
            EngineRights.InstallOfficialOrChangeActiveByondVersion
        );
        return (
            <React.Fragment>
                <h4>
                    <FormattedMessage id="view.instance.engine.add_byond" />
                </h4>
                <InputGroup className="w-md-50 w-lg-25 mb-3 mx-auto">
                    <FormControl
                        type="number"
                        defaultValue={this.state.latestByondVersion.version!.split(".")[0]}
                        onChange={e => {
                            this.setState(prev => {
                                const arr = (
                                    prev.selectedByondVersion ?? prev.latestByondVersion
                                ).version!.split(".");
                                arr[0] = e.target.value;
                                return {
                                    selectedByondVersion: {
                                        engine: EngineType.Byond,
                                        version: arr.join(".")
                                    }
                                };
                            });
                        }}
                    />
                    <InputGroup.Text className="rounded-0">.</InputGroup.Text>
                    <FormControl
                        type="number"
                        defaultValue={this.state.latestByondVersion.version!.split(".")[1]}
                        onChange={e => {
                            this.setState(prev => {
                                const arr = (
                                    prev.selectedByondVersion ?? prev.latestByondVersion
                                ).version!.split(".");
                                arr[1] = e.target.value;
                                return {
                                    selectedByondVersion: {
                                        engine: EngineType.Byond,
                                        version: arr.join(".")
                                    }
                                };
                            });
                        }}
                    />
                    <InputGroup.Append>
                        <OverlayTrigger
                            overlay={this.tooltip("generic.no_perm")}
                            show={!canInstallAndSwitchByond ? undefined : false}>
                            <Button
                                variant="success"
                                disabled={!canInstallAndSwitchByond}
                                onClick={async () => {
                                    await this.switchVersion(
                                        this.state.selectedByondVersion ??
                                            this.state.latestByondVersion,
                                        true
                                    );
                                }}>
                                <FontAwesomeIcon icon={faPlus} />
                            </Button>
                        </OverlayTrigger>
                    </InputGroup.Append>
                </InputGroup>
                <Form>
                    <OverlayTrigger
                        overlay={this.tooltip("generic.no_perm")}
                        show={!canInstallCustomByond ? undefined : false}>
                        <Form.File
                            custom
                            id="test"
                            disabled={!canInstallCustomByond}
                            className="w-md-50 w-lg-25 text-left"
                            label={
                                this.state.customFile ? (
                                    this.state.customFile.name
                                ) : (
                                    <FormattedMessage id="view.instance.engine.upload" />
                                )
                            }
                            accept=".zip"
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                this.setState({
                                    customFile: e.target.files ? e.target.files[0] : null
                                });
                            }}
                        />
                    </OverlayTrigger>
                </Form>
            </React.Fragment>
        );
    }
    private renderODInstall(): React.ReactNode {
        const canInstallCustomOD = hasEngineRight(
            this.context.instancePermissionSet,
            EngineRights.InstallCustomOpenDreamVersion
        );
        const canInstallAndSwitchOD = hasEngineRight(
            this.context.instancePermissionSet,
            EngineRights.InstallOfficialOrChangeActiveOpenDreamVersion
        );
        return (
            <React.Fragment>
                <h4>
                    <FormattedMessage id="view.instance.engine.add_od" />
                </h4>
                <InputGroup className="w-md-50 w-lg-25 mb-3 mx-auto">
                    <FormControl
                        type="string"
                        defaultValue={this.state.latestODVersion.sourceSHA!}
                        value={
                            (this.state.selectedODVersion ?? this.state.latestODVersion).sourceSHA!
                        }
                        onChange={e => {
                            this.setState({
                                selectedODVersion: {
                                    engine: EngineType.OpenDream,
                                    version: e.target.value
                                }
                            });
                        }}
                    />
                    <InputGroup.Append>
                        <OverlayTrigger
                            overlay={this.tooltip("generic.no_perm")}
                            show={!canInstallAndSwitchOD ? undefined : false}>
                            <Button
                                variant="success"
                                disabled={!canInstallAndSwitchOD}
                                onClick={async () => {
                                    await this.switchVersion(
                                        this.state.selectedODVersion ?? this.state.latestODVersion,
                                        true
                                    );
                                }}>
                                <FontAwesomeIcon icon={faPlus} />
                            </Button>
                        </OverlayTrigger>
                    </InputGroup.Append>
                </InputGroup>
                <Form>
                    <OverlayTrigger
                        overlay={this.tooltip("generic.no_perm")}
                        show={!canInstallCustomOD ? undefined : false}>
                        <Form.File
                            custom
                            id="test"
                            disabled={!canInstallCustomOD}
                            className="w-md-50 w-lg-25 text-left"
                            label={
                                this.state.customFile ? (
                                    this.state.customFile.name
                                ) : (
                                    <FormattedMessage id="view.instance.engine.upload" />
                                )
                            }
                            accept=".zip"
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                this.setState({
                                    customFile: e.target.files ? e.target.files[0] : null
                                });
                            }}
                        />
                    </OverlayTrigger>
                </Form>
            </React.Fragment>
        );
    }

    private makeUniqueStringForVersion(engineVersion?: EngineVersion): string {
        if (!engineVersion) {
            return "null-version";
        }

        return `${engineVersion.engine}-${engineVersion.version ?? "null"}-${
            engineVersion.sourceSHA ?? "null"
        }-${engineVersion.customIteration ?? "null"}`;
    }

    public static friendlyVersion(engineVersion: EngineVersion): string {
        let baseVersion: string;
        switch (engineVersion.engine) {
            case EngineType.Byond:
                baseVersion = engineVersion.version!;
                if (baseVersion.endsWith(".0")) {
                    baseVersion = baseVersion.substring(0, baseVersion.length - 2);
                }
                break;
            case EngineType.OpenDream:
                baseVersion = `OD-${engineVersion.sourceSHA!.substring(0, 7)}`;
                break;
            default:
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                throw new Error(`Unknown engine type: ${engineVersion.engine}`);
        }

        if (engineVersion.customIteration) {
            return `${baseVersion} (${engineVersion.customIteration})`;
        }

        return baseVersion;
    }
}
Engine.contextType = InstanceEditContext;
export default Engine;
