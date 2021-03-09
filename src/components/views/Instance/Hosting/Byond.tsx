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
import { ByondRights } from "../../../../ApiClient/generatedcode/_enums";
import { Components } from "../../../../ApiClient/generatedcode/_generated";
import InternalError, { ErrorCode } from "../../../../ApiClient/models/InternalComms/InternalError";
import { StatusCode } from "../../../../ApiClient/models/InternalComms/InternalStatus";
import AccessDenied from "../../../utils/AccessDenied";
import ErrorAlert from "../../../utils/ErrorAlert";
import Loading from "../../../utils/Loading";

interface IProps {
    instance: Components.Schemas.InstanceResponse;
    selfPermissionSet: Components.Schemas.PermissionSet;
    selfInstancePermissionSet: Components.Schemas.InstancePermissionSetResponse;
}

interface IState {
    errors: Array<InternalError<ErrorCode> | undefined>;
    versions: Components.Schemas.ByondResponse[];
    activeVersion?: string | null;
    latestVersion: string;
    selectedVersion: string;
    loading: boolean;
    customFile?: File | null;
}

export default class Byond extends React.Component<IProps, IState> {
    public constructor(props: IProps) {
        super(props);

        this.state = {
            versions: [],
            errors: [],
            activeVersion: "",
            latestVersion: "",
            selectedVersion: "",
            loading: true
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
        const response = await ByondClient.listAllVersions(this.props.instance.id);
        if (response.code === StatusCode.OK) {
            this.setState({
                versions: response.payload.content
            });

            const response2 = await ByondClient.getActiveVersion(this.props.instance.id);
            if (response2.code === StatusCode.OK) {
                this.setState({
                    activeVersion: response2.payload.version
                });
            } else {
                this.addError(response2.error);
            }
        } else {
            this.addError(response.error);
        }
    }

    public async componentDidMount(): Promise<void> {
        await this.loadVersions();

        fetch("http://www.byond.com/download/version.txt")
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

        // noinspection JSBitwiseOperatorUsage
        if (
            !(
                this.props.selfInstancePermissionSet.byondRights & ByondRights.ListInstalled &&
                this.props.selfInstancePermissionSet.byondRights & ByondRights.ReadActive
            )
        ) {
            return <AccessDenied />;
        }

        const tooltip = (innerid?: string) => {
            if (!innerid) return <React.Fragment />;

            return (
                <Tooltip id={innerid}>
                    <FormattedMessage id={innerid} />
                </Tooltip>
            );
        };

        return (
            <div>
                <h1>
                    <FormattedMessage id="view.instance.hosting.byond" />
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
                <div
                    onChange={async (e: ChangeEvent<HTMLInputElement>) => {
                        this.setState({
                            loading: true
                        });
                        const response = await ByondClient.switchActive(
                            this.props.instance.id,
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
                            <InputGroup className="w-25 mb-1 mx-auto d-flex" key={version.version}>
                                <InputGroup.Prepend>
                                    <InputGroup.Radio
                                        disabled={
                                            !(
                                                this.props.selfInstancePermissionSet.byondRights &
                                                ByondRights.InstallOfficialOrChangeActiveVersion
                                            )
                                        }
                                        name="byond"
                                        id={version.version!}
                                        value={version.version!}
                                        defaultChecked={
                                            version.version! === this.state.activeVersion
                                        }
                                    />
                                </InputGroup.Prepend>
                                <InputGroup.Append
                                    className="flex-grow-1 m-0"
                                    as="label"
                                    htmlFor={version.version!}>
                                    <OverlayTrigger
                                        overlay={tooltip("view.instance.hosting.byond.custom")}
                                        show={!version.version!.endsWith(".0") ? undefined : false}>
                                        {({ ref, ...triggerHandler }) => (
                                            <InputGroup.Text className="w-100" {...triggerHandler}>
                                                {version.version!.endsWith(".0")
                                                    ? version.version!.substr(
                                                          0,
                                                          version.version!.length - 2
                                                      )
                                                    : version.version}
                                                {!version.version!.endsWith(".0") ? (
                                                    <div
                                                        className={"ml-auto"}
                                                        ref={ref as React.Ref<HTMLDivElement>}>
                                                        <FontAwesomeIcon fixedWidth icon="info" />
                                                    </div>
                                                ) : null}
                                            </InputGroup.Text>
                                        )}
                                    </OverlayTrigger>
                                </InputGroup.Append>
                            </InputGroup>
                        );
                    })}
                </div>
                <hr />
                <h4>
                    <FormattedMessage id="view.instance.hosting.byond.add" />
                </h4>
                <InputGroup className="w-25 mb-3 mx-auto">
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
                        <Button
                            variant="success"
                            onClick={async () => {
                                this.setState({
                                    loading: true
                                });
                                const response = await ByondClient.switchActive(
                                    this.props.instance.id,
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
                    </InputGroup.Append>
                </InputGroup>
                <Form>
                    <Form.File
                        custom
                        id="test"
                        className="w-25 text-left"
                        label={
                            this.state.customFile ? (
                                this.state.customFile.name
                            ) : (
                                <FormattedMessage id="view.instance.hosting.byond.upload" />
                            )
                        }
                        accept=".zip"
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            this.setState({
                                customFile: e.target.files ? e.target.files[0] : null
                            });
                        }}
                    />
                </Form>
            </div>
        );
    }
}
