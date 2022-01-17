import React, { useContext, useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Table from "react-bootstrap/Table";
import { FormattedMessage } from "react-intl";

import {
    ErrorCode as TGSErrorCode,
    JobResponse,
    RemoteGitProvider,
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
import { hasRepoRight } from "../../../../utils/misc";
import { addError, displayErrors } from "../../../utils/ErrorAlert";
import GenericAlert from "../../../utils/GenericAlert";
import InputField, { FieldType } from "../../../utils/InputField";
import InputForm from "../../../utils/InputForm";
import { DebugJsonViewer } from "../../../utils/JsonViewer";
import Loading from "../../../utils/Loading";
import SimpleToolTip from "../../../utils/SimpleTooltip";
import TestMergeRow from "../../../utils/TestMergeRow";

function displayRepoInformation(repositoryInfo: RepositoryResponse | false | null) {
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

const enum PRState {
    reapply = "reapply",
    added = "added",
    removed = "removed",
    updated = "updated",
    rename = "renamed"
}

export default function Repository(): JSX.Element {
    const instanceEditContext = useContext(InstanceEditContext);

    const errorState = useState<Array<InternalError<ErrorCode> | undefined>>([]);
    const [repositoryInfo, setRepositoryInfo] = useState<RepositoryResponse | null | false>(null);
    const [isCloning, setIsCloning] = useState(false);
    const [isUnableHookClone, setIsUnableHookClone] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [PRs, setPRs] = useState<PullRequest[] | null>(null);
    const [desiredState, setDesiredState] = useState(
        new Map<number, [current: boolean, sha: string, comment: string] | false>()
    );
    const [updateRepo, setUpdateRepo] = useState(false);
    const [gitlabReset, setGitlabReset] = useState(false);
    const [manualPRs, setManualPRs] = useState<Set<number>>(new Set());
    const [manualPR, setManualPR] = useState(0);
    const [lastManualPR, setLastManualPR] = useState(0);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => void fetchRepositoryInfo(undefined, true), [instanceEditContext.instance.id]);
    useEffect(() => {}, [repositoryInfo]);

    function reloadPRs(repositoryInfo: RepositoryResponse, resetDesiredState?: boolean) {
        if (
            repositoryInfo.remoteGitProvider === RemoteGitProvider.GitHub &&
            repositoryInfo.remoteRepositoryName &&
            repositoryInfo.remoteRepositoryOwner
        ) {
            GithubClient.getPRs({
                repo: repositoryInfo.remoteRepositoryName,
                owner: repositoryInfo.remoteRepositoryOwner,
                wantedPRs: repositoryInfo.revisionInformation?.activeTestMerges.map(tm => tm.number)
            })
                .then(prs => {
                    if (prs.code === StatusCode.ERROR) {
                        addError(errorState, prs.error);
                    } else {
                        setPRs(prs.payload);
                        if (resetDesiredState) reloadDesiredState(repositoryInfo, true);
                    }
                })
                .catch(e => {
                    addError(
                        errorState,
                        new InternalError(ErrorCode.APP_FAIL, { jsError: e as Error })
                    );
                });
        }
    }

    function reloadDesiredState(repoinfo: RepositoryResponse | false | null, reset?: boolean) {
        if (reset) {
            setUpdateRepo(false);
            setGitlabReset(false);
            setManualPRs(new Set());
        }

        if (!repoinfo) return;

        setDesiredState(desiredState => {
            const newDesiredState = new Map(!reset ? desiredState : []);
            repoinfo.revisionInformation?.activeTestMerges.forEach(pr => {
                const currentDesiredState = newDesiredState.get(pr.number);
                if (!reset) {
                    //We want the PR gone, don't retestmerge it
                    if (currentDesiredState === false) return;
                    //We want the PR updated to a specific commit, don't mess with it
                    if (currentDesiredState && !currentDesiredState[0]) return;
                }
                newDesiredState.set(pr.number, [true, pr.targetCommitSha, pr.comment ?? ""]);
            });
            return newDesiredState;
        });
    }

    async function fetchRepositoryInfo(cloneJob?: JobResponse, resetDesiredState?: boolean) {
        if (!hasRepoRight(instanceEditContext.instancePermissionSet, RepositoryRights.Read)) {
            setIsLoading(false);
            setIsCloning(false);
            reloadDesiredState(false, resetDesiredState);
            return setRepositoryInfo(false);
        }

        const response = await RepositoryClient.getRepository(instanceEditContext.instance.id);

        setIsCloning(false);
        if (response.code === StatusCode.ERROR) {
            if (
                response.error.code === ErrorCode.HTTP_DATA_INEGRITY &&
                response.error.originalErrorMessage?.errorCode === TGSErrorCode.RepoCloning
            ) {
                setIsUnableHookClone(false);
                setIsCloning(true);
                if (cloneJob) {
                    JobsController.registerCallback(cloneJob.id, fetchRepositoryInfo);
                } else {
                    const response2 = await JobsClient.listActiveJobs(
                        instanceEditContext.instance.id,
                        {
                            page: 1,
                            pageSize: 100
                        }
                    );
                    if (response2.code === StatusCode.OK) {
                        const cloneJob = response2.payload.content
                            .sort((a, b) => b.id - a.id)
                            .find(
                                job =>
                                    job.description.includes("Clone") &&
                                    job.description.includes("repository")
                            );
                        if (cloneJob) {
                            JobsController.registerCallback(cloneJob.id, fetchRepositoryInfo);
                        } else {
                            setIsUnableHookClone(true);
                        }
                    } else {
                        setIsUnableHookClone(true);
                    }
                }
            } else {
                addError(errorState, response.error);
            }
        } else {
            reloadPRs(response.payload);
            //response.payload.remoteGitProvider = RemoteGitProvider.GitLab;
            setRepositoryInfo(response.payload);
            reloadDesiredState(response.payload, resetDesiredState);
        }
        setIsLoading(false);
    }

    if (isCloning) {
        return (
            <>
                {isUnableHookClone ? (
                    <GenericAlert title="view.instance.repo.canthookclone" />
                ) : null}
                <Loading text="loading.repo.cloning" />
            </>
        );
    }

    if (isLoading) {
        return <Loading />;
    }

    const cloneFields = {
        origin: {
            type: FieldType.String as FieldType.String,
            name: "fields.instance.repository.url"
        },
        reference: {
            type: FieldType.String as FieldType.String,
            name: "fields.instance.repository.ref",
            defaultValue: "main"
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

    const editFields = {
        originCheckoutSha: {
            type: FieldType.String as FieldType.String,
            name: "fields.instance.repository.origincheckoutsha",
            disabled: true,
            defaultValue: repositoryInfo ? repositoryInfo.revisionInformation?.originCommitSha : "",
            tooltip: "fields.instance.repository.origincheckoutsha.desc"
        },
        checkoutSha: {
            type: FieldType.String as FieldType.String,
            name: "fields.instance.repository.checkoutsha",
            defaultValue: repositoryInfo ? repositoryInfo.revisionInformation?.commitSha : "",
            tooltip: "fields.instance.repository.checkoutsha.desc",
            disabled: !hasRepoRight(
                instanceEditContext.instancePermissionSet,
                RepositoryRights.SetSha
            )
        },
        reference: {
            type: FieldType.String as FieldType.String,
            name: "fields.instance.repository.reference",
            defaultValue: repositoryInfo ? repositoryInfo.reference : "",
            tooltip: "fields.instance.repository.reference.desc",
            disabled: !hasRepoRight(
                instanceEditContext.instancePermissionSet,
                RepositoryRights.SetReference
            )
        },
        committerName: {
            type: FieldType.String as FieldType.String,
            name: "fields.instance.repository.committerName",
            defaultValue: repositoryInfo ? repositoryInfo.committerName : "",
            disabled: !hasRepoRight(
                instanceEditContext.instancePermissionSet,
                RepositoryRights.ChangeCommitter
            )
        },
        committerEmail: {
            type: FieldType.String as FieldType.String,
            name: "fields.instance.repository.committerEmail",
            defaultValue: repositoryInfo ? repositoryInfo.committerEmail : "",
            disabled: !hasRepoRight(
                instanceEditContext.instancePermissionSet,
                RepositoryRights.ChangeCommitter
            )
        },
        accessUser: {
            type: FieldType.String as FieldType.String,
            name: "fields.instance.repository.accessUser",
            defaultValue: repositoryInfo ? repositoryInfo.accessUser : "",
            tooltip: "fields.instance.repository.accessUser.desc",
            disabled: !hasRepoRight(
                instanceEditContext.instancePermissionSet,
                RepositoryRights.ChangeCredentials
            )
        },
        accessToken: {
            type: FieldType.Password as FieldType.Password,
            name: "fields.instance.repository.accessToken",
            tooltip: "fields.instance.repository.accessToken.desc",
            disabled: !hasRepoRight(
                instanceEditContext.instancePermissionSet,
                RepositoryRights.ChangeCredentials
            )
        },
        clearAccessToken: {
            type: FieldType.Boolean as FieldType.Boolean,
            name: "fields.instance.repository.clearAccessToken",
            disabled: !hasRepoRight(
                instanceEditContext.instancePermissionSet,
                RepositoryRights.ChangeCredentials
            )
        },
        pushTestMergeCommits: {
            type: FieldType.Boolean as FieldType.Boolean,
            name: "fields.instance.repository.pushTestMergeCommits",
            defaultValue: repositoryInfo ? repositoryInfo.pushTestMergeCommits : false,
            tooltip: "fields.instance.repository.pushTestMergeCommits.desc",
            disabled: !hasRepoRight(
                instanceEditContext.instancePermissionSet,
                RepositoryRights.ChangeTestMergeCommits
            )
        },
        createGitHubDeployments: {
            type: FieldType.Boolean as FieldType.Boolean,
            name: "fields.instance.repository.createGitHubDeployments",
            defaultValue: repositoryInfo ? repositoryInfo.createGitHubDeployments : false,
            tooltip: "fields.instance.repository.createGitHubDeployments.desc",
            disabled: !hasRepoRight(
                instanceEditContext.instancePermissionSet,
                RepositoryRights.ChangeTestMergeCommits
            )
        },
        showTestMergeCommitters: {
            type: FieldType.Boolean as FieldType.Boolean,
            name: "fields.instance.repository.showTestMergeCommitters",
            defaultValue: repositoryInfo ? repositoryInfo.showTestMergeCommitters : false,
            tooltip: "fields.instance.repository.showTestMergeCommitters.desc",
            disabled: !hasRepoRight(
                instanceEditContext.instancePermissionSet,
                RepositoryRights.ChangeTestMergeCommits
            )
        },
        autoUpdatesKeepTestMerges: {
            type: FieldType.Boolean as FieldType.Boolean,
            name: "fields.instance.repository.autoUpdatesKeepTestMerges",
            defaultValue: repositoryInfo ? repositoryInfo.autoUpdatesKeepTestMerges : false,
            tooltip: "fields.instance.repository.autoUpdatesKeepTestMerges.desc",
            disabled: !hasRepoRight(
                instanceEditContext.instancePermissionSet,
                RepositoryRights.ChangeAutoUpdateSettings
            )
        },
        autoUpdatesSynchronize: {
            type: FieldType.Boolean as FieldType.Boolean,
            name: "fields.instance.repository.autoUpdatesSynchronize",
            defaultValue: repositoryInfo ? repositoryInfo.autoUpdatesSynchronize : false,
            tooltip: "fields.instance.repository.autoUpdatesSynchronize.desc",
            disabled: !hasRepoRight(
                instanceEditContext.instancePermissionSet,
                RepositoryRights.ChangeAutoUpdateSettings
            )
        },
        postTestMergeComment: {
            type: FieldType.Boolean as FieldType.Boolean,
            name: "fields.instance.repository.postTestMergeComment",
            defaultValue: repositoryInfo ? repositoryInfo.postTestMergeComment : false,
            tooltip: "fields.instance.repository.postTestMergeComment.desc",
            disabled: !hasRepoRight(
                instanceEditContext.instancePermissionSet,
                RepositoryRights.ChangeTestMergeCommits
            )
        },
        updateSubmodules: {
            type: FieldType.Boolean as FieldType.Boolean,
            name: "fields.instance.repository.updateSubmodules",
            defaultValue: repositoryInfo ? repositoryInfo.updateSubmodules : false,
            tooltip: "fields.instance.repository.updateSubmodules.desc",
            disabled: !hasRepoRight(
                instanceEditContext.instancePermissionSet,
                RepositoryRights.ChangeSubmoduleUpdate
            )
        }
    };

    // https://github.com/yogstation13/yogstation.git
    // https://github.com/alexkar598/dmapitest.git

    //positive if a > b

    const testmergedPRs = new Map<number, TestMerge>();
    if (repositoryInfo) {
        repositoryInfo.revisionInformation?.activeTestMerges.forEach(pr =>
            testmergedPRs.set(pr.number, pr)
        );
    }
    const sortedPRs =
        PRs?.sort((a, b) => {
            // @ts-expect-error suck my dick ts, xoring booleans is completly valid
            if (testmergedPRs.has(a.number) ^ testmergedPRs.has(b.number)) {
                return testmergedPRs.has(a.number) ? -1 : 1;
            }
            // @ts-expect-error suck my dick ts, xoring booleans is completly valid
            if (a.testmergelabel ^ b.testmergelabel) {
                return a.testmergelabel ? -1 : 1;
            }
            return a.number - b.number;
        }) ?? [];
    const filteredPendingActions = sortedPRs
        .map(pr => {
            const desiredPRState = desiredState.get(pr.number);
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
            if (desiredState.get(pr.number) === false) {
                if (!tmInfo) return null;

                return [PRState.removed, pr];
            }
            return null;
        })
        .filter(value => value !== null) as [PRState, PullRequest][];
    const sortedPendingActions = filteredPendingActions.sort((a, b) => {
        const order = [PRState.reapply, PRState.removed, PRState.added, PRState.updated];
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
        !forceReset &&
        !updateRepo &&
        !manualPRs.size;

    async function applyTestmerges() {
        const editOptions: RepositoryUpdateRequest = {};
        if (repositoryInfo && noBranch) {
            editOptions.checkoutSha = repositoryInfo.revisionInformation?.originCommitSha;
        } else if (repositoryInfo && (forceReset || gitlabReset)) {
            editOptions.updateFromOrigin = true;
            editOptions.reference = repositoryInfo?.reference;
        } else if (updateRepo) {
            editOptions.updateFromOrigin = true;
        }

        if (repositoryInfo && repositoryInfo?.remoteGitProvider === RemoteGitProvider.GitHub) {
            const testMergeArray: TestMergeParameters[] = [];
            [...desiredState.entries()].forEach(([number, prDesiredState]) => {
                if (!prDesiredState) return;
                const [current, commit, comment] = prDesiredState;
                //If we aren't resetting, ignore PRs we didn't touch
                console.log(current, forceReset, noBranch, current && !(forceReset || noBranch));
                if (current && !(forceReset || noBranch)) return;

                testMergeArray.push({
                    number: number,
                    targetCommitSha: commit,
                    comment
                });
            });
            if (testMergeArray.length) editOptions.newTestMerges = testMergeArray;
        }
        const testMergeArray = editOptions.newTestMerges ?? [];
        manualPRs.forEach(pr =>
            testMergeArray.push({
                number: pr
            })
        );
        if (testMergeArray.length) editOptions.newTestMerges = testMergeArray;

        setIsLoading(true);
        const response = await RepositoryClient.editRepository(
            instanceEditContext.instance.id,
            editOptions
        );
        setIsLoading(false);
        if (response.code === StatusCode.OK) {
            if (response.payload.activeJob) {
                setIsLoading(true);
                JobsController.fastmode = 5;
                JobsController.registerCallback(response.payload.activeJob.id, job => {
                    return fetchRepositoryInfo(
                        job,
                        job.errorCode === undefined && job.exceptionDetails === undefined
                    );
                });
                JobsController.registerJob(
                    response.payload.activeJob,
                    instanceEditContext.instance.id
                );
                JobsController.restartLoop();
            } else {
                await fetchRepositoryInfo();
            }
        } else {
            addError(errorState, response.error);
        }
    }

    const canAdd = hasRepoRight(
        instanceEditContext.instancePermissionSet,
        RepositoryRights.MergePullRequest
    );
    const canUpdate = hasRepoRight(
        instanceEditContext.instancePermissionSet,
        RepositoryRights.UpdateBranch
    );
    const canReset =
        hasRepoRight(instanceEditContext.instancePermissionSet, RepositoryRights.Read) &&
        hasRepoRight(instanceEditContext.instancePermissionSet, RepositoryRights.UpdateBranch);

    return (
        <div className="text-center">
            <DebugJsonViewer obj={{ repositoryInfo, PRs }} />
            {displayErrors(errorState)}
            {/*Just like... hope its cloned if you don't have read access*/}
            {repositoryInfo && !repositoryInfo.origin ? (
                <>
                    <h3>
                        <FormattedMessage id="view.instance.repo.clone" />
                    </h3>
                    <InputForm
                        fields={cloneFields}
                        hideDisabled={
                            !hasRepoRight(
                                instanceEditContext.instancePermissionSet,
                                RepositoryRights.Read
                            )
                        }
                        onSave={async result => {
                            const response = await RepositoryClient.cloneRepository(
                                instanceEditContext.instance.id,
                                result
                            );
                            if (response.code === StatusCode.OK) {
                                await fetchRepositoryInfo(response.payload.activeJob ?? undefined);
                                JobsController.restartLoop();
                            } else {
                                addError(errorState, response.error);
                            }
                        }}
                        includeAll
                    />
                </>
            ) : (
                <>
                    <h3>
                        <FormattedMessage id="view.instance.repo.repoinfo" />
                    </h3>
                    {displayRepoInformation(repositoryInfo)}
                    <hr />
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

                            setIsLoading(true);
                            const response = await RepositoryClient.editRepository(
                                instanceEditContext.instance.id,
                                result
                            );
                            setIsLoading(false);
                            if (response.code === StatusCode.OK) {
                                if (response.payload.activeJob) {
                                    setIsLoading(true);
                                    JobsController.fastmode = 5;
                                    JobsController.registerCallback(
                                        response.payload.activeJob.id,
                                        fetchRepositoryInfo
                                    );
                                    JobsController.registerJob(
                                        response.payload.activeJob,
                                        instanceEditContext.instance.id
                                    );
                                    JobsController.restartLoop();
                                } else {
                                    await fetchRepositoryInfo();
                                }
                            } else {
                                addError(errorState, response.error);
                            }
                        }}
                    />
                    <hr />
                    <h3>
                        <FormattedMessage id="view.instance.repo.testmerges" />
                    </h3>
                    {repositoryInfo &&
                    repositoryInfo.remoteGitProvider == RemoteGitProvider.Unknown ? (
                        <GenericAlert title="view.instance.repo.testmerges.badprovider" />
                    ) : repositoryInfo &&
                      repositoryInfo.remoteGitProvider == RemoteGitProvider.GitHub &&
                      !PRs ? (
                        <Loading text="loading.repo.prs" />
                    ) : (
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
                                            <>
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
                                                ) : repositoryInfo &&
                                                  (forceReset || gitlabReset) ? (
                                                    <li>
                                                        <FormattedMessage id="view.instance.repo.pending.reset" />
                                                    </li>
                                                ) : updateRepo ? (
                                                    <li>
                                                        <FormattedMessage id="view.instance.repo.pending.update" />
                                                    </li>
                                                ) : null}
                                                {repositoryInfo &&
                                                repositoryInfo.remoteGitProvider ===
                                                    RemoteGitProvider.GitHub
                                                    ? sortedPendingActions.map(([state, pr]) => {
                                                          const prDesiredState = desiredState.get(
                                                              pr.number
                                                          );

                                                          if (
                                                              state === PRState.reapply &&
                                                              !(forceReset || noBranch)
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
                                                                          commit: targetCommit?.substring(
                                                                              0,
                                                                              7
                                                                          ),
                                                                          title: pr.title
                                                                      }}
                                                                  />
                                                              </li>
                                                          );
                                                      })
                                                    : null}
                                                {[...manualPRs.values()].map(pr => (
                                                    <li key={pr}>
                                                        <FormattedMessage
                                                            id={`view.instance.repo.pending.added.manual`}
                                                            values={{
                                                                number: pr
                                                            }}
                                                        />
                                                    </li>
                                                ))}
                                            </>
                                        )}
                                    </ul>
                                    <InputField
                                        name="view.instance.repo.update"
                                        tooltip="view.instance.repo.update.desc"
                                        type={FieldType.Boolean}
                                        defaultValue={
                                            gitlabReset
                                                ? true
                                                : noBranch
                                                ? false
                                                : forceReset
                                                ? true
                                                : updateRepo
                                        }
                                        disabled={
                                            forceReset || noBranch || gitlabReset || !canUpdate
                                        }
                                        onChange={newVal => setUpdateRepo(newVal)}
                                    />
                                    {repositoryInfo &&
                                    repositoryInfo.remoteGitProvider ===
                                        RemoteGitProvider.GitLab ? (
                                        <InputField
                                            name="view.instance.repo.reset"
                                            tooltip="view.instance.repo.reset.desc"
                                            type={FieldType.Boolean}
                                            defaultValue={noBranch ? false : gitlabReset}
                                            disabled={noBranch || !canReset}
                                            onChange={newVal => setGitlabReset(newVal)}
                                        />
                                    ) : null}
                                    {(configOptions.manualpr.value as boolean) ||
                                    !repositoryInfo ||
                                    repositoryInfo.remoteGitProvider ===
                                        RemoteGitProvider.GitLab ? (
                                        <div className="d-flex mt-5">
                                            <InputField
                                                name="view.instance.repo.manual"
                                                tooltip="view.instance.repo.manual.desc"
                                                type={FieldType.Number}
                                                min={0}
                                                defaultValue={lastManualPR}
                                                onChange={newPR => setManualPR(newPR)}
                                                disabled={!canAdd}
                                            />
                                            <SimpleToolTip
                                                tooltipid="generic.no_perm"
                                                show={canAdd ? false : undefined}>
                                                <Button
                                                    className="nowrap ml-3"
                                                    disabled={manualPR === lastManualPR || !canAdd}
                                                    onClick={() => {
                                                        setManualPRs(
                                                            prevState =>
                                                                new Set([
                                                                    ...prevState.values(),
                                                                    manualPR
                                                                ])
                                                        );
                                                        setLastManualPR(manualPR);
                                                    }}>
                                                    <FormattedMessage id="view.instance.repo.addmanual" />
                                                </Button>
                                            </SimpleToolTip>
                                        </div>
                                    ) : null}
                                </Card.Body>
                                <Card.Footer>
                                    <Button
                                        variant="danger"
                                        className="mx-2"
                                        disabled={noPendingChanges}
                                        onClick={() => reloadDesiredState(repositoryInfo, true)}>
                                        <FormattedMessage id="generic.reset" />
                                    </Button>
                                    <Button
                                        className="mx-2"
                                        disabled={noPendingChanges}
                                        onClick={applyTestmerges}>
                                        <FormattedMessage id="generic.commit" />
                                    </Button>
                                </Card.Footer>
                            </Card>
                            {repositoryInfo === false ? (
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
                                                    desiredState.get(pr.number)
                                                        ? ((desiredState.get(pr.number) as [
                                                              boolean,
                                                              string,
                                                              string
                                                          ]).slice(1) as [string, string])
                                                        : false
                                                }
                                                onRemove={() =>
                                                    setDesiredState(desiredState =>
                                                        new Map(desiredState).set(pr.number, false)
                                                    )
                                                }
                                                onSelectCommit={(commit, comment) =>
                                                    setDesiredState(desiredState =>
                                                        new Map(desiredState).set(pr.number, [
                                                            false,
                                                            commit,
                                                            comment
                                                        ])
                                                    )
                                                }
                                                onError={error => addError(errorState, error)}
                                            />
                                        ))}
                                    </tbody>
                                </Table>
                            ) : null}
                        </div>
                    )}
                    <hr />
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
                        onClick={() => setShowDeleteModal(true)}>
                        <FormattedMessage id="view.instance.repo.delete" />
                    </Button>
                    <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
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
                            <Button onClick={() => setShowDeleteModal(false)}>
                                <FormattedMessage id="generic.cancel" />
                            </Button>
                            <Button
                                variant="danger"
                                onClick={async () => {
                                    setShowDeleteModal(false);
                                    setIsLoading(true);
                                    const response = await RepositoryClient.deleteRepository(
                                        instanceEditContext.instance.id
                                    );
                                    setIsLoading(false);
                                    if (response.code === StatusCode.OK) {
                                        if (response.payload.activeJob) {
                                            setIsLoading(true);
                                            JobsController.fastmode = 5;
                                            JobsController.registerCallback(
                                                response.payload.activeJob.id,
                                                job => {
                                                    return fetchRepositoryInfo(
                                                        job,
                                                        job.errorCode === undefined &&
                                                            job.exceptionDetails === undefined
                                                    );
                                                }
                                            );
                                            JobsController.registerJob(
                                                response.payload.activeJob,
                                                instanceEditContext.instance.id
                                            );
                                            JobsController.restartLoop();
                                        } else {
                                            await fetchRepositoryInfo();
                                        }
                                    } else {
                                        addError(errorState, response.error);
                                    }
                                }}>
                                <FormattedMessage id="view.instance.repo.delete" />
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </>
            )}
        </div>
    );
}
