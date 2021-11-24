import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { ChangeEvent } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import FormControl from "react-bootstrap/FormControl";
import InputGroup from "react-bootstrap/InputGroup";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { FormattedMessage } from "react-intl";

import ByondClient from "../../../../ApiClient/ByondClient";
import { ByondResponse, ByondRights } from "../../../../ApiClient/generatedcode/generated";
import InternalError, { ErrorCode } from "../../../../ApiClient/models/InternalComms/InternalError";
import { StatusCode } from "../../../../ApiClient/models/InternalComms/InternalStatus";
import { InstanceEditContext } from "../../../../contexts/InstanceEditContext";
import { hasByondRight } from "../../../../utils/misc";
import { RouteData } from "../../../../utils/routes";
import ErrorAlert from "../../../utils/ErrorAlert";
import GenericAlert from "../../../utils/GenericAlert";
import { DebugJsonViewer } from "../../../utils/JsonViewer";
import Loading from "../../../utils/Loading";
import PageHelper from "../../../utils/PageHelper";

interface IProps {}

interface IState {
    errors: Array<InternalError<ErrorCode> | undefined>;
    versions: ByondResponse[];
    activeVersion?: string | null;
    latestVersion: string;
    selectedVersion: string;
    loading: boolean;
    customFile?: File | null;
    page: number;
    maxPage?: number;
}

class Byond extends React.Component<IProps, IState> {
    public declare context: InstanceEditContext;
    public constructor(props: IProps) {
        super(props);

        this.state = {
            versions: [],
            errors: [],
            activeVersion: "",
            latestVersion: "",
            selectedVersion: "",
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
        if (hasByondRight(this.context.instancePermissionSet, ByondRights.ListInstalled)) {
            const response = await ByondClient.listAllVersions(this.context.instance.id, {
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

        if (hasByondRight(this.context.instancePermissionSet, ByondRights.ReadActive)) {
            const response2 = await ByondClient.getActiveVersion(this.context.instance.id);
            if (response2.code === StatusCode.OK) {
                this.setState({
                    activeVersion: response2.payload.version
                });
            } else {
                this.addError(response2.error);
            }
        }
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
        await this.loadVersions();

        fetch("https://secure.byond.com/download/version.txt")
            .then(res => res.text())
            .then(data => data.split("\n"))
            .then(versions => versions[0])
            .then(version => {
                this.setState({
                    latestVersion: version,
                    selectedVersion: version,
                    loading: false
                });
            })
            .catch(e => {
                this.addError(new InternalError(ErrorCode.APP_FAIL, { jsError: Error(e) }));
                this.setState({
                    loading: false
                });
            });
    }

    public render(): React.ReactNode {
        if (this.state.loading) {
            return <Loading text="loading.instance" />;
        }

        const canSeeVersions = hasByondRight(
            this.context.instancePermissionSet,
            ByondRights.ListInstalled
        );
        const canSeeCurrent = hasByondRight(
            this.context.instancePermissionSet,
            ByondRights.ReadActive
        );
        const canInstallCustom = hasByondRight(
            this.context.instancePermissionSet,
            ByondRights.InstallCustomVersion
        );
        const canInstallAndSwitch = hasByondRight(
            this.context.instancePermissionSet,
            ByondRights.InstallOfficialOrChangeActiveVersion
        );

        const tooltip = (innerid?: string) => {
            if (!innerid) return <React.Fragment />;

            return (
                <Tooltip id={innerid}>
                    <FormattedMessage id={innerid} />
                </Tooltip>
            );
        };

        return (
            <div className="text-center">
                <DebugJsonViewer obj={this.state.versions} />
                <h1>
                    <FormattedMessage id="view.instance.byond" />
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
                            <GenericAlert title="view.instance.byond.current_denied" />
                        ) : null}
                        <div
                            onChange={async (e: ChangeEvent<HTMLInputElement>) => {
                                this.setState({
                                    loading: true
                                });
                                const response = await ByondClient.switchActive(
                                    this.context.instance.id,
                                    e.target.value
                                );
                                if (response.code === StatusCode.OK) {
                                    await this.loadVersions();
                                } else {
                                    this.addError(response.error);
                                }
                                this.setState({
                                    loading: false
                                });
                            }}>
                            {this.state.versions.map(version => {
                                // noinspection JSBitwiseOperatorUsage
                                return (
                                    <InputGroup
                                        className="w-md-25 mb-1 mx-auto d-flex"
                                        key={version.version}>
                                        {canInstallAndSwitch || canSeeCurrent ? (
                                            <InputGroup.Prepend>
                                                <InputGroup.Radio
                                                    name="byond"
                                                    id={version.version!}
                                                    value={version.version!}
                                                    disabled={!canInstallAndSwitch}
                                                    defaultChecked={
                                                        version.version! ===
                                                        this.state.activeVersion
                                                    }
                                                />
                                            </InputGroup.Prepend>
                                        ) : null}
                                        <label
                                            className="flex-grow-1 m-0"
                                            htmlFor={version.version!}>
                                            <OverlayTrigger
                                                overlay={tooltip("view.instance.byond.custom")}
                                                show={
                                                    !version.version!.endsWith(".0")
                                                        ? undefined
                                                        : false
                                                }>
                                                {({ ref, ...triggerHandler }) => (
                                                    <InputGroup.Text
                                                        className="w-100"
                                                        {...triggerHandler}>
                                                        {version.version!.endsWith(".0")
                                                            ? version.version!.substr(
                                                                  0,
                                                                  version.version!.length - 2
                                                              )
                                                            : version.version}
                                                        {!version.version!.endsWith(".0") ? (
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
                        <GenericAlert title="view.instance.byond.list_denied" />
                        <FormattedMessage
                            id="view.instance.byond.current_version"
                            values={{ version: this.state.activeVersion }}
                        />
                    </>
                ) : (
                    <GenericAlert title="view.instance.byond.current_and_list_denied" />
                )}
                <hr />
                <h4>
                    <FormattedMessage id="view.instance.byond.add" />
                </h4>
                <InputGroup className="w-md-50 w-lg-25 mb-3 mx-auto">
                    <FormControl
                        type="number"
                        defaultValue={this.state.latestVersion.split(".")[0]}
                        onChange={e => {
                            this.setState(prev => {
                                const arr = prev.selectedVersion.split(".");
                                arr[0] = e.target.value;
                                return {
                                    selectedVersion: arr.join(".")
                                };
                            });
                        }}
                    />
                    <InputGroup.Text className="rounded-0">.</InputGroup.Text>
                    <FormControl
                        type="number"
                        defaultValue={this.state.latestVersion.split(".")[1]}
                        onChange={e => {
                            this.setState(prev => {
                                const arr = prev.selectedVersion.split(".");
                                arr[1] = e.target.value;
                                return {
                                    selectedVersion: arr.join(".")
                                };
                            });
                        }}
                    />
                    <InputGroup.Append>
                        <OverlayTrigger
                            overlay={tooltip("generic.no_perm")}
                            show={!canInstallAndSwitch ? undefined : false}>
                            <Button
                                variant={canInstallAndSwitch ? "success" : "danger"}
                                disabled={!canInstallAndSwitch}
                                onClick={async () => {
                                    this.setState({
                                        loading: true
                                    });
                                    const response = await ByondClient.switchActive(
                                        this.context.instance.id,
                                        this.state.selectedVersion,
                                        this.state.customFile
                                            ? await this.state.customFile.arrayBuffer()
                                            : undefined
                                    );
                                    if (response.code === StatusCode.ERROR) {
                                        this.addError(response.error);
                                    } else {
                                        this.setState({
                                            customFile: null
                                        });
                                        await this.loadVersions();
                                    }
                                    this.setState({
                                        loading: false
                                    });
                                }}>
                                <FontAwesomeIcon icon="plus" />
                            </Button>
                        </OverlayTrigger>
                    </InputGroup.Append>
                </InputGroup>
                <Form>
                    <OverlayTrigger
                        overlay={tooltip("generic.no_perm")}
                        show={!canInstallCustom ? undefined : false}>
                        <Form.File
                            custom
                            id="test"
                            disabled={!canInstallCustom}
                            className="w-md-50 w-lg-25 text-left"
                            label={
                                this.state.customFile ? (
                                    this.state.customFile.name
                                ) : (
                                    <FormattedMessage id="view.instance.byond.upload" />
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
            </div>
        );
    }
}
Byond.contextType = InstanceEditContext;
export default Byond;
