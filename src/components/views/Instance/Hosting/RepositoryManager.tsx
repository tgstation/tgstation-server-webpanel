import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { ChangeEvent } from "react";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import CardColumns from "react-bootstrap/CardColumns";
import CardGroup from "react-bootstrap/CardGroup";
import Table from "react-bootstrap/esm/Table";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import ProgressBar from "react-bootstrap/ProgressBar";
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
import RepositoryClient from "../../../../ApiClient/RepositoryClient";
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

    newTestMerges: Components.Schemas.TestMergeParameters[];

    manualTestMergeNumber?: number | null;
    manualTestMergeSha?: string | null;
    manualTestMergeComment?: string | null;

    autoTestMergeNumber?: number | null;
    autoTestMergeSha?: string | null;
    autoTestMergeComment?: string | null;

    prData?: PRData[] | null;
    commitData: Map<number, CommitData[] | null>;

    deployAfterTestMerges: boolean;

    checkingAutoSetup: boolean;

    modifiedRepoValues: { [key: string]: string | number | boolean };
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
            newRepoValues: {
                origin: "",
                accessUser: "",
                accessToken: "",
                reference: "", // branch
                recurseSubmodules: true
            },
            modifiedRepoValues: {
                origin: "",
                accessUser: "",
                reference: "",
                recurseSubmodules: false
            },
            downloadPercent: 0,
            newTestMerges: [],
            deployAfterTestMerges: true,
            checkingAutoSetup: false,
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

        const response = await RepositoryClient.clone(
            this.state.newRepoValues,
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
            return;
        }

        JobsController.register(response.payload.activeJob);
        await this.refresh();
        await this.downloadJobCheck();
        this.setState({
            loading: false,
            downloadPercent: 0.1
        });
    }

    private digestResponse(serverModel: Components.Schemas.RepositoryResponse) {
        const activeTestMerges = serverModel.revisionInformation?.activeTestMerges;
        const newTestMerges: Components.Schemas.TestMergeParameters[] =
            activeTestMerges?.map(activeTestMerge => {
                return {
                    number: activeTestMerge.number,
                    comment: activeTestMerge.comment,
                    targetCommitSha: activeTestMerge.targetCommitSha
                };
            }) || [];

        this.setState({
            serverModel,
            newTestMerges
        });

        if (serverModel.activeJob) {
            JobsController.register(serverModel.activeJob);
        }
    }

    private async refresh(): Promise<void> {
        const response = await RepositoryClient.getCurrent(this.props.instance.id);
        console.log(response);
        if (response.code === StatusCode.OK) {
            const serverModel = response.payload;
            this.digestResponse(serverModel);

            this.setState({
                modifiedRepoValues: {
                    // nuke it
                    origin: "",
                    accessUser: "",
                    accessPassword: "", //optional
                    reference: "",
                    recurseSubmodules: false
                }
            });

            const prData = await this.getPRData(serverModel);
            this.setState({
                prData,
                commitData: new Map<number, CommitData[] | null>(),
                modifiedRepoValues: {
                    ...this.state.modifiedRepoValues,
                    accessUser: this.state?.serverModel?.accessUser
                        ? String(this.state.serverModel.accessUser)
                        : "",
                    reference: this.state?.serverModel?.reference
                        ? String(this.state.serverModel.reference)
                        : "",
                    origin: this.state?.serverModel?.origin
                        ? String(this.state.serverModel.origin)
                        : ""
                }
            });
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
                <CardColumns style={{ columnCount: "unset", widows: "unset" }}>
                    <Card>
                        <Card.Header>Top Card</Card.Header>
                        <Card.Body>
                            <WIPNotice />
                        </Card.Body>
                    </Card>
                    <CardColumns className={"card-colum-cfg"}>
                        {/* TM */}
                        <Card>
                            <Card.Header>Test Merges</Card.Header>
                            <Card.Body>
                                <WIPNotice />
                            </Card.Body>
                        </Card>
                        {/* Creds */}
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
                                            value={String(this.state.modifiedRepoValues.accessUser)}
                                            onChange={e => {
                                                this.setState({
                                                    modifiedRepoValues: {
                                                        ...this.state.modifiedRepoValues,
                                                        accessUser: e.currentTarget.value
                                                    }
                                                });
                                            }}
                                        />
                                        {this.state?.serverModel?.accessUser &&
                                            this.state.modifiedRepoValues.accessUser !==
                                                this.state?.serverModel.accessUser && (
                                                <InputGroup.Append>
                                                    <Button
                                                        variant="secondary"
                                                        onClick={() => {
                                                            this.setState({
                                                                modifiedRepoValues: {
                                                                    ...this.state
                                                                        .modifiedRepoValues,
                                                                    accessUser: String(
                                                                        this.state?.serverModel
                                                                            ?.accessUser
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
                                <Button
                                    size="sm"
                                    onClick={() => {
                                        alert("Saved. Or something? Idk.");
                                    }}>
                                    Save
                                </Button>{" "}
                                <Button
                                    size="sm"
                                    variant="warning"
                                    disabled={!this.state?.serverModel?.accessUser}
                                    onClick={() => {
                                        alert("Saved. Or something? Idk.");
                                    }}>
                                    Clear Credentials
                                </Button>
                            </Card.Body>
                        </Card>
                        {/* Config */}
                        <Card>
                            <Card.Header>Repository Settings</Card.Header>
                            <Card.Body>
                                <Card.Title>
                                    {/* <FormattedMessage id="fields.instance.name" /> */}
                                    Repository URL
                                </Card.Title>
                                <Form.Group>
                                    <InputGroup hasValidation>
                                        <Form.Control
                                            type="text"
                                            value={String(this.state.modifiedRepoValues.origin)}
                                            disabled
                                        />
                                    </InputGroup>
                                    <Form.Text muted>The URL of the repository.</Form.Text>
                                </Form.Group>
                                <Card.Title>
                                    {/* <FormattedMessage id="fields.instance.name" /> */}
                                    Repository Branch
                                </Card.Title>
                                <Form.Group>
                                    <InputGroup hasValidation>
                                        <Form.Control
                                            type="text"
                                            key="test"
                                            placeholder={"(default branch)"}
                                            value={String(this.state.modifiedRepoValues.reference)}
                                            onChange={e => {
                                                this.setState({
                                                    modifiedRepoValues: {
                                                        ...this.state.modifiedRepoValues,
                                                        reference: e.currentTarget.value
                                                    }
                                                });
                                            }}
                                        />
                                        {this.state?.serverModel?.reference &&
                                            this.state.modifiedRepoValues.reference !==
                                                this.state?.serverModel.reference && (
                                                <InputGroup.Append>
                                                    <Button
                                                        variant="secondary"
                                                        onClick={() => {
                                                            this.setState({
                                                                modifiedRepoValues: {
                                                                    ...this.state
                                                                        .modifiedRepoValues,
                                                                    reference: String(
                                                                        this.state?.serverModel
                                                                            ?.reference
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
                                    <Form.Text muted>
                                        Repository Branch. Leave empty for default.
                                    </Form.Text>
                                </Form.Group>
                                <Form.Group>
                                    <Form.Check
                                        type="switch"
                                        // checked
                                        id={"recursive-submodule-toggle"}
                                        label={"Recursive Submodules"}
                                        defaultChecked
                                    />
                                    <Form.Text muted>
                                        What is recursive submodule?? Hewwo?
                                    </Form.Text>
                                </Form.Group>
                                <Form.Group>
                                    <Form.Check
                                        type="switch"
                                        id={"dep-after-tm-toggle"}
                                        label={"Deploy after updating testmerges"}
                                    />
                                    <Form.Text muted>
                                        What is recursive submodule?? Hewwo?
                                    </Form.Text>
                                </Form.Group>
                                <Button
                                    variant="success"
                                    size="sm"
                                    onClick={() => {
                                        alert("Saved. Or something? Idk.");
                                    }}
                                    disabled={!!this.state?.serverModel?.origin}>
                                    Clone <FontAwesomeIcon icon="code-branch" />
                                </Button>{" "}
                                <Button
                                    size="sm"
                                    onClick={() => {
                                        alert("Saved. Or something? Idk.");
                                    }}>
                                    Apply Changes
                                </Button>{" "}
                                <Button
                                    size="sm"
                                    variant="danger"
                                    onClick={() => {
                                        alert("Saved. Or something? Idk.");
                                    }}>
                                    Delete Repository
                                </Button>
                            </Card.Body>
                        </Card>
                    </CardColumns>
                </CardColumns>
            </>
        );
    }
}
