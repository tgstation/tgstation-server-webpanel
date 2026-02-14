import React from "react";
import { Button, ButtonGroup, Card, Modal, OverlayTrigger, Table, Tooltip } from "react-bootstrap";
import { FormattedMessage } from "react-intl";

import DreamMakerClient from "../../../../ApiClient/DreamMakerClient";
import {
    DreamMakerRights,
    ErrorCode as TGSErrorCode,
    JobResponse,
    RemoteGitProvider,
    RepositoryCreateRequest,
    RepositoryResponse,
    RepositoryRights,
    RepositoryUpdateRequest,
    TestMerge,
    TestMergeParameters
} from "../../../../ApiClient/generatedcode/generated";
import JobsClient from "../../../../ApiClient/JobsClient";
import InternalError, { ErrorCode } from "../../../../ApiClient/models/InternalComms/InternalError";
import { StatusCode } from "../../../../ApiClient/models/InternalComms/InternalStatus";
import RepositoryClient from "../../../../ApiClient/RepositoryClient";
import configOptions from "../../../../ApiClient/util/config";
import JobsController from "../../../../ApiClient/util/JobsController";
import { InstanceEditContext } from "../../../../contexts/InstanceEditContext";
import GithubClient, { PullRequest } from "../../../../utils/GithubClient";
import { hasDreamMakerRight, hasRepoRight } from "../../../../utils/misc";
import ErrorAlert from "../../../utils/ErrorAlert";
import GenericAlert from "../../../utils/GenericAlert";
import InputField, { FieldType } from "../../../utils/InputField";
import InputForm from "../../../utils/InputForm";
import { DebugJsonViewer } from "../../../utils/JsonViewer";
import Loading from "../../../utils/Loading";
import SimpleToolTip from "../../../utils/SimpleTooltip";
import TestMergeRow from "../../../utils/TestMergeRow";

enum PRState {
    reapply = "reapply",
    added = "added",
    removed = "removed",
    updated = "updated",
    rename = "renamed"
}

enum ResetType {
    None,
    Local,
    Remote
}

enum CredentialsType {
    None,
    Password,
    Token,
    PrivateKey
}

type IProps = object;

interface IState {
    errors: Array<InternalError<ErrorCode> | undefined>;
    repositoryInfo: RepositoryResponse | null;
    writableCredentials: IWritableCredentials | null;
    credMode: CredentialsType;
    showCredsModal: boolean;
    loading: boolean;
    cloning: boolean;
    repoBusy: boolean;
    unableToHookClone: boolean;
    loadingPRs: boolean;
    gitHubPRs: PullRequest[] | null;
    manualPRs: TestMergeParameters[];
    resetType: ResetType;
    desiredState: Map<string, [current: boolean, sha: string, comment: string | null] | null>;
    showDeleteModal: boolean;
    showRecloneModal: boolean;
    manualPR: number;
    manualRepo: string;
    lastManualPR: number;
    lastManualRepo: string;
    deployAfter: boolean;
    viewedRepo: string;
}

interface IWritableCredentials {
    accessUser: string;
    accessToken: string;
}

class Repository extends React.Component<IProps, IState> {
    public declare context: InstanceEditContext;

    public constructor(props: IProps) {
        super(props);

        this.state = {
            errors: [],
            repositoryInfo: null,
            writableCredentials: null,
            credMode: CredentialsType.PrivateKey,
            showCredsModal: false,
            loading: true,
            cloning: false,
            unableToHookClone: false,
            gitHubPRs: null,
            manualPRs: [],
            resetType: ResetType.Remote,
            desiredState: new Map<
                string,
                [current: boolean, sha: string, comment: string | null] | null
            >(),
            showDeleteModal: false,
            showRecloneModal: false,
            manualPR: 0,
            manualRepo: "",
            lastManualPR: 0,
            lastManualRepo: "",
            deployAfter: false,
            repoBusy: false,
            loadingPRs: false,
            viewedRepo: ""
        };

        this.fetchRepositoryInfo = this.fetchRepositoryInfo.bind(this);
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

    private getTestMergeKey(prNumber: number, sourceRepository?: string | null): string {
        return sourceRepository ? `${sourceRepository}#${prNumber}` : `${prNumber}`;
    }

    public componentDidMount(): void {
        this.setState({
            deployAfter: hasDreamMakerRight(
                this.context.instancePermissionSet,
                DreamMakerRights.Compile
            )
        });
        void this.fetchRepositoryInfo(undefined, true);
    }

    private async fetchRepositoryInfo(
        cloneJob?: JobResponse,
        resetDesiredState?: boolean
    ): Promise<void> {
        if (!hasRepoRight(this.context.instancePermissionSet, RepositoryRights.Read)) {
            this.setState({
                loading: false,
                cloning: false
            });
            this.reloadDesiredState(null, resetDesiredState ?? false, false);
            this.setState({
                repositoryInfo: null,
                credMode: CredentialsType.PrivateKey
            });
        }

        const response = await RepositoryClient.getRepository(this.context.instance.id);

        this.setState({
            cloning: false,
            repoBusy: false
        });
        if (response.code === StatusCode.ERROR) {
            if (
                response.error.code === ErrorCode.HTTP_DATA_INEGRITY &&
                response.error.originalErrorMessage?.errorCode === TGSErrorCode.RepoCloning
            ) {
                this.setState({
                    cloning: true,
                    unableToHookClone: false
                });
                if (cloneJob) {
                    JobsController.registerCallback(cloneJob.id, this.fetchRepositoryInfo);
                } else {
                    const response2 = await JobsClient.listActiveJobs(this.context.instance.id, {
                        page: 1,
                        pageSize: 100
                    });
                    if (response2.code === StatusCode.OK) {
                        const cloneJob = response2.payload.content
                            .sort((a, b) => b.id - a.id)
                            .find(
                                job =>
                                    job.description.includes("Clone") &&
                                    job.description.includes("repository")
                            );
                        if (cloneJob) {
                            JobsController.registerCallback(cloneJob.id, this.fetchRepositoryInfo);
                        } else {
                            this.setState({
                                unableToHookClone: true
                            });
                        }
                    } else {
                        this.addError(response2.error);
                        this.setState({
                            unableToHookClone: true
                        });
                    }
                }
            } else if (
                response.error.code === ErrorCode.HTTP_DATA_INEGRITY &&
                response.error.originalErrorMessage?.errorCode === TGSErrorCode.RepoBusy
            ) {
                this.setState({
                    repoBusy: true
                });
            } else {
                this.addError(response.error);
            }
        } else {
            this.reloadPRs(response.payload, resetDesiredState);
            //response.payload.remoteGitProvider = RemoteGitProvider.GitLab;
            this.setState({
                repositoryInfo: response.payload,
                credMode: CredentialsType.PrivateKey
            });
        }
        this.setState({ loading: false });
    }

    private reloadPRs(repositoryInfo: RepositoryResponse, resetDesiredState?: boolean) {
        if (
            repositoryInfo.remoteGitProvider === RemoteGitProvider.GitHub &&
            repositoryInfo.remoteRepositoryName &&
            repositoryInfo.remoteRepositoryOwner
        ) {
            this.setState({
                loadingPRs: true
            });

            const reposToFetch = new Map<string, number[]>();
            const primaryRepo = `${repositoryInfo.remoteRepositoryOwner}/${repositoryInfo.remoteRepositoryName}`;
            reposToFetch.set(primaryRepo, []);

            repositoryInfo.revisionInformation?.activeTestMerges.forEach(tm => {
                const repo = tm.sourceRepository ?? primaryRepo;
                const prs = reposToFetch.get(repo) ?? [];
                prs.push(tm.number);
                reposToFetch.set(repo, prs);
            });

            const fetchPromises = Array.from(reposToFetch.entries()).map(([repoPath, wantedPRs]) => {
                const [owner, repo] = repoPath.split("/");
                return GithubClient.getPRs({
                    owner,
                    repo,
                    wantedPRs
                });
            });

            Promise.all(fetchPromises)
                .then(results => {
                    this.setState({
                        loadingPRs: false
                    });

                    const allPRs: PullRequest[] = [];
                    for (const res of results) {
                        if (res.code === StatusCode.ERROR) {
                            this.addError(res.error);
                        } else {
                            allPRs.push(...res.payload);
                        }
                    }

                    this.setState({
                        gitHubPRs: allPRs
                    });
                    if (resetDesiredState)
                        this.reloadDesiredState(repositoryInfo, true, false, allPRs);
                })
                .catch(e => {
                    this.setState({
                        loadingPRs: false
                    });
                    this.addError(new InternalError(ErrorCode.APP_FAIL, { jsError: e as Error }));
                });
        }
    }

    private async applyTestmerges(noBranch: boolean): Promise<void> {
        const editOptions: RepositoryUpdateRequest = {};
        const repositoryInfo = this.state.repositoryInfo;
        const willReset = this.state.resetType !== ResetType.None;

        if (this.state.resetType === ResetType.Local) {
            editOptions.checkoutSha = repositoryInfo?.revisionInformation?.originCommitSha;
        } else if (this.state.resetType === ResetType.Remote) {
            editOptions.updateFromOrigin = true;
            editOptions.reference = repositoryInfo?.reference;
        }

        if (repositoryInfo && repositoryInfo?.remoteGitProvider === RemoteGitProvider.GitHub) {
            const testMergeArray: TestMergeParameters[] = [];
            [...this.state.desiredState.entries()].forEach(([key, prDesiredState]) => {
                if (!prDesiredState) return;
                const [current, commit, comment] = prDesiredState;
                //If we aren't resetting, ignore PRs we didn't touch
                if (current && !(willReset || noBranch)) return;

                const parts = key.split("#");
                const number = parseInt(parts[parts.length - 1]);
                const sourceRepository = parts.length > 1 ? parts[0] : undefined;

                testMergeArray.push({
                    number: number,
                    sourceRepository: sourceRepository,
                    targetCommitSha: commit,
                    comment
                });
            });
            if (testMergeArray.length) editOptions.newTestMerges = testMergeArray;
        }
        const testMergeArray = editOptions.newTestMerges ?? [];
        this.state.manualPRs.forEach(pr => testMergeArray.push(pr));
        if (testMergeArray.length) editOptions.newTestMerges = testMergeArray;

        this.setState({
            loading: true
        });
        const response = await RepositoryClient.editRepository(
            this.context.instance.id,
            editOptions
        );
        this.setState({
            loading: false
        });
        if (response.code === StatusCode.OK) {
            if (response.payload.activeJob) {
                this.setState({
                    loading: true
                });
                JobsController.fastmode = 5;
                JobsController.registerCallback(response.payload.activeJob.id, job => {
                    return this.fetchRepositoryInfo(
                        job,
                        job.errorCode === undefined && job.exceptionDetails === undefined
                    );
                });
                JobsController.registerJob(response.payload.activeJob, this.context.instance.id);
                if (this.state.deployAfter) {
                    const jobId = response.payload.activeJob.id;
                    const deployinterval = setInterval(() => {
                        const targetJob = JobsController.jobs.get(jobId);
                        if (typeof targetJob?.progress === "number" || targetJob?.stoppedAt) {
                            if (!targetJob.errorCode && !targetJob.exceptionDetails) {
                                void DreamMakerClient.startCompile(this.context.instance.id).then(
                                    response => {
                                        if (response.code === StatusCode.ERROR) {
                                            this.addError(response.error);
                                        }
                                    }
                                );
                            }
                            clearInterval(deployinterval);
                        }
                    }, 5000);
                }
            } else {
                await this.fetchRepositoryInfo();
            }
        } else {
            this.addError(response.error);
        }
    }

    private reloadDesiredState(
        repoinfo: RepositoryResponse | null,
        reset: boolean,
        harderReset: boolean,
        gitHubPRs?: PullRequest[] | null
    ) {
        gitHubPRs = gitHubPRs ?? this.state.gitHubPRs;
        if (reset) {
            this.setState(prevState => {
                return {
                    resetType: harderReset ? ResetType.None : prevState.resetType,
                    manualPRs: []
                };
            });
        }

        if (!repoinfo) return;

        this.setState(prevState => {
            const desiredState = prevState.desiredState;
            const newDesiredState = new Map(!reset ? desiredState : []);
            let updatingTMs = false;
            const regularReset = reset && !harderReset;
            repoinfo.revisionInformation?.activeTestMerges.forEach(pr => {
                const key = this.getTestMergeKey(pr.number, pr.sourceRepository);
                const currentDesiredState = newDesiredState.get(key);
                if (!reset) {
                    //We want the PR gone, don't retestmerge it
                    if (!currentDesiredState) return;
                    //We want the PR updated to a specific commit, don't mess with it
                    if (currentDesiredState && !currentDesiredState[0]) return;
                }

                const gitHubPR = gitHubPRs?.find(
                    potentialGitHubPR =>
                        pr.number === potentialGitHubPR.number &&
                        (pr.sourceRepository ?? "") === (potentialGitHubPR.sourceRepository ?? "")
                );

                const defaultDesiredState = gitHubPR?.state === "merged" ? false : true;
                if (regularReset && !defaultDesiredState) {
                    newDesiredState.set(key, null);
                    updatingTMs = true;
                } else {
                    const newHead = (regularReset ? gitHubPR?.head : null) ?? pr.targetCommitSha;
                    if (regularReset && newHead !== pr.targetCommitSha) {
                        updatingTMs = true;
                    }
                    newDesiredState.set(key, [true, newHead, pr.comment ?? ""]);
                }
            });

            const resetType = updatingTMs
                ? repoinfo.reference === "(no branch)"
                    ? ResetType.Local
                    : ResetType.Remote
                : prevState.resetType;
            return {
                resetType,
                desiredState: newDesiredState
            };
        });
    }

    public render(): React.ReactNode {
        return (
            <div className="text-center">
                <DebugJsonViewer obj={this.state} />
                {this.renderErrors()}
                {/*Just like... hope its cloned if you don't have read access*/}

                {this.state.cloning ? (
                    <Loading text="loading.repo.cloning" />
                ) : this.state.repositoryInfo && !this.state.repositoryInfo.origin ? (
                    this.renderPreClone()
                ) : (
                    <React.Fragment>
                        <h3>
                            <FormattedMessage id="view.instance.repo.repoinfo" />
                        </h3>
                        {this.state.repoBusy ? (
                            <Loading text="loading.repo.busy" />
                        ) : (
                            <React.Fragment>
                                {this.renderRepoInformation()}
                                <hr />
                                {this.renderSettings()}
                                <hr />
                                {this.renderTestMerges()}
                                <hr />
                                {this.renderReclone()}
                                <hr />
                                {this.renderDelete()}
                            </React.Fragment>
                        )}
                    </React.Fragment>
                )}
            </div>
        );
    }

    private renderErrors(): React.ReactNode {
        return (
            <React.Fragment>
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
            </React.Fragment>
        );
    }

    private renderRepoInformation(): React.ReactNode {
        const repositoryInfo = this.state.repositoryInfo;
        if (!repositoryInfo) return <GenericAlert title="view.instance.repo.norepoinfo" />;

        return (
            <table className="mx-auto text-left">
                <tbody>
                    <tr>
                        <td>
                            <span className="mr-3">
                                <FormattedMessage id="view.instance.repo.info.origin" />
                            </span>
                        </td>
                        <td>{repositoryInfo.origin}</td>
                    </tr>
                    <tr>
                        <td>
                            <span className="mr-3">
                                <FormattedMessage id="view.instance.repo.info.owner" />
                            </span>
                        </td>
                        <td>{repositoryInfo.remoteRepositoryOwner}</td>
                    </tr>
                    <tr>
                        <td>
                            <span className="mr-3">
                                <FormattedMessage id="view.instance.repo.info.name" />
                            </span>
                        </td>
                        <td>{repositoryInfo.remoteRepositoryName}</td>
                    </tr>
                </tbody>
            </table>
        );
    }

    private renderPreClone(): React.ReactNode {
        const cloneFields = {
            origin: {
                type: FieldType.String as FieldType.String,
                name: "fields.instance.repository.url"
            },
            reference: {
                type: FieldType.String as FieldType.String,
                name: "fields.instance.repository.ref",
                defaultValue: ""
            },
            updateSubmodules: {
                type: FieldType.Boolean as FieldType.Boolean,
                name: "fields.instance.repository.enablesubmodules",
                defaultValue: true
            }
        };

        return (
            <React.Fragment>
                <h3>
                    <FormattedMessage id="view.instance.repo.clone" />
                </h3>
                {this.renderCredsModal()}
                <InputForm
                    fields={cloneFields}
                    hideDisabled={
                        !hasRepoRight(this.context.instancePermissionSet, RepositoryRights.Read)
                    }
                    onSave={async result => {
                        const repoCloneRequest: RepositoryCreateRequest = {
                            ...result
                        };

                        if (result.reference == "") repoCloneRequest.reference = null;
                        if (this.state.writableCredentials) {
                            repoCloneRequest.accessUser = this.state.writableCredentials.accessUser;
                            repoCloneRequest.accessToken =
                                this.state.writableCredentials.accessToken;
                        }

                        const response = await RepositoryClient.cloneRepository(
                            this.context.instance.id,
                            repoCloneRequest
                        );
                        if (response.code === StatusCode.OK) {
                            this.setState({ writableCredentials: null });
                            await this.fetchRepositoryInfo(response.payload.activeJob ?? undefined);
                        } else {
                            this.addError(response.error);
                        }
                    }}
                    includeAll
                    alwaysAllowSave={!!this.state.writableCredentials}
                    saveMessageId="generic.clone"
                />
            </React.Fragment>
        );
    }

    private renderSettings(): React.ReactNode {
        const repositoryInfo = this.state.repositoryInfo;
        const editFields = {
            originCheckoutSha: {
                type: FieldType.String as FieldType.String,
                name: "fields.instance.repository.origincheckoutsha",
                disabled: true,
                defaultValue: repositoryInfo
                    ? repositoryInfo.revisionInformation?.originCommitSha
                    : "",
                tooltip: "fields.instance.repository.origincheckoutsha.desc"
            },
            checkoutSha: {
                type: FieldType.String as FieldType.String,
                name: "fields.instance.repository.checkoutsha",
                defaultValue: repositoryInfo ? repositoryInfo.revisionInformation?.commitSha : "",
                tooltip: "fields.instance.repository.checkoutsha.desc",
                disabled: !hasRepoRight(this.context.instancePermissionSet, RepositoryRights.SetSha)
            },
            reference: {
                type: FieldType.String as FieldType.String,
                name: "fields.instance.repository.reference",
                defaultValue: repositoryInfo ? repositoryInfo.reference : "",
                tooltip: "fields.instance.repository.reference.desc",
                disabled: !hasRepoRight(
                    this.context.instancePermissionSet,
                    RepositoryRights.SetReference
                )
            },
            committerName: {
                type: FieldType.String as FieldType.String,
                name: "fields.instance.repository.committerName",
                defaultValue: repositoryInfo ? repositoryInfo.committerName : "",
                disabled: !hasRepoRight(
                    this.context.instancePermissionSet,
                    RepositoryRights.ChangeCommitter
                )
            },
            committerEmail: {
                type: FieldType.String as FieldType.String,
                name: "fields.instance.repository.committerEmail",
                defaultValue: repositoryInfo ? repositoryInfo.committerEmail : "",
                disabled: !hasRepoRight(
                    this.context.instancePermissionSet,
                    RepositoryRights.ChangeCommitter
                )
            },
            pushTestMergeCommits: {
                type: FieldType.Boolean as FieldType.Boolean,
                name: "fields.instance.repository.pushTestMergeCommits",
                defaultValue: repositoryInfo ? repositoryInfo.pushTestMergeCommits : false,
                tooltip: "fields.instance.repository.pushTestMergeCommits.desc",
                disabled: !hasRepoRight(
                    this.context.instancePermissionSet,
                    RepositoryRights.ChangeTestMergeCommits
                )
            },
            createGitHubDeployments: {
                type: FieldType.Boolean as FieldType.Boolean,
                name: "fields.instance.repository.createGitHubDeployments",
                defaultValue: repositoryInfo ? repositoryInfo.createGitHubDeployments : false,
                tooltip: "fields.instance.repository.createGitHubDeployments.desc",
                disabled: !hasRepoRight(
                    this.context.instancePermissionSet,
                    RepositoryRights.ChangeTestMergeCommits
                )
            },
            showTestMergeCommitters: {
                type: FieldType.Boolean as FieldType.Boolean,
                name: "fields.instance.repository.showTestMergeCommitters",
                defaultValue: repositoryInfo ? repositoryInfo.showTestMergeCommitters : false,
                tooltip: "fields.instance.repository.showTestMergeCommitters.desc",
                disabled: !hasRepoRight(
                    this.context.instancePermissionSet,
                    RepositoryRights.ChangeTestMergeCommits
                )
            },
            autoUpdatesKeepTestMerges: {
                type: FieldType.Boolean as FieldType.Boolean,
                name: "fields.instance.repository.autoUpdatesKeepTestMerges",
                defaultValue: repositoryInfo ? repositoryInfo.autoUpdatesKeepTestMerges : false,
                tooltip: "fields.instance.repository.autoUpdatesKeepTestMerges.desc",
                disabled: !hasRepoRight(
                    this.context.instancePermissionSet,
                    RepositoryRights.ChangeAutoUpdateSettings
                )
            },
            autoUpdatesSynchronize: {
                type: FieldType.Boolean as FieldType.Boolean,
                name: "fields.instance.repository.autoUpdatesSynchronize",
                defaultValue: repositoryInfo ? repositoryInfo.autoUpdatesSynchronize : false,
                tooltip: "fields.instance.repository.autoUpdatesSynchronize.desc",
                disabled: !hasRepoRight(
                    this.context.instancePermissionSet,
                    RepositoryRights.ChangeAutoUpdateSettings
                )
            },
            postTestMergeComment: {
                type: FieldType.Boolean as FieldType.Boolean,
                name: "fields.instance.repository.postTestMergeComment",
                defaultValue: repositoryInfo ? repositoryInfo.postTestMergeComment : false,
                tooltip: "fields.instance.repository.postTestMergeComment.desc",
                disabled: !hasRepoRight(
                    this.context.instancePermissionSet,
                    RepositoryRights.ChangeTestMergeCommits
                )
            },
            updateSubmodules: {
                type: FieldType.Boolean as FieldType.Boolean,
                name: "fields.instance.repository.updateSubmodules",
                defaultValue: repositoryInfo ? repositoryInfo.updateSubmodules : false,
                tooltip: "fields.instance.repository.updateSubmodules.desc",
                disabled: !hasRepoRight(
                    this.context.instancePermissionSet,
                    RepositoryRights.ChangeSubmoduleUpdate
                )
            }
        };

        return (
            <React.Fragment>
                <h3>
                    <FormattedMessage id="view.instance.repo.reposettings" />
                </h3>
                {this.renderCredsModal()}
                <InputForm
                    fields={editFields}
                    onSave={async result => {
                        this.setState({ loading: true, writableCredentials: null });
                        const repoUpdateRequest: RepositoryUpdateRequest = { ...result };
                        if (this.state.writableCredentials) {
                            repoUpdateRequest.accessUser =
                                this.state.writableCredentials.accessUser;
                            repoUpdateRequest.accessToken =
                                this.state.writableCredentials.accessToken;
                        }

                        const response = await RepositoryClient.editRepository(
                            this.context.instance.id,
                            repoUpdateRequest
                        );
                        this.setState({ loading: false });
                        if (response.code === StatusCode.OK) {
                            if (response.payload.activeJob) {
                                this.setState({ loading: true });
                                JobsController.fastmode = 5;
                                JobsController.registerCallback(response.payload.activeJob.id, () =>
                                    this.fetchRepositoryInfo(undefined, true)
                                );
                                JobsController.registerJob(
                                    response.payload.activeJob,
                                    this.context.instance.id
                                );
                            } else {
                                await this.fetchRepositoryInfo();
                            }
                        } else {
                            this.addError(response.error);
                        }
                    }}
                    alwaysAllowSave={!!this.state.writableCredentials}
                />
            </React.Fragment>
        );
    }

    private renderCredDetails(): React.ReactNode {
        const credMode = this.state.credMode;
        const writableCredentials = this.state.writableCredentials;
        const repoInfo = this.state.repositoryInfo;

        const [credModeName] = Object.entries(CredentialsType)
            //filters out reverse mapping
            .find(([, value]) => value == credMode)!;

        const localeId = `fields.instance.repository.creds.mode.${credModeName}`;

        const baseFields = {
            username: {
                type: FieldType.String as FieldType.String,
                name: localeId + ".username",
                tooltip: localeId + ".username.desc",
                defaultValue: writableCredentials?.accessUser ?? repoInfo?.accessUser ?? ""
            }
        };

        const regularFields = {
            ...baseFields,
            token: {
                type: FieldType.Password as FieldType.Password,
                name: localeId + ".token",
                tooltip: localeId + ".token.desc",
                defaultValue: writableCredentials?.accessToken ?? ""
            }
        };

        const privateKeyFields = {
            ...baseFields,
            clientId: {
                type: FieldType.String as FieldType.String,
                name: localeId + ".id",
                tooltip: localeId + ".id.desc"
            },
            privateKey: {
                type: FieldType.TextArea as FieldType.TextArea,
                name: localeId + ".pk",
                tooltip: localeId + ".pk.desc"
            }
        };

        return (
            <React.Fragment>
                <div
                    style={{
                        display: credMode != CredentialsType.PrivateKey ? "none" : undefined
                    }}>
                    <InputForm
                        fields={privateKeyFields}
                        onSave={result => {
                            const username = result.username?.trim();
                            const clientId = result.clientId?.trim();
                            const privateKey = result.privateKey?.trim();

                            if (!username?.length || !clientId?.length || !privateKey?.length) {
                                alert("Please enter a username, client/app ID, and private key!");
                                return;
                            }

                            const tgsEncodedAppPrivateKey = `TGS_PK_${clientId}:${btoa(privateKey)}`;

                            this.setState({
                                writableCredentials: {
                                    accessUser: username,
                                    accessToken: tgsEncodedAppPrivateKey
                                },
                                showCredsModal: false
                            });
                        }}
                    />
                </div>
                <div
                    style={{
                        display: credMode == CredentialsType.PrivateKey ? "none" : undefined
                    }}>
                    <InputForm
                        fields={regularFields}
                        onSave={result => {
                            const username = result.username?.trim();
                            const token = result.token?.trim();

                            if (!username?.length || !token?.length) {
                                alert(
                                    `Please enter both a username and a ${credMode == CredentialsType.Password ? "password" : "token"}!`
                                );
                                return;
                            }

                            this.setState({
                                writableCredentials: {
                                    accessUser: username,
                                    accessToken: token
                                },
                                showCredsModal: false
                            });
                        }}
                    />
                </div>
            </React.Fragment>
        );
    }

    private renderCredsModal(): React.ReactNode {
        const canCreds = hasRepoRight(
            this.context.instancePermissionSet,
            RepositoryRights.ChangeCredentials
        );
        const editButton = (
            <Button disabled={!canCreds} onClick={() => this.setState({ showCredsModal: true })}>
                <FormattedMessage id="generic.edit" />
            </Button>
        );
        const credMode = this.state.credMode;

        return (
            <React.Fragment>
                <Modal
                    show={this.state.showCredsModal}
                    onHide={() => this.setState({ showCredsModal: false })}
                    centered
                    size="lg">
                    <Modal.Header closeButton>
                        <Modal.Title>
                            <FormattedMessage id="view.instance.repo.creds.modal.title" />
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <InputField
                            name="fields.instance.repository.creds.mode"
                            type={FieldType.Enum}
                            enum={CredentialsType}
                            defaultValue={credMode}
                            onChange={newCredentialsType =>
                                this.setState({ credMode: newCredentialsType })
                            }
                        />
                        {credMode != CredentialsType.None ? (
                            this.renderCredDetails()
                        ) : (
                            <Modal.Footer>
                                <Button
                                    className="text-center"
                                    variant="danger"
                                    onClick={() =>
                                        this.setState({
                                            showCredsModal: false,
                                            writableCredentials: {
                                                accessUser: "",
                                                accessToken: ""
                                            }
                                        })
                                    }>
                                    <FormattedMessage id="generic.save" />
                                </Button>
                                <Button
                                    className="text-center"
                                    onClick={() =>
                                        this.setState({
                                            showCredsModal: false,
                                            writableCredentials: null
                                        })
                                    }>
                                    <FormattedMessage id="generic.reset" />
                                </Button>
                            </Modal.Footer>
                        )}
                        {credMode != CredentialsType.None ? (
                            <Modal.Footer>
                                <Button
                                    className="text-center"
                                    onClick={() =>
                                        this.setState({
                                            showCredsModal: false,
                                            writableCredentials: null
                                        })
                                    }>
                                    <FormattedMessage id="generic.reset" />
                                </Button>
                            </Modal.Footer>
                        ) : null}
                    </Modal.Body>
                </Modal>
                <div className="d-flex mt-5">
                    <InputField
                        name="view.instance.repo.creds"
                        tooltip="view.instance.repo.creds.desc"
                        type={FieldType.String}
                        defaultValue={
                            (this.state.writableCredentials
                                ? this.state.writableCredentials.accessUser
                                : this.state.repositoryInfo?.accessUser) || "(Unset)"
                        }
                        onChange={() => {}}
                        disabled
                        hideReadOnly
                        additionalAppend={editButton}
                        forceChanged={!!this.state.writableCredentials}
                    />
                </div>
            </React.Fragment>
        );
    }

    private renderTestMerges(): React.ReactNode {
        const repositoryInfo = this.state.repositoryInfo;

        const canDeploy = hasDreamMakerRight(
            this.context.instancePermissionSet,
            DreamMakerRights.Compile
        );
        const canAdd = hasRepoRight(
            this.context.instancePermissionSet,
            RepositoryRights.MergePullRequest
        );
        const canUpdate =
            hasRepoRight(this.context.instancePermissionSet, RepositoryRights.Read) &&
            hasRepoRight(this.context.instancePermissionSet, RepositoryRights.UpdateBranch);

        const testmergedPRs = new Map<string, TestMerge>();
        if (repositoryInfo) {
            repositoryInfo.revisionInformation?.activeTestMerges.forEach(pr =>
                testmergedPRs.set(this.getTestMergeKey(pr.number, pr.sourceRepository), pr)
            );
        }
        const sortedPRs =
            (this.state.gitHubPRs ?? [])
                .filter(pr => {
                    const viewedRepo =
                        this.state.viewedRepo ||
                        `${repositoryInfo?.remoteRepositoryOwner}/${repositoryInfo?.remoteRepositoryName}`;
                    const prRepo = pr.sourceRepository;
                    return prRepo === viewedRepo || testmergedPRs.has(this.getTestMergeKey(pr.number, pr.sourceRepository));
                })
                .sort((a, b) => {
                const aKey = this.getTestMergeKey(a.number, a.sourceRepository);
                const bKey = this.getTestMergeKey(b.number, b.sourceRepository);
                if (testmergedPRs.has(aKey) !== testmergedPRs.has(bKey)) {
                    return testmergedPRs.has(aKey) ? -1 : 1;
                }
                if (a.testmergelabel !== b.testmergelabel) {
                    return a.testmergelabel ? -1 : 1;
                }
                if (a.mergeable !== b.mergeable) {
                    return a.mergeable ? -1 : 1;
                }
                return a.number - b.number;
            }) ?? [];
        const filteredPendingActions = sortedPRs
            .map(pr => {
                const key = this.getTestMergeKey(pr.number, pr.sourceRepository);
                const desiredPRState = this.state.desiredState.get(key);
                const tmInfo = !repositoryInfo
                    ? undefined
                    : repositoryInfo?.revisionInformation?.activeTestMerges.find(
                          activePR =>
                              activePR.number === pr.number &&
                              (activePR.sourceRepository ?? "") === (pr.sourceRepository ?? "")
                      );

                if (desiredPRState) {
                    if (!tmInfo) {
                        return [PRState.added, pr];
                    } else if (tmInfo.targetCommitSha !== desiredPRState[1]) {
                        return [PRState.updated, pr];
                    } else if ((tmInfo.comment ?? "") !== desiredPRState[2]) {
                        return [PRState.rename, pr];
                    } else {
                        return [PRState.reapply, pr];
                    }
                }
                if (!this.state.desiredState.get(key)) {
                    if (!tmInfo) return null;

                    return [PRState.removed, pr];
                }
                return null;
            })
            .filter(value => value !== null) as [PRState, PullRequest][];
        const sortedPendingActions = filteredPendingActions.sort((a, b) => {
            const order = [PRState.removed, PRState.reapply, PRState.added, PRState.updated];
            for (const state of order) {
                if (
                    // @ts-expect-error again, ts doesn't want people to use xor on booleans, and I disagree
                    (a[0] === state) ^
                    (b[0] === state)
                ) {
                    return a[0] === state ? -1 : 1;
                }
            }
            return 0;
        });
        const noBranch = !repositoryInfo ? false : repositoryInfo.reference === "(no branch)";
        const forceReset = filteredPendingActions.some(
            action => action[0] != PRState.added && action[0] != PRState.reapply
        );

        //PRs we haven't touched, only used to display prs to reapply after reset
        const noPendingChanges =
            filteredPendingActions.filter(([state]) => state !== PRState.reapply).length === 0 &&
            this.state.resetType === ResetType.None &&
            !this.state.manualPRs.length;

        if (repositoryInfo && repositoryInfo.remoteGitProvider == RemoteGitProvider.Unknown)
            return <GenericAlert title="view.instance.repo.testmerges.badprovider" />;

        return (
            <div className="mx-5">
                <Card className="mb-5">
                    <Card.Header>
                        <FormattedMessage id="view.instance.repo.pending.title" />
                    </Card.Header>
                    <Card.Body className="text-left">
                        <ul>
                            {noPendingChanges ? (
                                <li className="font-weight-lighter font-italic">
                                    <FormattedMessage id="view.instance.repo.pending.none" />
                                </li>
                            ) : (
                                <React.Fragment>
                                    {repositoryInfo && noBranch ? (
                                        <li>
                                            <FormattedMessage
                                                id="view.instance.repo.pending.reset.nobranch"
                                                values={{
                                                    commit: repositoryInfo.revisionInformation?.originCommitSha.substring(
                                                        0,
                                                        7
                                                    )
                                                }}
                                            />
                                        </li>
                                    ) : this.state.resetType === ResetType.Remote ? (
                                        <li>
                                            <FormattedMessage id="view.instance.repo.pending.update" />
                                        </li>
                                    ) : this.state.resetType === ResetType.Local ? (
                                        <li>
                                            <FormattedMessage id="view.instance.repo.pending.reset" />
                                        </li>
                                    ) : null}
                                    {repositoryInfo &&
                                    repositoryInfo.remoteGitProvider === RemoteGitProvider.GitHub
                                        ? sortedPendingActions.map(([state, pr]) => {
                                              const key = this.getTestMergeKey(
                                                  pr.number,
                                                  pr.sourceRepository
                                              );
                                              const prDesiredState = this.state.desiredState.get(
                                                  key
                                              );

                                              if (
                                                  state === PRState.reapply &&
                                                  !(
                                                      this.state.resetType !== ResetType.None ||
                                                      noBranch
                                                  )
                                              )
                                                  return null;

                                              let targetCommit = prDesiredState
                                                  ? prDesiredState[1].substring(0, 7)
                                                  : null;

                                              const gitHubPR = this.state.gitHubPRs?.find(
                                                  gitHubPR => pr.number === gitHubPR.number
                                              );

                                              if (
                                                  !targetCommit ||
                                                  gitHubPR?.head.startsWith(targetCommit)
                                              )
                                                  targetCommit = `HEAD (${(
                                                      targetCommit ?? gitHubPR!.head
                                                  ).substring(0, 7)})`;

                                              return (
                                                  <li key={pr.number}>
                                                      <FormattedMessage
                                                          id={`view.instance.repo.pending.${state}`}
                                                          values={{
                                                              number: pr.number,
                                                              commit: targetCommit,
                                                              title: pr.title
                                                          }}
                                                      />
                                                  </li>
                                              );
                                          })
                                        : null}
                                    {this.state.manualPRs.map(pr => (
                                        <li
                                            key={this.getTestMergeKey(
                                                pr.number,
                                                pr.sourceRepository
                                            )}>
                                            <FormattedMessage
                                                id={`view.instance.repo.pending.added.manual`}
                                                values={{
                                                    number: pr.number
                                                }}
                                            />
                                        </li>
                                    ))}
                                    {this.state.deployAfter ? (
                                        <li key="deploy">
                                            <FormattedMessage
                                                id={`view.instance.repo.pending.deploy`}
                                            />
                                        </li>
                                    ) : null}
                                </React.Fragment>
                            )}
                        </ul>
                        <ButtonGroup size="lg" className="mb-2 text-center">
                            <Button
                                disabled={noBranch || !canUpdate}
                                onClick={() => this.setState({ resetType: ResetType.Remote })}
                                variant={
                                    this.state.resetType === ResetType.Remote
                                        ? "secondary"
                                        : "primary"
                                }>
                                <FormattedMessage id="view.instance.repo.update.remote" />
                            </Button>
                            <OverlayTrigger
                                placement="top"
                                overlay={props => (
                                    <Tooltip id="repo-local-reset-tip" {...props}>
                                        <FormattedMessage id="view.instance.repo.update.local.tip" />
                                    </Tooltip>
                                )}>
                                <Button
                                    onClick={() => this.setState({ resetType: ResetType.Local })}
                                    variant={
                                        this.state.resetType === ResetType.Local
                                            ? "secondary"
                                            : "primary"
                                    }>
                                    <FormattedMessage id="view.instance.repo.update.local" />
                                </Button>
                            </OverlayTrigger>
                            <Button
                                disabled={forceReset}
                                onClick={() => this.setState({ resetType: ResetType.None })}
                                variant={
                                    this.state.resetType === ResetType.None
                                        ? "secondary"
                                        : "primary"
                                }>
                                <FormattedMessage id="view.instance.repo.update.none" />
                            </Button>
                        </ButtonGroup>
                        {(configOptions.manualpr.value as boolean) ||
                        !repositoryInfo ||
                        repositoryInfo.remoteGitProvider === RemoteGitProvider.GitHub ||
                        repositoryInfo.remoteGitProvider === RemoteGitProvider.GitLab ? (
                            <div className="d-flex mt-5">
                                <InputField
                                    name="view.instance.repo.manual"
                                    tooltip="view.instance.repo.manual.desc"
                                    type={FieldType.Number}
                                    min={0}
                                    defaultValue={this.state.lastManualPR}
                                    onChange={newPR => this.setState({ manualPR: newPR })}
                                    disabled={!canAdd}
                                />
                                <InputField
                                    name="view.instance.repo.manual.repo"
                                    tooltip="view.instance.repo.manual.repo.desc"
                                    type={FieldType.String}
                                    defaultValue={this.state.lastManualRepo}
                                    onChange={newRepo => {
                                        this.setState({ manualRepo: newRepo });
                                        if (
                                            newRepo &&
                                            newRepo.includes("/") &&
                                            newRepo !==
                                                `${repositoryInfo?.remoteRepositoryOwner}/${repositoryInfo?.remoteRepositoryName}`
                                        ) {
                                            const [owner, repo] = newRepo.split("/");
                                            if (owner && repo) {
                                                GithubClient.getPRs({ owner, repo }).then(prs => {
                                                    if (prs.code === StatusCode.OK) {
                                                        this.setState(prevState => ({
                                                            gitHubPRs: [
                                                                ...(prevState.gitHubPRs ?? []),
                                                                ...prs.payload.filter(
                                                                    p =>
                                                                        !prevState.gitHubPRs?.some(
                                                                            ep =>
                                                                                ep.number ===
                                                                                    p.number &&
                                                                                ep.sourceRepository ===
                                                                                    p.sourceRepository
                                                                        )
                                                                )
                                                            ]
                                                        }));
                                                    }
                                                });
                                            }
                                        }
                                    }}
                                    disabled={!canAdd}
                                />
                                <SimpleToolTip
                                    tooltipid="generic.no_perm"
                                    show={canAdd ? false : undefined}>
                                    <Button
                                        className="nowrap ml-3"
                                        disabled={
                                            (this.state.manualPR === this.state.lastManualPR &&
                                                this.state.manualRepo ===
                                                    this.state.lastManualRepo) ||
                                            !canAdd
                                        }
                                        onClick={() => {
                                            this.setState(prevState => {
                                                return {
                                                    manualPRs: [
                                                        ...prevState.manualPRs,
                                                        {
                                                            number: this.state.manualPR,
                                                            sourceRepository:
                                                                this.state.manualRepo || undefined
                                                        }
                                                    ],
                                                    lastManualPR: this.state.manualPR,
                                                    lastManualRepo: this.state.manualRepo
                                                };
                                            });
                                        }}>
                                        <FormattedMessage id="view.instance.repo.addmanual" />
                                    </Button>
                                </SimpleToolTip>
                            </div>
                        ) : null}
                        <InputField
                            name="view.instance.repo.deployAfter"
                            tooltip="view.instance.repo.deployAfter.desc"
                            type={FieldType.Boolean}
                            defaultValue={!canDeploy ? false : this.state.deployAfter}
                            disabled={!canDeploy}
                            onChange={newVal => this.setState({ deployAfter: newVal })}
                        />
                    </Card.Body>
                    <Card.Footer>
                        <Button
                            variant="danger"
                            className="mx-2"
                            disabled={noPendingChanges}
                            onClick={() => this.reloadDesiredState(repositoryInfo, true, true)}>
                            <FormattedMessage id="generic.cancel" />
                        </Button>
                        <Button
                            className="mx-2"
                            disabled={noPendingChanges}
                            onClick={() => void this.applyTestmerges(noBranch)}>
                            <FormattedMessage id="generic.commit" />
                        </Button>
                    </Card.Footer>
                </Card>
                        {this.state.loadingPRs ? (
                    <Loading text="loading.repo.prs" />
                ) : !repositoryInfo ? (
                    <GenericAlert title="view.instance.repo.noautomerge" />
                ) : repositoryInfo &&
                  repositoryInfo.remoteGitProvider === RemoteGitProvider.GitHub ? (
                    <React.Fragment>
                        <h3>
                            <FormattedMessage id="view.instance.repo.testmerges" />
                        </h3>
                        <div className="d-flex justify-content-center align-items-center mb-3">
                            <span className="mr-2">
                                <FormattedMessage id="view.instance.repo.viewing" />:
                            </span>
                            <select
                                className="form-control w-auto"
                                value={
                                    this.state.viewedRepo ||
                                    `${repositoryInfo.remoteRepositoryOwner}/${repositoryInfo.remoteRepositoryName}`
                                }
                                onChange={e => {
                                    const newRepo = e.target.value;
                                    this.setState({ viewedRepo: newRepo });
                                    const [owner, repo] = newRepo.split("/");
                                    if (
                                        !this.state.gitHubPRs?.some(
                                            p => p.sourceRepository === newRepo
                                        )
                                    ) {
                                        this.setState({ loadingPRs: true });
                                        GithubClient.getPRs({ owner, repo }).then(prs => {
                                            this.setState({ loadingPRs: false });
                                            if (prs.code === StatusCode.OK) {
                                                this.setState(prevState => ({
                                                    gitHubPRs: [
                                                        ...(prevState.gitHubPRs ?? []),
                                                        ...prs.payload.filter(
                                                            p =>
                                                                !prevState.gitHubPRs?.some(
                                                                    ep =>
                                                                        ep.number === p.number &&
                                                                        ep.sourceRepository ===
                                                                            p.sourceRepository
                                                                )
                                                        )
                                                    ]
                                                }));
                                            } else {
                                                this.addError(prs.error);
                                            }
                                        });
                                    }
                                }}>
                                {[
                                    `${repositoryInfo.remoteRepositoryOwner}/${repositoryInfo.remoteRepositoryName}`,
                                    ...new Set(
                                        this.state.gitHubPRs
                                            ?.map(pr => pr.sourceRepository)
                                            .filter(r => r) as string[]
                                    )
                                ]
                                    .sort()
                                    .map(repo => (
                                        <option key={repo} value={repo}>
                                            {repo}
                                        </option>
                                    ))}
                            </select>
                        </div>
                        <br />
                        <Table variant="dark" striped hover className="text-left">
                            <tbody>
                                {sortedPRs.map(pr => {
                                    const key = this.getTestMergeKey(pr.number, pr.sourceRepository);
                                    return (
                                        <TestMergeRow
                                            key={key}
                                            testmergeinfo={testmergedPRs.get(key)}
                                            pr={pr}
                                            repoInfo={repositoryInfo}
                                            finalState={
                                                this.state.desiredState.get(key)
                                                    ? ((
                                                          this.state.desiredState.get(key) as [
                                                              boolean,
                                                              string,
                                                              string
                                                          ]
                                                      ).slice(1) as [string, string])
                                                    : false
                                            }
                                            onRemove={() =>
                                                this.setState(prevState => {
                                                    return {
                                                        resetType:
                                                            prevState.resetType === ResetType.None
                                                                ? ResetType.Remote
                                                                : prevState.resetType,
                                                        desiredState: new Map(
                                                            prevState.desiredState
                                                        ).set(key, null)
                                                    };
                                                })
                                            }
                                            onSelectCommit={(commit, comment) =>
                                                this.setState(prevState => {
                                                    return {
                                                        desiredState: new Map(
                                                            prevState.desiredState
                                                        ).set(key, [false, commit, comment])
                                                    };
                                                })
                                            }
                                            onError={error => this.addError(error)}
                                        />
                                    );
                                })}
                            </tbody>
                        </Table>
                    </React.Fragment>
                ) : null}
            </div>
        );
    }

    private renderReclone(): React.ReactNode {
        const canReclone = hasRepoRight(
            this.context.instancePermissionSet,
            RepositoryRights.Reclone
        );

        return (
            <React.Fragment>
                <h4>
                    <FormattedMessage id="view.instance.repo.reclone.title" />
                </h4>
                <span>
                    <FormattedMessage id="view.instance.repo.reclone.desc" />
                </span>
                <br />
                <Button
                    variant="warning"
                    className="mt-2"
                    disabled={!canReclone}
                    onClick={() =>
                        this.setState({
                            showRecloneModal: true
                        })
                    }>
                    <FormattedMessage id="view.instance.repo.reclone" />
                </Button>
                <Modal
                    show={this.state.showRecloneModal}
                    onHide={() =>
                        this.setState({
                            showRecloneModal: false
                        })
                    }
                    centered>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            <FormattedMessage id="view.instance.repo.reclone.title" />
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <span>
                            <FormattedMessage id="generic.areyousure" />
                        </span>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            onClick={() =>
                                this.setState({
                                    showRecloneModal: false
                                })
                            }>
                            <FormattedMessage id="generic.cancel" />
                        </Button>
                        <Button
                            variant="danger"
                            onClick={() =>
                                void (async () => {
                                    this.setState({
                                        showRecloneModal: false,
                                        loading: true
                                    });
                                    const response = await RepositoryClient.recloneRepository(
                                        this.context.instance.id
                                    );
                                    this.setState({
                                        loading: false
                                    });
                                    if (response.code === StatusCode.OK) {
                                        if (response.payload.activeJob) {
                                            this.setState({
                                                loading: true
                                            });
                                            JobsController.fastmode = 5;
                                            JobsController.registerCallback(
                                                response.payload.activeJob.id,
                                                job => {
                                                    return this.fetchRepositoryInfo(
                                                        job,
                                                        job.errorCode === undefined &&
                                                            job.exceptionDetails === undefined
                                                    );
                                                }
                                            );
                                            JobsController.registerJob(
                                                response.payload.activeJob,
                                                this.context.instance.id
                                            );
                                        } else {
                                            await this.fetchRepositoryInfo();
                                        }
                                    } else {
                                        this.addError(response.error);
                                    }
                                })()
                            }>
                            <FormattedMessage id="view.instance.repo.reclone" />
                        </Button>
                    </Modal.Footer>
                </Modal>
            </React.Fragment>
        );
    }

    private renderDelete(): React.ReactNode {
        const canDelete = hasRepoRight(this.context.instancePermissionSet, RepositoryRights.Delete);

        return (
            <React.Fragment>
                <h4>
                    <FormattedMessage id="view.instance.repo.delete.title" />
                </h4>
                <span>
                    <FormattedMessage id="view.instance.repo.delete.desc" />
                </span>
                <br />
                <Button
                    variant="danger"
                    className="mt-2"
                    disabled={!canDelete}
                    onClick={() =>
                        this.setState({
                            showDeleteModal: true
                        })
                    }>
                    <FormattedMessage id="view.instance.repo.delete" />
                </Button>
                <Modal
                    show={this.state.showDeleteModal}
                    onHide={() =>
                        this.setState({
                            showDeleteModal: false
                        })
                    }
                    centered>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            <FormattedMessage id="view.instance.repo.delete.title" />
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <span>
                            <FormattedMessage id="generic.areyousure" />
                        </span>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            onClick={() =>
                                this.setState({
                                    showDeleteModal: false
                                })
                            }>
                            <FormattedMessage id="generic.cancel" />
                        </Button>
                        <Button
                            variant="danger"
                            onClick={() =>
                                void (async () => {
                                    this.setState({
                                        showDeleteModal: false,
                                        loading: true
                                    });
                                    const response = await RepositoryClient.deleteRepository(
                                        this.context.instance.id
                                    );
                                    this.setState({
                                        loading: false
                                    });
                                    if (response.code === StatusCode.OK) {
                                        if (response.payload.activeJob) {
                                            this.setState({
                                                loading: true
                                            });
                                            JobsController.fastmode = 5;
                                            JobsController.registerCallback(
                                                response.payload.activeJob.id,
                                                job => {
                                                    return this.fetchRepositoryInfo(
                                                        job,
                                                        job.errorCode === undefined &&
                                                            job.exceptionDetails === undefined
                                                    );
                                                }
                                            );
                                            JobsController.registerJob(
                                                response.payload.activeJob,
                                                this.context.instance.id
                                            );
                                        } else {
                                            await this.fetchRepositoryInfo();
                                        }
                                    } else {
                                        this.addError(response.error);
                                    }
                                })()
                            }>
                            <FormattedMessage id="view.instance.repo.delete" />
                        </Button>
                    </Modal.Footer>
                </Modal>
            </React.Fragment>
        );
    }
}

Repository.contextType = InstanceEditContext;
export default Repository;
