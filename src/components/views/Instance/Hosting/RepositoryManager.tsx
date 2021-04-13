import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { Highlighter, Typeahead } from "react-bootstrap-typeahead";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import CardColumns from "react-bootstrap/CardColumns";
import CardGroup from "react-bootstrap/CardGroup";
import Badge from "react-bootstrap/esm/Badge";
import Table from "react-bootstrap/esm/Table";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import ListGroup from "react-bootstrap/ListGroup";
import Modal from "react-bootstrap/Modal";
import Nav from "react-bootstrap/Nav";
import ProgressBar from "react-bootstrap/ProgressBar";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import Tooltip from "react-bootstrap/Tooltip";
import { FormattedMessage } from "react-intl";

import DreamMakerClient from "../../../../ApiClient/DreamMakerClient";
import {
    ErrorCode as TGSErrorCode,
    RemoteGitProvider,
    RepositoryRights
} from "../../../../ApiClient/generatedcode/_enums";
import { Components } from "../../../../ApiClient/generatedcode/_generated";
import InstancePermissionSetClient from "../../../../ApiClient/InstancePermissionSetClient";
import JobsClient from "../../../../ApiClient/JobsClient";
import InternalError, {
    ErrorCode,
    GenericErrors
} from "../../../../ApiClient/models/InternalComms/InternalError";
import InternalStatus, {
    StatusCode
} from "../../../../ApiClient/models/InternalComms/InternalStatus";
import RepositoryClient, { editRepositoryErrors } from "../../../../ApiClient/RepositoryClient";
import JobsController from "../../../../ApiClient/util/JobsController";
import GitHubClient, { CommitData, PRData } from "../../../../utils/GithubClient";
import { ErrorAlert, Loading, WIPNotice } from "../../../utils";

interface IProps {
    instance: Components.Schemas.InstanceResponse;
    selfPermissionSet?: Components.Schemas.PermissionSet;
    selfInstancePermissionSet: Components.Schemas.InstancePermissionSetResponse;
}

interface IState {
    errors: Array<InternalError<ErrorCode> | undefined>;
    loading: boolean;

    repositoryRights?: RepositoryRights;

    serverModel?: Components.Schemas.RepositoryResponse;
    newTestMerges: Components.Schemas.TestMerge[];
    prData?: PRData[] | null;
    commitData: Map<number, CommitData[] | null>;

    selectedPrNumber: Components.Schemas.TestMerge[];
    deployAfterTestMerges: boolean;

    configRepoValues: Components.Schemas.RepositoryUpdateRequest;

    deletingRepo: boolean;

    // When creating a NEW repository
    newRepoValues: Components.Schemas.RepositoryCreateRequest;
    downloadPercent?: number;
    downloadPercentAutoUpdate?: NodeJS.Timeout; //the setinterval index
    jobDownloadID?: number;
    jobFailure?: InternalError<ErrorCode>;
    jobSuccess?: boolean;
}

export default class CodeDeployment extends React.Component<IProps, IState> {
    public constructor(props: IProps) {
        super(props);

        this.state = {
            errors: [],
            loading: true,
            deletingRepo: false,
            newRepoValues: {
                origin: "",
                reference: "", // branch
                accessUser: "",
                accessToken: "",
                recurseSubmodules: true
            },
            configRepoValues: {},
            downloadPercent: 0,
            newTestMerges: [],
            selectedPrNumber: [],
            deployAfterTestMerges: true,
            commitData: new Map<number, CommitData[] | null>(),
            repositoryRights: this.props.selfInstancePermissionSet.repositoryRights
        };
    }

    public async componentDidMount(): Promise<void> {
        await this.refresh();
        await this.downloadJobCheck();
        // see if it's cloning
        this.setState({
            loading: false
        });
    }

    public componentWillUnmount(): void {
        // clean yo timers
        if (this.state.downloadPercentAutoUpdate) {
            clearInterval(this.state.downloadPercentAutoUpdate);
            this.setState({
                downloadPercentAutoUpdate: undefined
            });
        }
    }

    // private async editRepo(
    //     model?: Components.Schemas.RepositoryUpdateRequest,
    //     maybeDeployAfter?: boolean
    // ): Promise<void> {
    //     this.setState({
    //         loading: true,
    //         errors: []
    //     });

    //     const instanceId = parseInt(this.props.params.id);
    //     let response: InternalStatus<Components.Schemas.RepositoryResponse, GenericErrors>;
    //     if (!model) {
    //         response = await RepositoryClient.delete(instanceId);
    //     } else {
    //         response = await RepositoryClient.edit(instanceId, model);
    //     }

    //     if (response.code === StatusCode.OK) {
    //         this.digestResponse(response.payload);

    //         if (maybeDeployAfter && this.state.deployAfterTestMerges) {
    //             await new Promise<number>(resolve => window.setTimeout(() => resolve(1), 10000));

    //             const jobResponse = await DreamMakerClient.deploy(instanceId);
    //             if (jobResponse.code === StatusCode.OK) {
    //                 JobsController.register(jobResponse.payload);
    //             } else {
    //                 this.addError(jobResponse.error);
    //             }
    //         }
    //     } else {
    //         this.addError(response.error);
    //     }

    //     this.setState({
    //         loading: false
    //     });
    // }

    private async downloadJobCheck(): Promise<void> {
        const allJobs = await JobsClient.listActiveJobs(this.props.instance.id);
        if (allJobs.code !== StatusCode.OK) {
            this.addError(allJobs.error);
            this.setState({ downloadPercent: 0 });
            await this.downloadJobLoopShutdown();
            return;
        }
        // regex if desc has Clone Repository (x)
        for (const job of allJobs.payload) {
            const job_unchecked = await JobsClient.getJob(this.props.instance.id, job.id);
            if (job_unchecked.code !== StatusCode.OK) {
                continue;
            }
            if (
                job_unchecked.payload?.description?.startsWith("Clone") &&
                !job_unchecked.payload.cancelled
            ) {
                if (
                    !job_unchecked.payload.exceptionDetails &&
                    Number(job_unchecked.payload?.progress) >= 0
                ) {
                    this.setState({
                        downloadPercent: job_unchecked.payload.progress
                            ? job_unchecked.payload.progress
                            : 0.1,
                        jobDownloadID: job.id
                    });
                }
            }
        }
        await this.downloadJobLoopShutdown(allJobs.payload);
    }

    private async downloadJobLoopShutdown(
        allJobs?: Components.Schemas.JobResponse[]
    ): Promise<void> {
        if (!this.state.downloadPercentAutoUpdate) {
            return;
        }

        if (!allJobs || allJobs?.length === 0) {
            console.warn(
                "A severe lack of jobs. Terminating loop and (trying) to check the final status."
            );
            clearInterval(this.state.downloadPercentAutoUpdate);
            this.setState({
                downloadPercentAutoUpdate: undefined
            });
        }

        if (!this.state.downloadPercent || this.state.downloadPercent >= 100) {
            console.warn("Download percent is done? Terminating loop and checking status.");
            clearInterval(this.state.downloadPercentAutoUpdate);
            this.setState({
                downloadPercentAutoUpdate: undefined
            });
        }

        if (!this.state.jobDownloadID) {
            console.error(
                "We didn't cache the last download id, forcing a refresh as we can't get the status."
            );
            // await this.refresh();
            return;
        }

        const job_unchecked = await JobsClient.getJob(
            this.props.instance.id,
            this.state.jobDownloadID
        );
        if (job_unchecked.code !== StatusCode.OK) {
            console.warn("Job failed!");
            this.setState({
                jobFailure: job_unchecked.error
            });
            return;
        }
        if (job_unchecked.payload.exceptionDetails) {
            this.setState({
                jobFailure: new InternalError(ErrorCode.UNHANDLED_RESPONSE, {
                    jsError: new Error(`Git failure.\n${job_unchecked.payload.exceptionDetails}`)
                })
            });
            return;
        }
        this.setState({
            jobSuccess: true
        });
    }

    private async clone(): Promise<void> {
        this.setState({
            loading: true
        });
        // yes those checks are a feature. Explicit undefineds
        const response = await RepositoryClient.clone(
            {
                origin: this.state.newRepoValues.origin,
                recurseSubmodules: this.state.newRepoValues.recurseSubmodules,
                reference:
                    this.state.newRepoValues.reference === ""
                        ? undefined
                        : this.state.newRepoValues.reference,
                accessUser:
                    this.state.newRepoValues.accessUser === ""
                        ? undefined
                        : this.state.newRepoValues.accessUser,
                accessToken:
                    this.state.newRepoValues.accessToken === ""
                        ? undefined
                        : this.state.newRepoValues.accessToken
            },
            this.props.instance.id
        );

        if (response.code != StatusCode.OK) {
            this.addError(response.error);
            this.setState({
                loading: false
            });
            return;
        }

        this.setState({
            serverModel: response.payload
        });

        if (!response.payload.activeJob) {
            this.addError(
                new InternalError(ErrorCode.JOB_EXPECTED_JOB_MISSING, {
                    void: true
                })
            );
            this.setState({
                loading: false
            });
            return;
        }

        JobsController.register(response.payload.activeJob);
        await this.refresh();
        await this.downloadJobCheck();
        this.setState({
            loading: false,
            downloadPercent: 0.1
        });
        this.toggleAutoUpdate();
    }

    private digestResponse(serverModel: Components.Schemas.RepositoryResponse) {
        const activeTestMerges = serverModel.revisionInformation?.activeTestMerges;
        this.setState({
            serverModel,
            newTestMerges: activeTestMerges || []
        });

        if (serverModel.activeJob) {
            JobsController.register(serverModel.activeJob);
        }
    }

    private async refresh(annoyGithub = true): Promise<void> {
        const response = await RepositoryClient.getCurrent(this.props.instance.id);
        if (response.code === StatusCode.OK) {
            const serverModel = response.payload;
            this.digestResponse(serverModel);

            this.setState({
                configRepoValues: {
                    accessUser: this.state?.serverModel?.accessUser || "",
                    accessToken: "", //optional
                    reference: this.state?.serverModel?.reference || "",
                    committerName: this.state?.serverModel?.committerName || "",
                    committerEmail: this.state?.serverModel?.committerEmail || "",
                    checkoutSha:
                        this.state?.serverModel?.revisionInformation?.originCommitSha || "",
                    pushTestMergeCommits: this.state?.serverModel?.pushTestMergeCommits,
                    createGitHubDeployments: this.state?.serverModel?.createGitHubDeployments,
                    showTestMergeCommitters: this.state?.serverModel?.showTestMergeCommitters,
                    autoUpdatesKeepTestMerges: this.state?.serverModel?.autoUpdatesKeepTestMerges,
                    postTestMergeComment: this.state?.serverModel?.postTestMergeComment
                }
            });

            if (annoyGithub) {
                const prData = await this.getPRData(serverModel); // todo: stop git api spam
                this.setState({
                    prData,
                    commitData: new Map<number, CommitData[] | null>()
                });
            }
        } else if (response?.error.desc?.type === 1) {
            await this.downloadJobCheck();
        } else {
            this.addError(response.error);
        }
    }

    private async getPRData(
        serverModel: Components.Schemas.RepositoryResponse
    ): Promise<PRData[] | null> {
        if (serverModel.remoteGitProvider !== RemoteGitProvider.GitHub) return null;
        const response = await GitHubClient.getPrs(
            serverModel.remoteRepositoryOwner!,
            serverModel.remoteRepositoryName!
        );

        if (response.code !== StatusCode.OK) {
            this.addError(response.error);
            return null;
        }

        return response.payload;
    }

    /**
     * Helper funcs down here
     */

    private checkRRFlag(flag: RepositoryRights): boolean {
        return this.state.repositoryRights == null || !!(this.state.repositoryRights & flag);
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

    private toggleAutoUpdate() {
        if (this.state.downloadPercentAutoUpdate) {
            clearInterval(this.state.downloadPercentAutoUpdate);
            this.setState({
                downloadPercentAutoUpdate: undefined
            });
            console.info("Terminating loop");
        }
        const loop = setInterval(() => {
            void this.downloadJobCheck();
        }, 2000);
        this.setState({
            downloadPercentAutoUpdate: loop
        });
    }

    private async saveConfig(): Promise<void> {
        const blankToUndef = (x: string | null | undefined, y: string | null | undefined) => {
            return x && y && x !== y && y !== "" ? y : undefined;
        };
        const response = await RepositoryClient.edit(this.props.instance.id, {
            accessUser: blankToUndef(
                this.state.serverModel?.accessUser,
                this.state.configRepoValues.accessUser
            ),
            accessToken: blankToUndef("", this.state.configRepoValues.accessUser),
            reference: blankToUndef(
                this.state.serverModel?.reference,
                this.state.configRepoValues.reference
            ),
            committerName: blankToUndef(
                this.state.serverModel?.committerName,
                this.state.configRepoValues.committerName
            ),
            committerEmail: blankToUndef(
                this.state.serverModel?.committerEmail,
                this.state.configRepoValues.committerEmail
            ),
            checkoutSha: blankToUndef(
                this.state.serverModel?.revisionInformation?.originCommitSha,
                this.state.configRepoValues.checkoutSha
            ),
            pushTestMergeCommits: this.state.configRepoValues.pushTestMergeCommits,
            createGitHubDeployments: this.state.configRepoValues.createGitHubDeployments,
            showTestMergeCommitters: this.state.configRepoValues.showTestMergeCommitters,
            autoUpdatesKeepTestMerges: this.state.configRepoValues.autoUpdatesKeepTestMerges,
            postTestMergeComment: this.state.configRepoValues.postTestMergeComment
        });
        return;
    }

    public render(): React.ReactNode {
        if (this.state.loading) {
            return <Loading text="loading.instance" />;
        }

        //we are downloading!
        if (this.state?.downloadPercent) {
            return (
                <Card>
                    <Card.Header>Downloading your repository!</Card.Header>
                    <Card.Body>
                        {this.state.jobFailure && <ErrorAlert error={this.state.jobFailure} />}
                        <Card.Title>Download Status</Card.Title>
                        <ProgressBar
                            animated
                            variant="success"
                            label={`${this.state.downloadPercent}%`}
                            now={this.state.downloadPercent}
                        />
                        <Form.Group>
                            <Form.Check
                                type="switch"
                                checked={!!this.state.downloadPercentAutoUpdate}
                                id={"recursive-submodule-toggle"}
                                label={"Auto-update"}
                                onChange={() => {
                                    this.toggleAutoUpdate();
                                }}
                            />
                        </Form.Group>
                    </Card.Body>
                </Card>
            );
        }

        // no url && branch == clearly disabled
        // therefore we run "setup"
        if (!this.state?.serverModel?.reference && !this.state?.serverModel?.origin) {
            console.info(`Running "Setup" of instance ${this.props.instance.id}!`);
            return (
                <>
                    {this.state.errors.map((err, index) => {
                        if (!err) return;
                        return (
                            <ErrorAlert
                                key={index}
                                error={err}
                                onClose={() => {
                                    this.setState(prev => {
                                        const newarr = Array.from(prev.errors);
                                        newarr[index] = undefined;
                                        return {
                                            errors: newarr
                                        };
                                    });
                                }}
                            />
                        );
                    })}
                    <CardGroup>
                        <Card>
                            <Card.Header>Install a repository</Card.Header>
                            <Card.Body>
                                <Card.Title>
                                    {/* <FormattedMessage id="fields.instance.name" /> */}
                                    Repository URL
                                </Card.Title>
                                <Form.Group>
                                    <InputGroup>
                                        <Form.Control
                                            type="text"
                                            placeholder="Github/Gitlab/Any git-based SCM URL"
                                            autoComplete="url"
                                            value={String(this.state.newRepoValues.origin)}
                                            onChange={e => {
                                                this.setState({
                                                    newRepoValues: {
                                                        ...this.state.newRepoValues,
                                                        origin: e.currentTarget.value
                                                    }
                                                });
                                            }}
                                            required
                                        />
                                    </InputGroup>
                                    <Form.Text muted>The URL of the repository.</Form.Text>
                                </Form.Group>
                                <Card.Title>
                                    {/* <FormattedMessage id="fields.instance.name" /> */}
                                    Repository Branch
                                </Card.Title>
                                <Form.Group>
                                    <InputGroup>
                                        <Form.Control
                                            type="text"
                                            key="test"
                                            placeholder={"(default branch)"}
                                            value={String(this.state.newRepoValues.reference)}
                                            onChange={e => {
                                                this.setState({
                                                    newRepoValues: {
                                                        ...this.state.newRepoValues,
                                                        reference: e.currentTarget.value
                                                    }
                                                });
                                            }}
                                        />
                                    </InputGroup>
                                    <Form.Text muted>
                                        Repository Branch. Leave empty for default.
                                    </Form.Text>
                                </Form.Group>
                                <Form.Group>
                                    <Form.Check
                                        type="switch"
                                        checked={Boolean(
                                            this.state.newRepoValues.recurseSubmodules
                                        )}
                                        id={"recursive-submodule-toggle"}
                                        label={"Recursive Submodules"}
                                        onChange={e => {
                                            this.setState({
                                                newRepoValues: {
                                                    ...this.state.newRepoValues,
                                                    recurseSubmodules: e.currentTarget.checked
                                                }
                                            });
                                        }}
                                    />
                                    <Form.Text muted>
                                        Download the submodules? Passes{" "}
                                        <code>--recurse-submodules</code> into git. Click{" "}
                                        <a href="https://git-scm.com/book/en/v2/Git-Tools-Submodules">
                                            here
                                        </a>{" "}
                                        to read more about submodules.
                                    </Form.Text>
                                </Form.Group>
                                <Button
                                    variant="success"
                                    size="lg"
                                    block
                                    onClick={() => {
                                        void this.clone();
                                    }}
                                    disabled={!this.state.newRepoValues.origin}>
                                    Clone <FontAwesomeIcon icon="code-branch" />
                                </Button>
                            </Card.Body>
                        </Card>
                        <Card>
                            <Card.Header>Credentials</Card.Header>
                            <Card.Body>
                                <Card.Title>
                                    {/* <FormattedMessage id="fields.instance.name" /> */}
                                    Username
                                </Card.Title>
                                <Form.Group>
                                    <InputGroup>
                                        <Form.Control
                                            type="text"
                                            key="test"
                                            placeholder="Account username"
                                            value={String(this.state.newRepoValues.accessUser)}
                                            onChange={e => {
                                                this.setState({
                                                    newRepoValues: {
                                                        ...this.state.newRepoValues,
                                                        accessUser: e.currentTarget.value
                                                    }
                                                });
                                            }}
                                        />
                                    </InputGroup>
                                    <Form.Text muted>
                                        The username of the account used to pull the repository.
                                    </Form.Text>
                                </Form.Group>
                                <Card.Title>
                                    {/* <FormattedMessage id="fields.instance.name" /> */}
                                    PAT / Password
                                </Card.Title>
                                <Form.Group>
                                    <InputGroup hasValidation>
                                        <Form.Control
                                            type="password"
                                            autoComplete="new-password"
                                            key="test"
                                            placeholder="Account PAT/Password"
                                            value={String(this.state.newRepoValues.accessToken)}
                                            onChange={e => {
                                                this.setState({
                                                    newRepoValues: {
                                                        ...this.state.newRepoValues,
                                                        accessToken: e.currentTarget.value
                                                    }
                                                });
                                            }}
                                        />
                                    </InputGroup>
                                    <Form.Text muted>
                                        The password/PAT used for fetching the repository. PAT
                                        (Github) is your personal token. Click{" "}
                                        <a
                                            href={
                                                "https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token"
                                            }>
                                            here
                                        </a>{" "}
                                        to learn more.
                                    </Form.Text>
                                </Form.Group>
                            </Card.Body>
                        </Card>
                    </CardGroup>
                </>
            );
        }

        return (
            <>
                {!!this.state.deletingRepo && this.renderDeleteRepoModal()}
                {this.state.errors.map((err, index) => {
                    if (!err) return;
                    return (
                        <ErrorAlert
                            key={index}
                            error={err}
                            onClose={() => {
                                this.setState(prev => {
                                    const newarr = Array.from(prev.errors);
                                    newarr[index] = undefined;
                                    return {
                                        errors: newarr
                                    };
                                });
                            }}
                        />
                    );
                })}
                <Tabs
                    className="justify-content-center"
                    defaultActiveKey="config"
                    variant="pills"
                    id="cfg">
                    <Tab eventKey="config" title="Configuration">
                        <br />
                        {this.renderConfig()}
                    </Tab>
                    <Tab eventKey="testmerges" title="Testmerges">
                        <br />
                        {this.renderTestmerge()}
                    </Tab>
                </Tabs>
            </>
        );
    }

    private renderConfig(): React.ReactNode {
        return (
            <CardGroup>
                {/* Config */}
                <Card>
                    <Card.Header>Repository</Card.Header>
                    {/* Repo */}
                    <Card.Body>
                        {/* Repo config */}
                        <Card.Title>
                            {/* <FormattedMessage id="fields.instance.name" /> */}
                            Repository Settings
                        </Card.Title>
                        <Form.Group>
                            {/* Once created, cannot be edited. */}
                            <Form.Label>Closest origin SHA</Form.Label>
                            <InputGroup>
                                <Form.Control
                                    type="text"
                                    value={String(this.state.serverModel?.origin)}
                                    disabled
                                />
                            </InputGroup>
                            <Form.Text muted>The URL of the repository.</Form.Text>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Repository Branch</Form.Label>
                            <InputGroup hasValidation>
                                <Form.Control
                                    type="text"
                                    key="test"
                                    placeholder={"(default branch)"}
                                    value={String(this.state.configRepoValues.reference)}
                                    onChange={e => {
                                        this.setState({
                                            configRepoValues: {
                                                ...this.state.configRepoValues,
                                                reference: e.currentTarget.value
                                            }
                                        });
                                    }}
                                />
                                {this.state?.serverModel?.reference &&
                                    this.state.configRepoValues.reference !==
                                        this.state?.serverModel.reference && (
                                        <InputGroup.Append>
                                            <Button
                                                variant="secondary"
                                                onClick={() => {
                                                    this.setState({
                                                        configRepoValues: {
                                                            ...this.state.configRepoValues,
                                                            reference: String(
                                                                this.state?.serverModel?.reference
                                                                    ? this.state.serverModel
                                                                          .reference
                                                                    : ""
                                                            )
                                                        }
                                                    });
                                                }}>
                                                <FontAwesomeIcon fixedWidth icon="undo" />
                                            </Button>
                                        </InputGroup.Append>
                                    )}
                            </InputGroup>
                            <Form.Text muted>Repository Branch. Leave empty for default.</Form.Text>
                        </Form.Group>
                        {/* Repo SHA */}
                        <Card.Title>
                            {/* <FormattedMessage id="fields.instance.name" /> */}
                            Branch SHA1
                        </Card.Title>
                        <Form.Group>
                            <Form.Label>Checkout SHA</Form.Label>
                            <InputGroup hasValidation>
                                <Form.Control
                                    type="text"
                                    key="test"
                                    placeholder={"(origin SHA)"}
                                    value={String(this.state.configRepoValues.checkoutSha)}
                                    onChange={e => {
                                        this.setState({
                                            configRepoValues: {
                                                ...this.state.configRepoValues,
                                                checkoutSha: e.currentTarget.value
                                            }
                                        });
                                    }}
                                />
                                {this.state?.serverModel?.revisionInformation?.originCommitSha &&
                                    this.state.configRepoValues.checkoutSha !==
                                        this.state.serverModel.revisionInformation
                                            .originCommitSha && (
                                        <InputGroup.Append>
                                            <Button
                                                variant="secondary"
                                                onClick={() => {
                                                    this.setState({
                                                        configRepoValues: {
                                                            ...this.state.configRepoValues,
                                                            checkoutSha: String(
                                                                this.state.serverModel
                                                                    ?.revisionInformation
                                                                    ?.originCommitSha
                                                            )
                                                        }
                                                    });
                                                }}>
                                                <FontAwesomeIcon fixedWidth icon="undo" />
                                            </Button>
                                        </InputGroup.Append>
                                    )}
                            </InputGroup>
                            <Form.Text muted>Repository Branch. Leave empty for default.</Form.Text>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Closest origin SHA</Form.Label>
                            <InputGroup hasValidation>
                                <Form.Control
                                    value={String(
                                        this.state.serverModel?.revisionInformation?.commitSha
                                    )}
                                    disabled
                                />
                            </InputGroup>
                            <Form.Text muted>
                                The closest branch (in sha1) to the parent origin.
                            </Form.Text>
                        </Form.Group>
                        <Form.Group>
                            <Form.Check
                                type="switch"
                                id={"ATTM"}
                                label={"Auto-update Test merges."}
                                checked={!!this.state.configRepoValues.autoUpdatesKeepTestMerges}
                                onChange={e => {
                                    this.setState({
                                        configRepoValues: {
                                            ...this.state.configRepoValues,
                                            autoUpdatesKeepTestMerges: e.currentTarget.checked
                                        }
                                    });
                                }}
                            />
                            <Form.Text muted>
                                Deploy the code onto the server after compilation.
                            </Form.Text>
                        </Form.Group>
                        <Form.Group>
                            <Form.Check
                                type="switch"
                                id={"PTMOTB"}
                                label={"Push test merge onto remote as a temporary branch."}
                                checked={!!this.state.configRepoValues.pushTestMergeCommits}
                                onChange={e => {
                                    this.setState({
                                        configRepoValues: {
                                            ...this.state.configRepoValues,
                                            pushTestMergeCommits: e.currentTarget.checked
                                        }
                                    });
                                }}
                            />
                            <Form.Text muted>
                                Deploy the code onto the server after compilation.
                            </Form.Text>
                        </Form.Group>
                        <Form.Group>
                            <Form.Check
                                type="switch"
                                id={"SMUIPM"}
                                label={"Show merger username in public metadata."}
                                checked={!!this.state.configRepoValues.showTestMergeCommitters}
                                onChange={e => {
                                    this.setState({
                                        configRepoValues: {
                                            ...this.state.configRepoValues,
                                            showTestMergeCommitters: e.currentTarget.checked
                                        }
                                    });
                                }}
                            />
                            <Form.Text muted>
                                Deploy the code onto the server after compilation.
                            </Form.Text>
                        </Form.Group>
                        <Button
                            size="sm"
                            onClick={() => {
                                void this.saveConfig();
                            }}>
                            Apply Changes
                        </Button>{" "}
                        <Button
                            size="sm"
                            variant="danger"
                            onClick={() => {
                                this.setState({ deletingRepo: true });
                            }}>
                            Delete Repository
                        </Button>
                    </Card.Body>
                </Card>
                {/* Creds */}
                <Card>
                    <Card.Header>Credentials</Card.Header>
                    <Card.Body>
                        {/* Commiter info */}
                        <Card.Title>
                            {/* <FormattedMessage id="fields.instance.name" /> */}
                            Committer Credentials
                        </Card.Title>
                        <Form.Group>
                            <Form.Label>Committer Username</Form.Label>
                            <InputGroup hasValidation>
                                <Form.Control
                                    autoComplete="new-password"
                                    placeholder="tgstation-server"
                                    value={this.state.configRepoValues?.committerName || ""}
                                    onChange={e => {
                                        this.setState({
                                            configRepoValues: {
                                                ...this.state.configRepoValues,
                                                committerName: e.currentTarget.value
                                            }
                                        });
                                    }}
                                />
                                {this.state?.serverModel?.committerName &&
                                    this.state.configRepoValues.committerName !==
                                        this.state.serverModel.committerName && (
                                        <InputGroup.Append>
                                            <Button
                                                variant="secondary"
                                                onClick={() => {
                                                    this.setState({
                                                        configRepoValues: {
                                                            ...this.state.configRepoValues,
                                                            committerName: String(
                                                                this.state.serverModel
                                                                    ?.committerName
                                                            )
                                                        }
                                                    });
                                                }}>
                                                <FontAwesomeIcon fixedWidth icon="undo" />
                                            </Button>
                                        </InputGroup.Append>
                                    )}
                            </InputGroup>
                            <Form.Text muted>
                                The Username to be used when pushing test-merges onto the
                                repository.
                            </Form.Text>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Committer Email</Form.Label>
                            <InputGroup hasValidation>
                                <Form.Control
                                    autoComplete="new-password"
                                    placeholder="tgstation-server@users.noreply.github.com"
                                    value={this.state.configRepoValues?.committerEmail || ""}
                                    onChange={e => {
                                        this.setState({
                                            configRepoValues: {
                                                ...this.state.configRepoValues,
                                                committerEmail: e.currentTarget.value
                                            }
                                        });
                                    }}
                                />
                                {this.state?.serverModel?.committerEmail &&
                                    this.state.configRepoValues.committerEmail !==
                                        this.state.serverModel.committerEmail && (
                                        <InputGroup.Append>
                                            <Button
                                                variant="secondary"
                                                onClick={() => {
                                                    this.setState({
                                                        configRepoValues: {
                                                            ...this.state.configRepoValues,
                                                            committerEmail: String(
                                                                this.state.serverModel
                                                                    ?.committerEmail
                                                            )
                                                        }
                                                    });
                                                }}>
                                                <FontAwesomeIcon fixedWidth icon="undo" />
                                            </Button>
                                        </InputGroup.Append>
                                    )}
                            </InputGroup>
                            <Form.Text muted>
                                The email to be used when pushing test-merges onto the repository.
                            </Form.Text>
                        </Form.Group>
                        {/* Repo Access user */}
                        <Card.Title>
                            {/* <FormattedMessage id="fields.instance.name" /> */}
                            Repository Access Credentials
                        </Card.Title>
                        <Form.Group>
                            <Form.Label>Username</Form.Label>
                            <InputGroup>
                                <Form.Control
                                    type="text"
                                    key="test"
                                    placeholder="Account username"
                                    value={String(this.state.configRepoValues.accessUser)}
                                    onChange={e => {
                                        this.setState({
                                            configRepoValues: {
                                                ...this.state.configRepoValues,
                                                accessUser: e.currentTarget.value
                                            }
                                        });
                                    }}
                                />
                                {this.state?.serverModel?.accessUser &&
                                    this.state.configRepoValues.accessUser !==
                                        this.state?.serverModel.accessUser && (
                                        <InputGroup.Append>
                                            <Button
                                                variant="secondary"
                                                onClick={() => {
                                                    this.setState({
                                                        configRepoValues: {
                                                            ...this.state.configRepoValues,
                                                            accessUser: String(
                                                                this.state?.serverModel?.accessUser
                                                                    ? this.state.serverModel
                                                                          .accessUser
                                                                    : ""
                                                            )
                                                        }
                                                    });
                                                }}>
                                                <FontAwesomeIcon fixedWidth icon="undo" />
                                            </Button>
                                        </InputGroup.Append>
                                    )}
                            </InputGroup>
                            <Form.Text muted>
                                The username of the account used to pull the repository.
                            </Form.Text>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Password/PAT</Form.Label>
                            <InputGroup hasValidation>
                                <Form.Control
                                    type="password"
                                    autoComplete="new-password"
                                    placeholder="Account PAT/Password"
                                    onChange={e => {
                                        this.setState({
                                            configRepoValues: {
                                                ...this.state.configRepoValues,
                                                accessToken: e.currentTarget.value
                                            }
                                        });
                                    }}
                                />
                            </InputGroup>
                            <Form.Text muted>
                                The password/PAT used for fetching the repository. PAT (Github) is
                                your personal token. Click{" "}
                                <a
                                    href={
                                        "https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token"
                                    }>
                                    here
                                </a>{" "}
                                to learn more.
                            </Form.Text>
                        </Form.Group>
                        <Form.Group>
                            <Form.Check
                                type="switch"
                                id={"comment"}
                                label={"Post GitHub Comment when test merge is deployed."}
                                checked={!!this.state.configRepoValues.postTestMergeComment}
                                onChange={e => {
                                    this.setState({
                                        configRepoValues: {
                                            ...this.state.configRepoValues,
                                            postTestMergeComment: e.currentTarget.checked
                                        }
                                    });
                                }}
                            />
                            <Form.Text muted>
                                Post GitHub Comment when test merge is deployed.
                            </Form.Text>
                        </Form.Group>
                        <Form.Group>
                            <Form.Check
                                type="switch"
                                id={"dep-stat"}
                                label={"Create GitHub Deployment status."}
                                checked={!!this.state.configRepoValues.createGitHubDeployments}
                                onChange={e => {
                                    this.setState({
                                        configRepoValues: {
                                            ...this.state.configRepoValues,
                                            createGitHubDeployments: e.currentTarget.checked
                                        }
                                    });
                                }}
                            />
                            <Form.Text muted>Create GitHub Deployment status.</Form.Text>
                        </Form.Group>
                        <Button
                            size="sm"
                            variant="warning"
                            disabled={!this.state?.serverModel?.accessUser}
                            onClick={async () => {
                                await RepositoryClient.edit(this.props.instance.id, {
                                    committerName: null,
                                    committerEmail: null,
                                    accessUser: "",
                                    accessToken: ""
                                });
                                await this.refresh();
                            }}>
                            Clear Credentials
                        </Button>
                    </Card.Body>
                </Card>
            </CardGroup>
        );
    }

    private renderTestmerge(): React.ReactNode {
        const hexToHSL = (H: string) => {
            // Convert hex to RGB first
            let r = 0,
                g = 0,
                b = 0;
            if (H.length == 4) {
                r = Number("0x" + H[1] + H[1]);
                g = Number("0x" + H[2] + H[2]);
                b = Number("0x" + H[3] + H[3]);
            } else if (H.length == 7) {
                r = Number("0x" + H[1] + H[2]);
                g = Number("0x" + H[3] + H[4]);
                b = Number("0x" + H[5] + H[6]);
            }
            // Then to HSL
            r /= 255;
            g /= 255;
            b /= 255;
            const cmin = Math.min(r, g, b),
                cmax = Math.max(r, g, b),
                delta = cmax - cmin;
            let h = 0,
                s = 0,
                l = 0;

            if (delta == 0) h = 0;
            else if (cmax == r) h = ((g - b) / delta) % 6;
            else if (cmax == g) h = (b - r) / delta + 2;
            else h = (r - g) / delta + 4;

            h = Math.round(h * 60);

            if (h < 0) h += 360;

            l = (cmax + cmin) / 2;
            s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
            s = +(s * 100).toFixed(1);
            l = +(l * 100).toFixed(1);

            return [h, s, l];
        };
        return (
            <Card>
                <Card.Header>Test Merges</Card.Header>
                <Card.Body>
                    <Form.Group>
                        <InputGroup>
                            <Typeahead
                                id="testmerges"
                                labelKey="number"
                                placeholder="Search for testmerges..."
                                options={
                                    this.state.prData?.map(pr => ({
                                        number: String(pr.number),
                                        titleAtMerge: pr.title,
                                        labels: pr.labels
                                    })) || []
                                }
                                maxResults={50}
                                paginate
                                allowNew={true}
                                clearButton
                                multiple
                                filterBy={() => true}
                                renderMenuItemChildren={(option, props, k) => (
                                    <React.Fragment key={k}>
                                        <Highlighter search={props.text || ""}>
                                            {option.number}
                                        </Highlighter>{" "}
                                        - {option.titleAtMerge.substring(0, 100)}
                                        {option.titleAtMerge.length >= 100 && "..."}
                                        <div>
                                            {option?.labels?.map((label, key) => {
                                                const hsl = hexToHSL(`#${label.color || "aaa"}`);
                                                const txt_color = `hsl(${hsl[0]}, ${
                                                    hsl[0] === 0 ? 0 : Math.max(hsl[0] + 70, 100)
                                                }%, ${Math.max(
                                                    hsl[2] +
                                                        Math.min(
                                                            Math.max(
                                                                40 -
                                                                    (hsl[2] < 5
                                                                        ? Math.log(hsl[2])
                                                                        : 0),
                                                                1
                                                            ),
                                                            30
                                                        ),
                                                    1
                                                )}%)`;
                                                const border_col = `hsl(${hsl[0]}, ${
                                                    hsl[1] - 15
                                                }%, ${hsl[2] + 5 - Math.log(hsl[2])}%)`;
                                                return (
                                                    <>
                                                        <Badge
                                                            key={key}
                                                            // as={Link}
                                                            // to={label.url || ""}
                                                            title={label.description}
                                                            style={{
                                                                backgroundColor: `hsl(${hsl[0]}, ${
                                                                    hsl[1]
                                                                }%, ${hsl[2] - 15}%)`,
                                                                color: txt_color,
                                                                border: `solid 1px ${border_col}`,
                                                                borderRadius: "2em",
                                                                paddingLeft: "7px",
                                                                paddingRight: "7px",
                                                                fontWeight: 500
                                                            }}>
                                                            {label.name}
                                                        </Badge>{" "}
                                                    </>
                                                );
                                            })}
                                        </div>
                                    </React.Fragment>
                                )}
                                onChange={selected => {
                                    this.setState({
                                        // @ts-expect-error: i know labels are not defined but shut the fuck up
                                        selectedPrNumber: selected
                                    });
                                }}
                            />
                            <InputGroup.Append>
                                <Button
                                    block
                                    onClick={() => {
                                        alert(JSON.stringify(this.state.selectedPrNumber));
                                    }}>
                                    <FontAwesomeIcon fixedWidth icon="plus" />
                                </Button>
                            </InputGroup.Append>
                        </InputGroup>
                        <Form.Text muted>Info or something</Form.Text>
                    </Form.Group>
                    <Card.Text>
                        <ListGroup>
                            {this.state.newTestMerges.map((v, k) => (
                                <ListGroup.Item variant="dark" key={k}>
                                    <Form.Check
                                        id={`toggle-${v.number}`}
                                        label={
                                            <>
                                                <a href={v.url} target="_blank" rel="noreferrer">
                                                    #{v.number}
                                                </a>{" "}
                                                - {v.titleAtMerge}
                                            </>
                                        }
                                        defaultChecked
                                    />
                                    <InputGroup>
                                        <Form.Control
                                            id="branchselect-n"
                                            placeholder="Select branch"
                                            defaultValue={v.targetCommitSha}
                                            size="sm"
                                        />
                                    </InputGroup>
                                    <Form.Control
                                        as="textarea"
                                        placeholder="Add Comment"
                                        rows={2}
                                        minLength={1}
                                        defaultValue={v.comment || ""}
                                    />
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </Card.Text>
                    <Button>Merge from Tracked Origin</Button>{" "}
                    <Button>Fetch and hard reset to Tracked Origin</Button>
                </Card.Body>
            </Card>
        );
    }

    // Highlander style, there can only be one!
    private renderDeleteRepoModal(): React.ReactNode {
        return (
            <Modal
                aria-labelledby="contained-modal-title-vcenter"
                show={this.state.deletingRepo}
                centered
                onHide={() => {
                    this.setState({ deletingRepo: false });
                }}>
                <Modal.Header closeButton>
                    <Modal.Title>Delete repository</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Modal.Title>
                        Are you ABSOLUTELY SURE that you are going to delete this repository?
                    </Modal.Title>
                    <Modal.Footer>
                        <Button
                            onClick={() => {
                                void RepositoryClient.delete(this.props.instance.id);
                                void this.refresh(false);
                            }}
                            variant="danger">
                            Delete Repository
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => {
                                this.setState({ deletingRepo: false });
                            }}>
                            Cancel
                        </Button>
                    </Modal.Footer>
                </Modal.Body>
            </Modal>
        );
    }
}
