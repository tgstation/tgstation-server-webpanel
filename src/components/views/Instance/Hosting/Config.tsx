import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { ChangeEvent } from "react";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import CardColumns from "react-bootstrap/CardColumns";
import Table from "react-bootstrap/esm/Table";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { FormattedMessage } from "react-intl";

import ByondClient from "../../../../ApiClient/ByondClient";
import {
    ByondRights,
    ConfigurationType,
    InstanceManagerRights
} from "../../../../ApiClient/generatedcode/_enums";
import { Components } from "../../../../ApiClient/generatedcode/_generated";
import InstanceClient from "../../../../ApiClient/InstanceClient";
import InternalError, { ErrorCode } from "../../../../ApiClient/models/InternalComms/InternalError";
import { StatusCode } from "../../../../ApiClient/models/InternalComms/InternalStatus";
import { ErrorAlert, InputField, Loading } from "../../../utils";

interface IProps {
    instance: Components.Schemas.InstanceResponse;
    selfPermissionSet: Components.Schemas.PermissionSet;
    selfInstancePermissionSet: Components.Schemas.InstancePermissionSetResponse;
    loadInstance: () => Promise<void>;
}

interface IState {
    errors: Array<InternalError<ErrorCode> | undefined>;
    loading: boolean;
    // Config stuff
    canEdit: boolean;
    switchingConfigs: boolean;
    modifiedValues: { [key: string]: string | number };
    // Byond stuff
    versions: Components.Schemas.ByondResponse[];
    activeVersion?: string | null;
    latestVersion: string;
    latestBetaVersion: string;
    selectedVersion: string;
    looadingChangingVersion: boolean;
    customFile?: File | null;
}

export default class Config extends React.Component<IProps, IState> {
    public constructor(props: IProps) {
        super(props);

        this.state = {
            errors: [],
            loading: true,
            // Config stuff
            switchingConfigs: false,
            canEdit: false,
            modifiedValues: {
                name: this.props.instance.name,
                path: this.props.instance.path,
                chatBotLimit: this.props.instance.chatBotLimit,
                autoUpdateInterval: this.props.instance.autoUpdateInterval,
                configurationType: this.props.instance.configurationType
            },
            // BYOND Stuff
            versions: [],
            activeVersion: "",
            latestVersion: "",
            latestBetaVersion: "",
            selectedVersion: "",
            looadingChangingVersion: false
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

    public async componentDidMount(): Promise<void> {
        await this.loadVersions();
        await fetch("https://secure.byond.com/download/version.txt")
            .then(res => res.text())
            .then(data => data.split("\n"))
            .then(versions => {
                this.setState({
                    latestVersion: versions[0],
                    selectedVersion: versions[0],
                    latestBetaVersion: versions[1]
                });
            })
            .catch(e => {
                this.addError(new InternalError(ErrorCode.APP_FAIL, { jsError: Error(e) }));
            });
        this.setState({
            loading: false
        });
    }
    // Load byond vers from the server
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
                return true;
            } else {
                this.addError(response2.error);
            }
        } else {
            this.addError(response.error);
        }
        return false;
    }

    private async editInstance(instance: Omit<Components.Schemas.InstanceUpdateRequest, "id">) {
        this.setState({
            switchingConfigs: true
        });
        const response = await InstanceClient.editInstance({
            ...instance,
            id: this.props.instance.id
        });
        if (response.code === StatusCode.ERROR) {
            this.addError(response.error);
        } else {
            await this.props.loadInstance();
        }
        this.setState({
            switchingConfigs: false
        });
    }

    private checkIMFlag(flag: InstanceManagerRights): boolean {
        return !!(this.props.selfPermissionSet.instanceManagerRights & flag);
    }

    private saveConfigChanges() {
        // checks one per one
        const shipping: { [key: string]: string | number } = {};
        const errors = [];
        if (
            !this.checkIMFlag(InstanceManagerRights.Rename) &&
            this.state.modifiedValues.name != this.props.instance.name
        ) {
            errors.push("Tried to rename but access is denied!");
        } else if (this.state.modifiedValues.name != this.props.instance.name) {
            shipping["name"] = this.state.modifiedValues.name;
        }
        if (
            !this.checkIMFlag(InstanceManagerRights.Relocate) &&
            this.state.modifiedValues.path != this.props.instance.path
        ) {
            //Yes, it changed BUT
            errors.push("Tried to change path but access is denied!");
        } else if (this.state.modifiedValues.path != this.props.instance.path) {
            shipping["path"] = this.state.modifiedValues.path;
        }
        if (
            !this.checkIMFlag(InstanceManagerRights.SetChatBotLimit) &&
            this.state.modifiedValues.chatBotLimit != this.props.instance.chatBotLimit
        ) {
            //Yes, it changed BUT
            errors.push("Tried to change chatBotLimit but access is denied!");
        } else if (this.state.modifiedValues.chatBotLimit != this.props.instance.chatBotLimit) {
            shipping["chatBotLimit"] = this.state.modifiedValues.chatBotLimit;
        }
        if (
            !this.checkIMFlag(InstanceManagerRights.SetAutoUpdate) &&
            this.state.modifiedValues.autoUpdateInterval != this.props.instance.autoUpdateInterval
        ) {
            //Yes, it changed BUT
            errors.push("Tried to change autoUpdateInterval but access is denied!");
        } else if (
            this.state.modifiedValues.autoUpdateInterval != this.props.instance.autoUpdateInterval
        ) {
            shipping["autoUpdateInterval"] = this.state.modifiedValues.autoUpdateInterval;
        }
        if (
            !this.checkIMFlag(InstanceManagerRights.SetConfiguration) &&
            this.state.modifiedValues.configurationType != this.props.instance.configurationType
        ) {
            //Yes, it changed BUT
            errors.push("Tried to change configurationType but access is denied!");
        } else if (
            this.state.modifiedValues.configurationType != this.props.instance.configurationType
        ) {
            shipping["configurationType"] = this.state.modifiedValues.configurationType;
        }
        if (!shipping || Object.keys(shipping).length === 0) {
            return errors;
        }
        console.info("after", shipping);
        void this.editInstance(shipping);
        return errors;
    }

    public render(): React.ReactNode {
        if (this.state.loading) {
            return <Loading text="loading.instance" />;
        }

        const canEditBYOND =
            this.props.selfInstancePermissionSet.byondRights & ByondRights.ListInstalled &&
            this.props.selfInstancePermissionSet.byondRights & ByondRights.ReadActive;

        const invalidMajor =
            this.state.selectedVersion.split(".")[0] > this.state.latestBetaVersion.split(".")[0];

        const invalidMinor =
            this.state.selectedVersion.split(".")[1] > this.state.latestBetaVersion.split(".")[1];

        const validateName = () => {
            const error_reasons: Array<string> = [];
            if (!this.state.modifiedValues.name || this.state.modifiedValues.name === "")
                error_reasons.push("Name is needed.");
            if (String(this.state.modifiedValues.name).length > 100)
                error_reasons.push("Max length reached.");
            return error_reasons;
        };

        const validatePath = () => {
            const error_reasons: Array<string> = [];
            if (!this.state.modifiedValues.path || this.state.modifiedValues.path === "")
                error_reasons.push("Path is needed.");
            // if ( HELP HOW DO I REGEX PATHS!
            //     this.state.modifiedValues.path &&
            //     !String(this.state.modifiedValues.path).match(RegExp(/^\/|\/\/|(\/[\w-]+)+$/i))
            // )
            //     error_reasons.push("Path is not valid!");
            return error_reasons;
        };

        return (
            <CardColumns className={"card-colum-cfg"}>
                <Card>
                    <Card.Header>
                        <FormattedMessage id="view.instance.config.instancesettings" />
                    </Card.Header>
                    <Card.Body>
                        {/* Todo: modularize the optiony thingies */}
                        {/* Name */}
                        <Card.Title>
                            <FormattedMessage id="view.instance.hosting.config.instance.name" />
                        </Card.Title>
                        <Form.Group>
                            <InputGroup
                                // ts-salt YES I KNOW IT'S INVALID (or well it should) BUT IT COMPILES AND WORKS!
                                hasValidation>
                                <Form.Control
                                    type="text"
                                    key="test"
                                    disabled={!this.checkIMFlag(InstanceManagerRights.Rename)}
                                    defaultValue={this.props.instance.name}
                                    placeholder="Name of the instance"
                                    value={this.state.modifiedValues.name}
                                    onChange={e => {
                                        this.setState({
                                            modifiedValues: {
                                                ...this.state.modifiedValues,
                                                name: e.currentTarget.value
                                            }
                                        });
                                    }}
                                    isInvalid={!!validateName().length}
                                />
                                {this.state.modifiedValues.name !== this.props.instance.name && (
                                    <InputGroup.Append>
                                        <Button
                                            variant="secondary"
                                            onClick={() => {
                                                this.setState({
                                                    modifiedValues: {
                                                        ...this.state.modifiedValues,
                                                        name: this.props.instance.name
                                                    }
                                                });
                                            }}>
                                            <FontAwesomeIcon fixedWidth icon="undo" />
                                        </Button>
                                    </InputGroup.Append>
                                )}
                                <Form.Control.Feedback type="invalid">
                                    {validateName().toString()}
                                </Form.Control.Feedback>
                            </InputGroup>
                            <Form.Text muted>
                                <FormattedMessage id="view.instance.hosting.config.instance.name.desc" />{" "}
                                <code>100</code>.
                            </Form.Text>
                        </Form.Group>
                        {/* Path */}
                        <Card.Title>
                            <FormattedMessage id="view.instance.hosting.config.instance.path" />
                        </Card.Title>
                        <Form.Group>
                            <InputGroup
                                // ts-salt YES I KNOW IT'S INVALID (or well it should) BUT IT COMPILES AND WORKS!
                                hasValidation>
                                <Form.Control
                                    required
                                    placeholder="Path of the instance"
                                    disabled={!this.checkIMFlag(InstanceManagerRights.Relocate)}
                                    value={this.state.modifiedValues.path}
                                    onChange={e => {
                                        this.setState({
                                            modifiedValues: {
                                                ...this.state.modifiedValues,
                                                path: e.currentTarget.value
                                            }
                                        });
                                    }}
                                    isInvalid={!!validatePath().length}
                                />
                                {this.state.modifiedValues.path !== this.props.instance.path && (
                                    <InputGroup.Append>
                                        <Button
                                            variant="secondary"
                                            onClick={() => {
                                                this.setState({
                                                    modifiedValues: {
                                                        ...this.state.modifiedValues,
                                                        path: this.props.instance.path
                                                    }
                                                });
                                            }}>
                                            <FontAwesomeIcon fixedWidth icon="undo" />
                                        </Button>
                                    </InputGroup.Append>
                                )}
                                <Form.Control.Feedback type="invalid">
                                    {validatePath().toString()}
                                </Form.Control.Feedback>
                            </InputGroup>
                            <Form.Text muted>
                                <FormattedMessage id="view.instance.hosting.config.instance.path.desc" />
                            </Form.Text>
                        </Form.Group>
                        {/* Chatbot */}
                        <Card.Title>
                            <FormattedMessage id="view.instance.hosting.config.instance.chatbot" />
                        </Card.Title>
                        <Form.Group>
                            <InputGroup>
                                <Form.Control
                                    required
                                    placeholder="Chatbot Limit of the instance"
                                    type="number"
                                    disabled={
                                        !this.checkIMFlag(InstanceManagerRights.SetChatBotLimit)
                                    }
                                    value={Number(this.state.modifiedValues.chatBotLimit)}
                                    onChange={e => {
                                        this.setState({
                                            modifiedValues: {
                                                ...this.state.modifiedValues,
                                                chatBotLimit: Number(e.currentTarget.value)
                                                    ? Number(e.currentTarget.value)
                                                    : 0
                                            }
                                        });
                                    }}
                                />
                                {this.state.modifiedValues.chatBotLimit !==
                                    this.props.instance.chatBotLimit && (
                                    <InputGroup.Append>
                                        <Button
                                            variant="secondary"
                                            onClick={() => {
                                                this.setState({
                                                    modifiedValues: {
                                                        ...this.state.modifiedValues,
                                                        chatBotLimit: this.props.instance
                                                            .chatBotLimit
                                                    }
                                                });
                                            }}>
                                            <FontAwesomeIcon fixedWidth icon="undo" />
                                        </Button>
                                    </InputGroup.Append>
                                )}
                            </InputGroup>
                            <Form.Text muted>
                                <FormattedMessage id="view.instance.hosting.config.instance.chatbot.desc" />
                            </Form.Text>
                        </Form.Group>
                        {/* Autoupdate */}
                        <Card.Title>
                            <FormattedMessage id="view.instance.hosting.config.instance.autoupdate" />
                        </Card.Title>
                        <Form.Group>
                            <InputGroup>
                                <Form.Control
                                    type={"number"}
                                    disabled={
                                        !this.checkIMFlag(InstanceManagerRights.SetAutoUpdate)
                                    }
                                    value={Number(this.state.modifiedValues.autoUpdateInterval)}
                                    onChange={e => {
                                        this.setState({
                                            modifiedValues: {
                                                ...this.state.modifiedValues,
                                                autoUpdateInterval: Number(e.currentTarget.value)
                                                    ? Number(e.currentTarget.value)
                                                    : 0
                                            }
                                        });
                                    }}
                                />
                                {this.state.modifiedValues.autoUpdateInterval !==
                                    this.props.instance.autoUpdateInterval && (
                                    <InputGroup.Append>
                                        <Button
                                            variant="secondary"
                                            onClick={() => {
                                                this.setState({
                                                    modifiedValues: {
                                                        ...this.state.modifiedValues,
                                                        autoUpdateInterval: this.props.instance
                                                            .autoUpdateInterval
                                                    }
                                                });
                                            }}>
                                            <FontAwesomeIcon fixedWidth icon="undo" />
                                        </Button>
                                    </InputGroup.Append>
                                )}
                            </InputGroup>
                            <Form.Text muted>
                                <FormattedMessage id="view.instance.hosting.config.instance.autoupdate.desc" />
                            </Form.Text>
                        </Form.Group>
                        {/* File mode */}
                        <Card.Title>
                            <FormattedMessage id="view.instance.hosting.config.instance.filemode" />
                        </Card.Title>
                        <Form.Group>
                            <InputGroup>
                                <Form.Control
                                    defaultValue={this.props.instance.configurationType}
                                    as="select"
                                    placeholder="Hi!"
                                    disabled={
                                        !this.checkIMFlag(InstanceManagerRights.SetConfiguration)
                                    }
                                    value={this.state.modifiedValues.configurationType}
                                    onChange={e => {
                                        this.setState({
                                            modifiedValues: {
                                                ...this.state.modifiedValues,
                                                configurationType: Number(e.currentTarget.value)
                                            }
                                        });
                                    }}>
                                    {Object.values(ConfigurationType)
                                        .filter(val => isNaN(parseInt(val as string)))
                                        .map((v, k) => (
                                            <FormattedMessage
                                                key={v}
                                                id={`fields.instance.filemode.${v}`}>
                                                {message => <option value={k}>{message}</option>}
                                            </FormattedMessage>
                                        ))}
                                </Form.Control>
                                {this.state.modifiedValues.configurationType !==
                                    this.props.instance.configurationType && (
                                    <InputGroup.Append>
                                        <Button
                                            variant="secondary"
                                            onClick={() => {
                                                this.setState({
                                                    modifiedValues: {
                                                        ...this.state.modifiedValues,
                                                        configurationType: this.props.instance
                                                            .configurationType
                                                    }
                                                });
                                            }}>
                                            <FontAwesomeIcon fixedWidth icon="undo" />
                                        </Button>
                                    </InputGroup.Append>
                                )}
                            </InputGroup>
                            <Form.Text muted>
                                <FormattedMessage id="view.instance.hosting.config.instance.filemode.desc" />
                            </Form.Text>
                        </Form.Group>
                        <Button
                            size="sm"
                            onClick={() => {
                                this.saveConfigChanges();
                            }}
                            disabled={this.state.switchingConfigs}>
                            <FormattedMessage id="generic.save" />
                        </Button>
                    </Card.Body>
                </Card>
                {/* Cards for BYOND stuff */}
                {/* BYOND List */}
                <Card>
                    <Card.Header>
                        <FormattedMessage id="view.instance.hosting.config.byond.add" />
                    </Card.Header>
                    <Card.Body>
                        <Card.Title>
                            <FormattedMessage id="view.instance.hosting.config.byond.add.title" />
                        </Card.Title>
                        <Form.Group>
                            <Form.Label>
                                <FormattedMessage
                                    id="view.instance.hosting.config.byond.add.versions"
                                    values={{
                                        latest: this.state.latestVersion,
                                        beta: this.state.latestBetaVersion
                                    }}
                                />
                            </Form.Label>
                            <InputGroup hasValidation>
                                <Form.Control
                                    disabled={!canEditBYOND || this.state.looadingChangingVersion}
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
                                    isInvalid={invalidMajor}
                                />
                                <InputGroup.Prepend>
                                    <InputGroup.Text>.</InputGroup.Text>
                                </InputGroup.Prepend>
                                <Form.Control
                                    disabled={!canEditBYOND || this.state.looadingChangingVersion}
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
                                    isInvalid={invalidMinor}
                                />
                                <InputGroup.Append>
                                    <Button
                                        variant="success"
                                        onClick={async () => {
                                            this.setState({
                                                looadingChangingVersion: true
                                            });
                                            const response = await ByondClient.switchActive(
                                                this.props.instance.id,
                                                this.state.selectedVersion
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
                                                looadingChangingVersion: false
                                            });
                                            setImmediate(() => {
                                                this.forceUpdate();
                                            }, 3);
                                        }}
                                        disabled={
                                            invalidMajor ||
                                            invalidMinor ||
                                            !canEditBYOND ||
                                            this.state.looadingChangingVersion
                                        }>
                                        <FontAwesomeIcon icon="plus" />
                                    </Button>
                                </InputGroup.Append>
                                <Form.Control.Feedback type="invalid" tooltip>
                                    <FormattedMessage
                                        id="view.instance.hosting.config.byond.add.invalid"
                                        values={{
                                            majorminor: invalidMajor ? (
                                                invalidMinor ? (
                                                    <FormattedMessage id="view.instance.hosting.config.byond.add.invalid.both" />
                                                ) : (
                                                    <FormattedMessage id="view.instance.hosting.config.byond.add.invalid.major" />
                                                )
                                            ) : (
                                                <FormattedMessage id="view.instance.hosting.config.byond.add.invalid.minor" />
                                            )
                                        }}
                                    />
                                </Form.Control.Feedback>
                            </InputGroup>
                            <Form.Text muted>
                                <FormattedMessage id="view.instance.hosting.config.byond.add.desc" />
                            </Form.Text>
                        </Form.Group>
                        <Card.Title>
                            <FormattedMessage id="view.instance.hosting.config.byond.upload.fys" />
                        </Card.Title>
                        <Form.Group>
                            <InputGroup>
                                <Form.File
                                    custom
                                    id="test"
                                    label={
                                        this.state.customFile ? (
                                            this.state.customFile.name
                                        ) : (
                                            <FormattedMessage id="view.instance.hosting.config.byond.upload" />
                                        )
                                    }
                                    data-browse="Upload"
                                    accept=".zip"
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                        this.setState({
                                            customFile: e.target.files ? e.target.files[0] : null
                                        });
                                    }}
                                    disabled={!canEditBYOND || this.state.looadingChangingVersion}
                                />
                                <InputGroup.Append>
                                    <Button
                                        variant="success"
                                        onClick={async () => {
                                            this.setState({
                                                looadingChangingVersion: true
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
                                                looadingChangingVersion: false
                                            });
                                        }}
                                        disabled={
                                            invalidMajor ||
                                            invalidMinor ||
                                            !canEditBYOND ||
                                            !this.state.customFile ||
                                            this.state.looadingChangingVersion
                                        }>
                                        <FontAwesomeIcon icon="upload" />
                                    </Button>
                                </InputGroup.Append>
                            </InputGroup>
                        </Form.Group>
                    </Card.Body>
                </Card>
                {/* BYOND Version list */}
                <Card>
                    <Card.Header>
                        <FormattedMessage id="view.instance.hosting.config.byond" />
                    </Card.Header>
                    <Card.Body>
                        <Card.Title>Installed Versions</Card.Title>
                        {this.state.versions.map(version => {
                            return (
                                <InputGroup
                                    key={version.version}
                                    onChange={async (e: ChangeEvent<HTMLInputElement>) => {
                                        this.setState({
                                            looadingChangingVersion: true
                                        });
                                        if (!(e.target.value in this.state.versions)) {
                                            this.setState({
                                                looadingChangingVersion: false
                                            });
                                            return; // nice one kappa
                                        }
                                        const response = await ByondClient.switchActive(
                                            this.props.instance.id,
                                            e.target.value
                                        );
                                        if (response.code === StatusCode.OK) {
                                            await this.loadVersions();
                                        } else {
                                            this.addError(response.error);
                                            this.setState({
                                                looadingChangingVersion: false
                                            });
                                            return;
                                        }
                                        this.setState({
                                            looadingChangingVersion: false
                                        });
                                    }}>
                                    <InputGroup.Prepend>
                                        <InputGroup.Radio
                                            disabled={
                                                !(
                                                    this.props.selfInstancePermissionSet
                                                        .byondRights &
                                                    ByondRights.InstallOfficialOrChangeActiveVersion
                                                ) ||
                                                this.state.looadingChangingVersion ||
                                                !canEditBYOND
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
                                            overlay={
                                                <Tooltip
                                                    id={
                                                        "view.instance.hosting.config.byond.custom"
                                                    }>
                                                    <FormattedMessage
                                                        id={
                                                            "view.instance.hosting.config.byond.custom"
                                                        }
                                                    />
                                                </Tooltip>
                                            }
                                            placement="left"
                                            show={
                                                !version.version!.endsWith(".0") ? undefined : false
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
                                                            ref={ref as React.Ref<HTMLDivElement>}>
                                                            <FontAwesomeIcon
                                                                fixedWidth
                                                                icon="info"
                                                            />
                                                        </div>
                                                    ) : null}
                                                </InputGroup.Text>
                                            )}
                                        </OverlayTrigger>
                                    </InputGroup.Append>
                                </InputGroup>
                            );
                        })}
                    </Card.Body>
                </Card>
            </CardColumns>
        );
    }

    private renderIFF(): React.ReactNode {
        const setCanEdit = (value: boolean) => {
            this.setState({
                canEdit: value
            });
        };
        return (
            <>
                <InputField
                    name="instance.path"
                    defaultValue={this.props.instance.path}
                    type="str"
                    onChange={async newval => {
                        await this.editInstance({ path: newval });
                    }}
                    disabled={!this.checkIMFlag(InstanceManagerRights.Relocate)}
                    setEditLock={setCanEdit}
                    editLock={this.state.canEdit}
                />
                <InputField
                    name=""
                    defaultValue={this.props.instance.name}
                    type="str"
                    onChange={async newval => {
                        await this.editInstance({ name: newval });
                    }}
                    disabled={!this.checkIMFlag(InstanceManagerRights.Rename)}
                    setEditLock={setCanEdit}
                    editLock={this.state.canEdit}
                />
                <InputField
                    name="instance.chatbotlimit"
                    defaultValue={this.props.instance.chatBotLimit}
                    type="num"
                    onChange={async newval => {
                        await this.editInstance({ chatBotLimit: newval });
                    }}
                    disabled={!this.checkIMFlag(InstanceManagerRights.SetChatBotLimit)}
                    setEditLock={setCanEdit}
                    editLock={this.state.canEdit}
                />
                <InputField
                    name="instance.autoupdate"
                    defaultValue={this.props.instance.autoUpdateInterval}
                    type="num"
                    onChange={async newval => {
                        await this.editInstance({
                            autoUpdateInterval: newval
                        });
                    }}
                    disabled={!this.checkIMFlag(InstanceManagerRights.SetAutoUpdate)}
                    setEditLock={setCanEdit}
                    editLock={this.state.canEdit}
                />
                <InputField
                    name="instance.filemode"
                    defaultValue={ConfigurationType[this.props.instance.configurationType]}
                    type="enum"
                    enum={ConfigurationType}
                    onChange={async newval => {
                        await this.editInstance({
                            // @ts-expect-error typescript isnt a fan of using enums like this
                            configurationType: ConfigurationType[newval] as 0 | 1 | 2
                        });
                    }}
                    disabled={!this.checkIMFlag(InstanceManagerRights.SetConfiguration)}
                    setEditLock={setCanEdit}
                    editLock={this.state.canEdit}
                />
            </>
        );
    }
}
