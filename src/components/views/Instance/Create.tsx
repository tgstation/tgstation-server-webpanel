import React from "react";
import { Alert, Tab, Tabs } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import { FormattedMessage } from "react-intl";
import { RouteComponentProps, withRouter } from "react-router-dom";
import YAML from "yaml";

import ByondClient from "../../../ApiClient/ByondClient";
import ConfigurationFileClient from "../../../ApiClient/ConfigurationFileClient";
import DreamDaemonClient from "../../../ApiClient/DreamDaemonClient";
import DreamMakerClient from "../../../ApiClient/DreamMakerClient";
import { ConfigurationType, DreamDaemonSecurity } from "../../../ApiClient/generatedcode/generated";
import InstanceClient from "../../../ApiClient/InstanceClient";
import InternalError, { ErrorCode } from "../../../ApiClient/models/InternalComms/InternalError";
import { StatusCode } from "../../../ApiClient/models/InternalComms/InternalStatus";
import RepositoryClient from "../../../ApiClient/RepositoryClient";
import JobsController from "../../../ApiClient/util/JobsController";
import { GeneralContext } from "../../../contexts/GeneralContext";
import GithubClient from "../../../utils/GithubClient";
import ITGSYml, { getTGSYmlSecurity } from "../../../utils/ITGSYml";
import { AppRoutes, RouteData } from "../../../utils/routes";
import ErrorAlert from "../../utils/ErrorAlert";
import Loading from "../../utils/Loading";

interface IState {
    loading: boolean;
    errors: Array<InternalError<ErrorCode> | undefined>;
    instanceName?: string;
    instancePath?: string;
    repoOwner?: string;
    repoName?: string;
    accessUser?: string;
    accessToken?: string;
    prefix?: string;
    tab: string;
    performingQuickSetup: boolean;
    quickSetupStages: React.ReactNode[];
}

interface IProps extends RouteComponentProps {}

class InstanceCreate extends React.Component<IProps, IState> {
    public declare context: GeneralContext;
    public constructor(props: IProps, context: GeneralContext) {
        super(props);
        this.state = {
            loading: false,
            errors: [],
            prefix: context.serverInfo.validInstancePaths?.length
                ? context.serverInfo.validInstancePaths[0]
                : undefined,
            tab: "quick",
            performingQuickSetup: false,
            quickSetupStages: []
        };

        this.submit = this.submit.bind(this);
        this.quickStart = this.quickStart.bind(this);
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

    public render(): React.ReactNode {
        if (this.state.loading) {
            return <Loading text="view.instance.create.loading" />;
        }

        const validInstancePaths = this.context.serverInfo.validInstancePaths;
        return (
            <div className="text-center">
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
                <h3>
                    <FormattedMessage id="view.instance.create.title" />
                </h3>
                {this.state.performingQuickSetup ? (
                    <div>
                        <Loading text="view.instance.create.quick.active" />
                        <ul>{this.state.quickSetupStages}</ul>
                    </div>
                ) : (
                    <Tabs
                        activeKey={this.state.tab}
                        onSelect={(newkey: string | null) => {
                            if (!newkey) return;

                            this.setState({
                                tab: newkey
                            });
                        }}
                        id="create-instance-tabs"
                        className="justify-content-center mb-3 mt-4 flex-column flex-md-row">
                        <Tab
                            eventKey="quick"
                            title={<FormattedMessage id="view.instance.create.quick" />}>
                            {this.renderQuickSetup()}
                        </Tab>
                        <Tab
                            eventKey="manual"
                            title={<FormattedMessage id="view.instance.create.manual" />}>
                            <Form onSubmit={this.submit}>
                                <Col className="mx-auto" lg={5} md={8}>
                                    <Form.Group controlId="name">
                                        <Form.Label>
                                            <h5>
                                                <FormattedMessage id="view.instance.create.name" />
                                            </h5>
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            onChange={event => {
                                                const instanceName = event.target.value;
                                                this.setState({
                                                    instanceName
                                                });
                                            }}
                                            value={this.state.instanceName}
                                            required
                                        />
                                    </Form.Group>
                                    <Form.Group controlId="path">
                                        <Form.Label>
                                            <h5>
                                                <FormattedMessage id="view.instance.create.path" />
                                            </h5>
                                        </Form.Label>
                                        <InputGroup className="mb-1">
                                            {validInstancePaths != null ? (
                                                <InputGroup.Prepend className="flex-grow-1 flex-grow-md-0">
                                                    <InputGroup.Text>
                                                        <span>
                                                            <FormattedMessage id="view.instance.create.path.prefix" />
                                                        </span>
                                                    </InputGroup.Text>
                                                    <Form.Control
                                                        className="rounded-0 flex-grow-1 flex-grow-md-0 flex-shrink-0 flex-shrink-md-1 w-auto"
                                                        as="select"
                                                        custom
                                                        required
                                                        onChange={event => {
                                                            this.setState({
                                                                prefix: event.target.value
                                                            });
                                                        }}>
                                                        {validInstancePaths.map(validPath => {
                                                            return (
                                                                <option
                                                                    key={validPath}
                                                                    value={validPath}
                                                                    selected={
                                                                        this.state.prefix ==
                                                                        validPath
                                                                    }>
                                                                    {validPath}/
                                                                </option>
                                                            );
                                                        })}
                                                    </Form.Control>
                                                </InputGroup.Prepend>
                                            ) : null}
                                            <Form.Control
                                                type="text"
                                                className="flex-grow-1 w-100 w-md-auto"
                                                required
                                                onChange={event => {
                                                    const instancePath = event.target.value;
                                                    this.setState({
                                                        instancePath
                                                    });
                                                }}
                                                value={this.state.instancePath}
                                            />
                                        </InputGroup>
                                    </Form.Group>
                                    <Button type="submit" variant="success">
                                        <FormattedMessage id="view.instance.create.submit" />
                                    </Button>
                                </Col>
                            </Form>
                        </Tab>
                    </Tabs>
                )}
            </div>
        );
    }

    private renderQuickSetup(): React.ReactNode {
        const validInstancePaths = this.context.serverInfo.validInstancePaths;
        return (
            <div>
                <Alert className="clearfix" variant="primary">
                    <FormattedMessage
                        id="view.instance.create.quick.notice"
                        values={{ br: <br /> }}
                    />
                </Alert>
                <Alert className="clearfix" variant="error">
                    <FormattedMessage id="view.instance.create.quick.warning" />
                </Alert>
                <Form onSubmit={this.quickStart}>
                    <Col className="mx-auto" lg={5} md={8}>
                        <Form.Group controlId="quickname">
                            <Form.Label>
                                <h5>
                                    <FormattedMessage id="view.instance.create.name" />
                                </h5>
                            </Form.Label>
                            <Form.Control
                                type="text"
                                onChange={event => {
                                    const instanceName = event.target.value;
                                    this.setState({
                                        instanceName
                                    });
                                }}
                                value={this.state.instanceName}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="quickpath">
                            <Form.Label>
                                <h5>
                                    <FormattedMessage id="view.instance.create.path" />
                                </h5>
                            </Form.Label>
                            <InputGroup className="mb-1">
                                {validInstancePaths != null ? (
                                    <InputGroup.Prepend className="flex-grow-1 flex-grow-md-0">
                                        <InputGroup.Text>
                                            <span>
                                                <FormattedMessage id="view.instance.create.path.prefix" />
                                            </span>
                                        </InputGroup.Text>
                                        <Form.Control
                                            className="rounded-0 flex-grow-1 flex-grow-md-0 flex-shrink-0 flex-shrink-md-1 w-auto"
                                            as="select"
                                            custom
                                            required
                                            onChange={event => {
                                                this.setState({
                                                    prefix: event.target.value
                                                });
                                            }}>
                                            {validInstancePaths.map(validPath => {
                                                return (
                                                    <option
                                                        key={validPath}
                                                        value={validPath}
                                                        selected={this.state.prefix == validPath}>
                                                        {validPath}/
                                                    </option>
                                                );
                                            })}
                                        </Form.Control>
                                    </InputGroup.Prepend>
                                ) : null}
                                <Form.Control
                                    type="text"
                                    className="flex-grow-1 w-100 w-md-auto"
                                    required
                                    onChange={event => {
                                        const instancePath = event.target.value;
                                        this.setState({
                                            instancePath
                                        });
                                    }}
                                    value={this.state.instancePath}
                                />
                            </InputGroup>
                        </Form.Group>
                        <Form.Group controlId="repoowner">
                            <Form.Label>
                                <h5>
                                    <FormattedMessage id="view.instance.create.repo_owner" />
                                </h5>
                            </Form.Label>
                            <InputGroup className="mb-1">
                                <Form.Control
                                    type="text"
                                    className="flex-grow-1 w-100 w-md-auto"
                                    required
                                    onChange={event => {
                                        const repoOwner = event.target.value;
                                        this.setState({
                                            repoOwner
                                        });
                                    }}
                                    value={this.state.repoOwner}
                                />
                            </InputGroup>
                        </Form.Group>
                        <Form.Group controlId="reponame">
                            <Form.Label>
                                <h5>
                                    <FormattedMessage id="view.instance.create.repo_name" />
                                </h5>
                            </Form.Label>
                            <InputGroup className="mb-1">
                                <Form.Control
                                    type="text"
                                    className="flex-grow-1 w-100 w-md-auto"
                                    required
                                    onChange={event => {
                                        const repoName = event.target.value;
                                        this.setState({
                                            repoName
                                        });
                                    }}
                                    value={this.state.repoName}
                                />
                            </InputGroup>
                        </Form.Group>
                        <Form.Group controlId="accessuser">
                            <Form.Label>
                                <h5>
                                    <FormattedMessage id="view.instance.create.access_user" />
                                </h5>
                            </Form.Label>
                            <InputGroup className="mb-1">
                                <Form.Control
                                    type="text"
                                    className="flex-grow-1 w-100 w-md-auto"
                                    onChange={event => {
                                        const accessUser = event.target.value;
                                        this.setState({
                                            accessUser
                                        });
                                    }}
                                    value={this.state.accessUser}
                                />
                            </InputGroup>
                        </Form.Group>
                        <Form.Group controlId="accesstoken">
                            <Form.Label>
                                <h5>
                                    <FormattedMessage id="view.instance.create.access_token" />
                                </h5>
                            </Form.Label>
                            <InputGroup className="mb-1">
                                <Form.Control
                                    type="password"
                                    className="flex-grow-1 w-100 w-md-auto"
                                    onChange={event => {
                                        const accessToken = event.target.value;
                                        this.setState({
                                            accessToken
                                        });
                                    }}
                                    value={this.state.accessToken}
                                />
                            </InputGroup>
                        </Form.Group>
                        <Button type="submit" variant="success">
                            <FormattedMessage id="view.instance.create.quick.submit" />
                        </Button>
                    </Col>
                </Form>
            </div>
        );
    }

    private pushStage(stageNotice: React.ReactNode) {
        this.setState(prevState => {
            const newStages = [...prevState.quickSetupStages];
            newStages.push(<li>{stageNotice}</li>);
            return {
                quickSetupStages: newStages
            };
        });
    }

    private async quickStart(): Promise<void> {
        //The required attribute should prevent this from ever happening but id rather not fuck over someone
        if (
            !this.state.instancePath ||
            !this.state.instanceName ||
            !this.state.repoName ||
            !this.state.repoOwner
        ) {
            return;
        }

        this.setState({
            performingQuickSetup: true,
            quickSetupStages: []
        });
        this.pushStage(<FormattedMessage id="view.instance.create.quick.stage.yml" />);

        const ymlResponse = await GithubClient.getFile(
            this.state.repoOwner,
            this.state.repoName,
            ".tgs.yml"
        );
        if (ymlResponse.code === StatusCode.ERROR) {
            this.addError(ymlResponse.error);
            this.setState({
                performingQuickSetup: false
            });
            return;
        }

        const rawYml = window.atob(ymlResponse.payload);
        let yml: ITGSYml;
        try {
            yml = YAML.parse(rawYml) as ITGSYml;
        } catch (e) {
            this.setState({
                performingQuickSetup: false
            });
            return;
        }

        if (yml.version !== 1) {
            this.addError(new InternalError(ErrorCode.BAD_TGS_YML_VERSION, { void: true }));
            this.setState({
                performingQuickSetup: false
            });
        }

        const isWindows = this.context.serverInfo.windowsHost;
        const scripts =
            (isWindows ? yml.windows_scripts : yml.linux_scripts) ?? new Map<string, string>();
        const secLevel = getTGSYmlSecurity(yml) ?? DreamDaemonSecurity.Safe;
        try {
            const scriptData = new Map<string, string>();
            if (scripts.size > 0) {
                for (const scriptKvp of scripts) {
                    this.pushStage(
                        <FormattedMessage
                            id="view.instance.create.quick.stage.download_scripts"
                            values={{ script: scriptKvp[1] }}
                        />
                    );

                    const scriptResponse = await GithubClient.getFile(
                        this.state.repoOwner,
                        this.state.repoName,
                        scriptKvp[1]
                    );

                    if (scriptResponse.code === StatusCode.ERROR) {
                        this.addError(scriptResponse.error);
                        this.setState({
                            performingQuickSetup: false
                        });
                        return;
                    }

                    scriptData.set(scriptKvp[0], scriptResponse.payload);
                }
            }

            this.pushStage(
                <FormattedMessage id="view.instance.create.quick.stage.create_instance" />
            );

            const instancePath =
                (this.state.prefix ? this.state.prefix + "/" : "") + this.state.instancePath;
            const createResult = await InstanceClient.createInstance({
                name: this.state.instanceName,
                path: instancePath,
                configurationType: ConfigurationType.HostWrite
            });

            if (createResult.code === StatusCode.ERROR) {
                this.addError(createResult.error);
                this.setState({
                    performingQuickSetup: false
                });

                return;
            }

            const instanceId = createResult.payload.id;
            const onlineResult = await InstanceClient.editInstance({
                id: instanceId,
                online: true
            });

            if (onlineResult.code === StatusCode.ERROR) {
                this.addError(onlineResult.error);
                this.setState({
                    performingQuickSetup: false
                });

                return;
            }

            this.pushStage(<FormattedMessage id="view.instance.create.quick.stage.cloning" />);

            // look, we really should be prompting for reference and enable submodules but I hate webdev and can't be assed rn k? -Dominion
            const cloneResult = await RepositoryClient.cloneRepository(instanceId, {
                origin: `https://github.com/${this.state.repoOwner}/${this.state.repoName}`,
                updateSubmodules: true
            });

            if (cloneResult.code === StatusCode.ERROR) {
                this.addError(cloneResult.error);
                this.setState({
                    performingQuickSetup: false
                });

                return;
            }

            JobsController.registerJob(cloneResult.payload.activeJob!, instanceId);

            if (yml.byond) {
                this.pushStage(
                    <FormattedMessage
                        id="view.instance.create.quick.stage.byond"
                        values={{ version: yml.byond }}
                    />
                );
                const byondResult = await ByondClient.switchActive(instanceId, yml.byond);

                if (byondResult.code === StatusCode.ERROR) {
                    this.addError(byondResult.error);
                    this.setState({
                        performingQuickSetup: false
                    });

                    return;
                }

                JobsController.registerJob(byondResult.payload.installJob!, instanceId);
            }

            if (secLevel != DreamDaemonSecurity.Safe) {
                this.pushStage(<FormattedMessage id="view.instance.create.quick.stage.settings" />);
                const dmResult = await DreamMakerClient.updateDeployInfo(instanceId, {
                    apiValidationSecurityLevel: secLevel
                });

                if (dmResult.code === StatusCode.ERROR) {
                    this.addError(dmResult.error);
                    this.setState({
                        performingQuickSetup: false
                    });

                    return;
                }

                const ddResult = await DreamDaemonClient.updateWatchdogStatus(instanceId, {
                    securityLevel: secLevel
                });

                if (ddResult.code === StatusCode.ERROR) {
                    this.addError(ddResult.error);
                    this.setState({
                        performingQuickSetup: false
                    });

                    return;
                }
            }

            const base64ToArrayBuffer = (base64: string) => {
                const binary_string = window.atob(base64);
                const len = binary_string.length;
                const bytes = new Uint8Array(len);
                for (let i = 0; i < len; i++) {
                    bytes[i] = binary_string.charCodeAt(i);
                }
                return bytes.buffer;
            };

            for (const scriptKvp of scriptData) {
                this.pushStage(
                    <FormattedMessage
                        id="view.instance.create.quick.stage.upload_scripts"
                        values={{ script: scriptKvp[0] }}
                    />
                );

                const configResult = await ConfigurationFileClient.writeConfigFile(
                    instanceId,
                    {
                        path: `EventScripts/${scriptKvp[0]}`
                    },
                    base64ToArrayBuffer(scriptKvp[1])
                );

                if (configResult.code === StatusCode.ERROR) {
                    this.addError(configResult.error);
                    this.setState({
                        performingQuickSetup: false
                    });

                    return;
                }
            }

            if (yml.static_files) {
                for (const staticFile of yml.static_files) {
                    this.pushStage(
                        <FormattedMessage
                            id="view.instance.create.quick.stage.static"
                            values={{ dir: staticFile.name }}
                        />
                    );

                    if (staticFile.populate) {
                        let success = true;
                        const processDirectory = async (path: string): Promise<void> => {
                            const directoryResults = await GithubClient.getDirectoryContents(
                                this.state.repoOwner!,
                                this.state.repoName!,
                                path
                            );

                            if (directoryResults.code === StatusCode.ERROR) {
                                this.addError(directoryResults.error);
                                this.setState({
                                    performingQuickSetup: false
                                });
                                success = false;
                                return;
                            }

                            for (const directoryItem of directoryResults.payload) {
                                if (directoryItem.isDirectory) {
                                    await processDirectory(directoryItem.path);
                                    if (!success) {
                                        return;
                                    }
                                } else {
                                    this.pushStage(
                                        <FormattedMessage
                                            id="view.instance.create.quick.stage.static.transfer"
                                            values={{ path: directoryItem.path }}
                                        />
                                    );

                                    const downloadResult = await GithubClient.getFile(
                                        this.state.repoOwner!,
                                        this.state.repoName!,
                                        directoryItem.path
                                    );

                                    if (downloadResult.code === StatusCode.ERROR) {
                                        this.addError(downloadResult.error);
                                        this.setState({
                                            performingQuickSetup: false
                                        });
                                        success = false;
                                        return;
                                    }

                                    const uploadResult = await ConfigurationFileClient.writeConfigFile(
                                        instanceId,
                                        {
                                            path: `GameStaticFiles/${directoryItem.path}`
                                        },
                                        base64ToArrayBuffer(downloadResult.payload)
                                    );

                                    if (uploadResult.code === StatusCode.ERROR) {
                                        this.addError(uploadResult.error);
                                        this.setState({
                                            performingQuickSetup: false
                                        });
                                        success = false;
                                        return;
                                    }
                                }
                            }
                        };

                        await processDirectory(staticFile.name);
                        if (!success) {
                            return;
                        }
                    } else {
                        this.pushStage(
                            <FormattedMessage
                                id="view.instance.create.quick.stage.static"
                                values={{ script: staticFile.name }}
                            />
                        );

                        const dirResult = await ConfigurationFileClient.addDirectory(instanceId, {
                            path: `GameStaticFiles/${staticFile.name}`
                        });

                        if (dirResult.code === StatusCode.ERROR) {
                            this.addError(dirResult.error);
                            this.setState({
                                performingQuickSetup: false
                            });

                            return;
                        }
                    }
                }
            }

            RouteData.selectedinstanceid = instanceId;
            this.props.history.push(AppRoutes.instanceedit.link ?? AppRoutes.instanceedit.route);
        } catch (e) {
            this.addError(new InternalError(ErrorCode.BAD_TGS_YML, { jsError: e as Error }));
            this.setState({
                performingQuickSetup: false
            });
        }
    }

    private async submit() {
        //The required attribute should prevent this from ever happening but id rather not fuck over someone
        if (!this.state.instancePath || !this.state.instanceName) {
            return;
        }

        const instancePath =
            (this.state.prefix ? this.state.prefix + "/" : "") + this.state.instancePath;

        this.setState({
            loading: true
        });

        const result = await InstanceClient.createInstance({
            name: this.state.instanceName,
            path: instancePath
        });

        if (result.code === StatusCode.ERROR) {
            this.setState({
                loading: false
            });
            this.addError(result.error);

            return;
        }

        RouteData.selectedinstanceid = result.payload.id;
        this.props.history.push(AppRoutes.instancelist.link ?? AppRoutes.instancelist.route);
    }
}
InstanceCreate.contextType = GeneralContext;
export default withRouter(InstanceCreate);
