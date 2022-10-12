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

interface IProps {}

interface IState {
    errors: Array<InternalError<ErrorCode> | undefined>;
    repositoryInfo: RepositoryResponse | null;
    loading: boolean;
    cloning: boolean;
    repoBusy: boolean;
    unableToHookClone: boolean;
    loadingPRs: boolean;
    gitHubPRs: PullRequest[] | null;
    manualPRs: Set<number>;
    resetType: ResetType;
    desiredState: Map<number, [current: boolean, sha: string, comment: string | null] | null>;
    showDeleteModal: boolean;
    manualPR: number;
    lastManualPR: number;
    deployAfter: boolean;
}

class Repository extends React.Component<IProps, IState> {
    public declare context: InstanceEditContext;

    public constructor(props: IProps) {
        super(props);

        this.state = {
            errors: [],
            repositoryInfo: null,
            loading: true,
            cloning: false,
            unableToHookClone: false,
            gitHubPRs: null,
            manualPRs: new Set<number>(),
            resetType: ResetType.Remote,
            desiredState: new Map<
                number,
                [current: boolean, sha: string, comment: string | null] | null
            >(),
            showDeleteModal: false,
            manualPR: 0,
            lastManualPR: 0,
            deployAfter: false,
            repoBusy: false,
            loadingPRs: false
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

    public async componentDidMount(): Promise<void> {
        this.setState({
            deployAfter: hasDreamMakerRight(
                this.context.instancePermissionSet,
                DreamMakerRights.Compile
            )
        });
        await this.fetchRepositoryInfo(undefined, true);
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
                repositoryInfo: null
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
            this.setState({ repositoryInfo: response.payload });
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
            GithubClient.getPRs({
                repo: repositoryInfo.remoteRepositoryName,
                owner: repositoryInfo.remoteRepositoryOwner,
                wantedPRs: repositoryInfo.revisionInformation?.activeTestMerges.map(tm => tm.number)
            })
                .then(prs => {
                    this.setState({
                        loadingPRs: false
                    });
                    if (prs.code === StatusCode.ERROR) {
                        this.addError(prs.error);
                    } else {
                        this.setState({
                            gitHubPRs: prs.payload
                        });
                        if (resetDesiredState)
                            this.reloadDesiredState(repositoryInfo, true, false, prs.payload);
                    }
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
            [...this.state.desiredState.entries()].forEach(([number, prDesiredState]) => {
                if (!prDesiredState) return;
                const [current, commit, comment] = prDesiredState;
                //If we aren't resetting, ignore PRs we didn't touch
                if (current && !(willReset || noBranch)) return;

                testMergeArray.push({
                    number: number,
                    targetCommitSha: commit,
                    comment
                });
            });
            if (testMergeArray.length) editOptions.newTestMerges = testMergeArray;
        }
        const testMergeArray = editOptions.newTestMerges ?? [];
        this.state.manualPRs.forEach(pr =>
            testMergeArray.push({
                number: pr
            })
        );
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
                JobsController.restartLoop();
                if (this.state.deployAfter) {
                    const jobId = response.payload.activeJob.id;
                    const deployinterval = setInterval(() => {
                        const targetJob = JobsController.jobs.get(jobId);
                        if (typeof targetJob?.progress === "number") {
                            clearInterval(deployinterval);
                            void DreamMakerClient.startCompile(this.context.instance.id).then(
                                response => {
                                    if (response.code === StatusCode.ERROR) {
                                        this.addError(response.error);
                                    }
                                }
                            );
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
            this.setState({
                resetType: ResetType.None,
                manualPRs: new Set<number>()
            });
        }

        if (!repoinfo) return;

        this.setState(prevState => {
            const desiredState = prevState.desiredState;
            const newDesiredState = new Map(!reset ? desiredState : []);
            let removingMergedTMs = false;
            repoinfo.revisionInformation?.activeTestMerges.forEach(pr => {
                const currentDesiredState = newDesiredState.get(pr.number);
                if (!reset) {
                    //We want the PR gone, don't retestmerge it
                    if (!currentDesiredState) return;
                    //We want the PR updated to a specific commit, don't mess with it
                    if (currentDesiredState && !currentDesiredState[0]) return;
                }

                const gitHubPR = gitHubPRs?.find(
                    potentialGitHubPR => pr.number === potentialGitHubPR.number
                );

                const defaultDesiredState = gitHubPR?.state === "merged" ? false : true;
                if (reset && !harderReset && !defaultDesiredState) {
                    newDesiredState.set(pr.number, null);
                    removingMergedTMs = true;
                } else {
                    newDesiredState.set(pr.number, [true, pr.targetCommitSha, pr.comment ?? ""]);
                }
            });

            const resetType = removingMergedTMs
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
                {this.state.repositoryInfo && !this.state.repositoryInfo.origin ? (
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
                                <h3>
                                    <FormattedMessage id="view.instance.repo.testmerges" />
                                </h3>
                                {this.renderTestMerges()}
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
            accessUser: {
                type: FieldType.String as FieldType.String,
                name: "fields.instance.repository.gituser",
                defaultValue: ""
            },
            accessToken: {
                type: FieldType.String as FieldType.Password,
                name: "fields.instance.repository.gitpassword",
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
                        if (result.accessUser == "") repoCloneRequest.accessUser = null;
                        if (result.accessToken == "") repoCloneRequest.accessToken = null;

                        const response = await RepositoryClient.cloneRepository(
                            this.context.instance.id,
                            repoCloneRequest
                        );
                        if (response.code === StatusCode.OK) {
                            await this.fetchRepositoryInfo(response.payload.activeJob ?? undefined);
                            JobsController.restartLoop();
                        } else {
                            this.addError(response.error);
                        }
                    }}
                    includeAll
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
            accessUser: {
                type: FieldType.String as FieldType.String,
                name: "fields.instance.repository.accessUser",
                defaultValue: repositoryInfo ? repositoryInfo.accessUser : "",
                tooltip: "fields.instance.repository.accessUser.desc",
                disabled: !hasRepoRight(
                    this.context.instancePermissionSet,
                    RepositoryRights.ChangeCredentials
                )
            },
            accessToken: {
                type: FieldType.Password as FieldType.Password,
                name: "fields.instance.repository.accessToken",
                tooltip: "fields.instance.repository.accessToken.desc",
                disabled: !hasRepoRight(
                    this.context.instancePermissionSet,
                    RepositoryRights.ChangeCredentials
                )
            },
            clearAccessToken: {
                type: FieldType.Boolean as FieldType.Boolean,
                name: "fields.instance.repository.clearAccessToken",
                disabled: !hasRepoRight(
                    this.context.instancePermissionSet,
                    RepositoryRights.ChangeCredentials
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
                <InputForm
                    fields={editFields}
                    onSave={async _result => {
                        const { clearAccessToken, ...result } = _result;
                        if (clearAccessToken) {
                            result.accessUser = "";
                            result.accessToken = "";
                        }

                        this.setState({ loading: true });
                        const response = await RepositoryClient.editRepository(
                            this.context.instance.id,
                            result
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
                                JobsController.restartLoop();
                            } else {
                                await this.fetchRepositoryInfo();
                            }
                        } else {
                            this.addError(response.error);
                        }
                    }}
                />
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

        const testmergedPRs = new Map<number, TestMerge>();
        if (repositoryInfo) {
            repositoryInfo.revisionInformation?.activeTestMerges.forEach(pr =>
                testmergedPRs.set(pr.number, pr)
            );
        }
        const sortedPRs =
            this.state.gitHubPRs?.sort((a, b) => {
                if (testmergedPRs.has(a.number) !== testmergedPRs.has(b.number)) {
                    return testmergedPRs.has(a.number) ? -1 : 1;
                }
                if (a.testmergelabel !== b.testmergelabel) {
                    return a.testmergelabel ? -1 : 1;
                }
                return a.number - b.number;
            }) ?? [];
        const filteredPendingActions = sortedPRs
            .map(pr => {
                const desiredPRState = this.state.desiredState.get(pr.number);
                const tmInfo = !repositoryInfo
                    ? undefined
                    : repositoryInfo?.revisionInformation?.activeTestMerges.find(
                          activePR => activePR.number === pr.number
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
                if (!this.state.desiredState.get(pr.number)) {
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
            !this.state.manualPRs.size;

        if (repositoryInfo && repositoryInfo.remoteGitProvider == RemoteGitProvider.Unknown)
            return <GenericAlert title="view.instance.repo.testmerges.badprovider" />;

        if (this.state.loadingPRs) return <Loading text="loading.repo.prs" />;

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
                                              const prDesiredState = this.state.desiredState.get(
                                                  pr.number
                                              );

                                              if (
                                                  state === PRState.reapply &&
                                                  !(
                                                      this.state.resetType !== ResetType.None ||
                                                      noBranch
                                                  )
                                              )
                                                  return null;

                                              const targetCommit = prDesiredState
                                                  ? prDesiredState[1]
                                                  : null;

                                              return (
                                                  <li key={pr.number}>
                                                      <FormattedMessage
                                                          id={`view.instance.repo.pending.${state}`}
                                                          values={{
                                                              number: pr.number,
                                                              commit: targetCommit?.substring(0, 7),
                                                              title: pr.title
                                                          }}
                                                      />
                                                  </li>
                                              );
                                          })
                                        : null}
                                    {[...this.state.manualPRs.values()].map(pr => (
                                        <li key={pr}>
                                            <FormattedMessage
                                                id={`view.instance.repo.pending.added.manual`}
                                                values={{
                                                    number: pr
                                                }}
                                            />
                                        </li>
                                    ))}
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
                        !this.state.gitHubPRs ||
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
                                <SimpleToolTip
                                    tooltipid="generic.no_perm"
                                    show={canAdd ? false : undefined}>
                                    <Button
                                        className="nowrap ml-3"
                                        disabled={
                                            this.state.manualPR === this.state.lastManualPR ||
                                            !canAdd
                                        }
                                        onClick={() => {
                                            this.setState(prevState => {
                                                return {
                                                    manualPRs: new Set<number>([
                                                        ...prevState.manualPRs.values(),
                                                        this.state.manualPR
                                                    ]),
                                                    lastManualPR: this.state.manualPR
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
                {!repositoryInfo ? (
                    <GenericAlert title="view.instance.repo.noautomerge" />
                ) : repositoryInfo &&
                  repositoryInfo.remoteGitProvider === RemoteGitProvider.GitHub ? (
                    <Table variant="dark" striped hover className="text-left">
                        <tbody>
                            {sortedPRs.map(pr => (
                                <TestMergeRow
                                    key={pr.number}
                                    testmergeinfo={testmergedPRs.get(pr.number)}
                                    pr={pr}
                                    repoInfo={repositoryInfo}
                                    finalState={
                                        this.state.desiredState.get(pr.number)
                                            ? ((this.state.desiredState.get(pr.number) as [
                                                  boolean,
                                                  string,
                                                  string
                                              ]).slice(1) as [string, string])
                                            : false
                                    }
                                    onRemove={() =>
                                        this.setState(prevState => {
                                            return {
                                                resetType:
                                                    prevState.resetType === ResetType.None
                                                        ? ResetType.Local
                                                        : prevState.resetType,
                                                desiredState: new Map(prevState.desiredState).set(
                                                    pr.number,
                                                    null
                                                )
                                            };
                                        })
                                    }
                                    onSelectCommit={(commit, comment) =>
                                        this.setState(prevState => {
                                            return {
                                                desiredState: new Map(
                                                    prevState.desiredState
                                                ).set(pr.number, [false, commit, comment])
                                            };
                                        })
                                    }
                                    onError={error => this.addError(error)}
                                />
                            ))}
                        </tbody>
                    </Table>
                ) : null}
            </div>
        );
    }

    private renderDelete(): React.ReactNode {
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
                            onClick={async () => {
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
                                        JobsController.restartLoop();
                                    } else {
                                        await this.fetchRepositoryInfo();
                                    }
                                } else {
                                    this.addError(response.error);
                                }
                            }}>
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
