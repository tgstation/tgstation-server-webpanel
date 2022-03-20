import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { Collapse } from "react-bootstrap";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { FormattedMessage } from "react-intl";
import SelectSearch, { fuzzySearch, SelectedOptionValue } from "react-select-search";

import {
    RepositoryResponse,
    RepositoryRights,
    TestMerge
} from "../../ApiClient/generatedcode/generated";
import InternalError from "../../ApiClient/models/InternalComms/InternalError";
import { StatusCode } from "../../ApiClient/models/InternalComms/InternalStatus";
import { InstanceEditContext } from "../../contexts/InstanceEditContext";
import GithubClient, { Commit, PullRequest } from "../../utils/GithubClient";
import { hasRepoRight } from "../../utils/misc";
import InputField, { FieldType } from "./InputField";
import Loading from "./Loading";
import SimpleToolTip from "./SimpleTooltip";

interface IProps {
    pr: PullRequest;
    testmergeinfo?: TestMerge;
    repoInfo: RepositoryResponse;
    finalState: [commit: string, comment: string] | false;
    onRemove: () => unknown;
    onSelectCommit: (commit: string, comment: string) => unknown;
    onError: (error: InternalError) => unknown;
}

export default function TestMergeRow({
    pr,
    testmergeinfo,
    repoInfo,
    finalState,
    onRemove,
    onSelectCommit,
    onError
}: IProps): JSX.Element {
    const [showDetails, _setShowDetails] = useState(false);
    const setShowDetails = (_newVal: ((prevState: boolean) => boolean) | boolean) => {
        _setShowDetails(prevState => {
            let newVal;
            if (typeof _newVal === "boolean") {
                newVal = _newVal;
            } else {
                newVal = _newVal(prevState);
            }
            if (newVal) void loadCommits();
            return newVal;
        });
    };
    const [showModal, setShowModal] = useState(false);
    const [selectedCommit, setSelectedCommit] = useState<string>(pr.head);
    const [comment, setComment] = useState(finalState ? finalState[1] : "");
    const [commits, setCommits] = useState<Map<string, Commit> | null>(null);
    const [extraCommit, setExtraCommit] = useState<Commit | null>(null);
    const instanceEditContext = useContext(InstanceEditContext);

    const loadCommits = useCallback(
        async (force?: boolean) => {
            if (commits && !force) return;

            const response = await GithubClient.getPRCommits({
                //Repo info should be set if we are here
                owner: repoInfo.remoteRepositoryOwner!,
                repo: repoInfo.remoteRepositoryName!,
                pr: pr,
                wantedCommit: testmergeinfo?.targetCommitSha
            });
            if (response.code === StatusCode.ERROR) {
                onError(response.error);
            } else {
                const commitMap = new Map();
                response.payload[0].forEach(commit => commitMap.set(commit.sha, commit));
                setCommits(commitMap);
                setExtraCommit(response.payload[1] ?? null);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [
            repoInfo.remoteRepositoryOwner,
            repoInfo.remoteRepositoryName,
            pr.head,
            testmergeinfo?.targetCommitSha
        ]
    );
    useEffect(() => (showDetails ? void loadCommits() : void 0), [showDetails, loadCommits]);
    useEffect(() => (showModal ? void loadCommits() : void 0), [showModal, loadCommits]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => setShowDetails(false), [finalState]);
    useEffect(() => setComment(finalState ? finalState[1] : ""), [finalState]);

    const colorMap: Record<typeof pr.state, string> = {
        closed: "#c93c37",
        merged: "#8256d0",
        open: "#347d39"
    };
    let activeCommit: Commit | undefined = undefined;
    if (testmergeinfo) {
        if (commits?.has(testmergeinfo.targetCommitSha)) {
            activeCommit = commits?.get(testmergeinfo.targetCommitSha);
        } else if (extraCommit?.sha === testmergeinfo.targetCommitSha) {
            activeCommit = extraCommit;
        }
    }
    const commitOptions = [...(commits ?? []).values()].map(commit => ({
        name: commit.name,
        value: commit.sha,
        current: commit.sha === testmergeinfo?.targetCommitSha,
        latest: commit.sha === pr.head,
        disabled: false
    }));
    if (extraCommit) {
        commitOptions.push({
            name: "...",
            value: "",
            current: false,
            latest: false,
            disabled: true
        });
        commitOptions.push({
            name: extraCommit.name,
            value: extraCommit.sha,
            current: extraCommit.sha === testmergeinfo?.targetCommitSha,
            latest: extraCommit.sha === pr.head,
            disabled: false
        });
    }
    const canAdd = hasRepoRight(
        instanceEditContext.instancePermissionSet,
        RepositoryRights.MergePullRequest
    );
    const canReset =
        (hasRepoRight(instanceEditContext.instancePermissionSet, RepositoryRights.Read) &&
            hasRepoRight(
                instanceEditContext.instancePermissionSet,
                RepositoryRights.UpdateBranch
            )) ||
        //Allow updating and removing pending PRs
        !testmergeinfo;

    return (
        <>
            <tr>
                <td className={"text-right" + (finalState ? " font-weight-bold" : "")}>
                    #{pr.number}
                </td>
                <td>
                    <Badge
                        pill
                        className="text-white text-capitalize mr-2"
                        style={{ backgroundColor: colorMap[pr.state] }}>
                        {pr.state}
                    </Badge>
                    {pr.testmergelabel ? (
                        <Badge pill className="text-white text-capitalize mr-2" variant="primary">
                            <FormattedMessage id="view.instance.repo.testmergelabel" />
                        </Badge>
                    ) : null}
                </td>
                <td>
                    <a href={pr.link} target="_blank" rel="noreferrer">
                        {pr.title}
                    </a>
                </td>
                <td className="font-italic">{pr.author}</td>

                <td>
                    <div className="d-flex justify-content-center">
                        <div className="d-inline-block text-nowrap">
                            {finalState ? (
                                <>
                                    <SimpleToolTip
                                        tooltipid="generic.no_perm"
                                        show={canReset ? false : undefined}>
                                        <Button
                                            variant="danger"
                                            className="mx-1"
                                            onClick={onRemove}
                                            disabled={!canReset}>
                                            <FontAwesomeIcon icon="minus" fixedWidth />
                                        </Button>
                                    </SimpleToolTip>
                                    <SimpleToolTip
                                        tooltipid="generic.no_perm"
                                        show={canAdd && canReset ? false : undefined}>
                                        <Button
                                            className="mx-1"
                                            onClick={e =>
                                                e.shiftKey
                                                    ? onSelectCommit(
                                                          pr.head,
                                                          "No comment set - Fast Update"
                                                      )
                                                    : setShowModal(true)
                                            }
                                            variant={finalState[0] === pr.head ? "primary" : "info"}
                                            //To update, you have to reset and reapply the TM so you need both
                                            disabled={!canAdd || !canReset}>
                                            <FontAwesomeIcon icon="sync" fixedWidth />
                                        </Button>
                                    </SimpleToolTip>
                                    {testmergeinfo ? (
                                        <Button
                                            className="mx-1"
                                            onClick={() => setShowDetails(val => !val)}
                                            active={showDetails}>
                                            <FontAwesomeIcon icon="info" fixedWidth />
                                        </Button>
                                    ) : null}
                                </>
                            ) : (
                                <SimpleToolTip
                                    tooltipid="generic.no_perm"
                                    show={canAdd ? false : undefined}>
                                    <Button
                                        variant="success"
                                        className="mx-1"
                                        disabled={!canAdd}
                                        onClick={e =>
                                            e.shiftKey
                                                ? onSelectCommit(
                                                      pr.head,
                                                      "No comment set - Fast Add"
                                                  )
                                                : setShowModal(true)
                                        }>
                                        <FontAwesomeIcon icon="plus" fixedWidth />
                                    </Button>
                                </SimpleToolTip>
                            )}
                        </div>
                    </div>
                </td>
            </tr>

            <tr>
                <td className="py-0 border-top-0" />
                <td colSpan={4} className="py-0 border-top-0">
                    {testmergeinfo ? (
                        <Collapse in={showDetails}>
                            <div>
                                <div className="py-3">
                                    <table className="reset-table">
                                        <tbody>
                                            <tr>
                                                <td className="text-nowrap">
                                                    <span className="p-2">
                                                        <FormattedMessage id="view.instance.repo.tm.by" />
                                                    </span>
                                                </td>
                                                <td>{testmergeinfo.mergedBy.name}</td>
                                            </tr>
                                            <tr>
                                                <td className="text-nowrap">
                                                    <span className="p-2">
                                                        <FormattedMessage id="view.instance.repo.tm.comment" />
                                                    </span>
                                                </td>
                                                <td>{testmergeinfo.comment}</td>
                                            </tr>
                                            <tr>
                                                <td className="text-nowrap">
                                                    <span className="p-2">
                                                        <FormattedMessage id="view.instance.repo.tm.commit" />
                                                    </span>
                                                </td>
                                                <td>
                                                    {activeCommit ? (
                                                        <>
                                                            {activeCommit.name}
                                                            <a
                                                                className="ml-1"
                                                                href={activeCommit.url}
                                                                target="_blank"
                                                                rel="noreferrer">
                                                                (
                                                                {testmergeinfo.targetCommitSha.substring(
                                                                    0,
                                                                    7
                                                                )}
                                                                )
                                                            </a>
                                                        </>
                                                    ) : (
                                                        testmergeinfo.targetCommitSha.substring(
                                                            0,
                                                            7
                                                        )
                                                    )}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </Collapse>
                    ) : null}
                </td>
            </tr>
            <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        <FormattedMessage id="view.instance.repo.tm.modal.title" />
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <h5>
                        <a
                            href={pr.link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-decoration-none">
                            {pr.title}
                        </a>
                    </h5>
                    <FormattedMessage id="view.instance.repo.tm.modal.label" />
                    {commits ? (
                        <SelectSearch
                            filterOptions={fuzzySearch}
                            search
                            options={commitOptions}
                            value={selectedCommit ?? activeCommit?.sha}
                            autoComplete="on"
                            //@ts-expect-error error in the library, it's the wrong type
                            renderOption={(
                                props,
                                option: SelectedOptionValue & { current: boolean; latest: boolean },
                                snapshot,
                                className
                            ) => (
                                //@ts-expect-error error in the library, it's the wrong type
                                <button
                                    type="button"
                                    className={
                                        className + (option.disabled ? " font-weight-bold" : "")
                                    }
                                    {...props}>
                                    <Badge>{(option.value as string).substring(0, 7)}</Badge>
                                    {option.current ? (
                                        <Badge variant="primary" pill className="mr-1">
                                            <FormattedMessage id="generic.testmerged" />
                                        </Badge>
                                    ) : null}
                                    {option.latest ? (
                                        <Badge variant="success" pill className="mr-1">
                                            <FormattedMessage id="generic.latest" />
                                        </Badge>
                                    ) : null}
                                    {option.name}
                                </button>
                            )}
                            onChange={value => setSelectedCommit((value as unknown) as string)}
                        />
                    ) : (
                        <Loading text="loading.repo.commits" width={5} widthUnit="rem" />
                    )}
                    <InputField
                        name="view.instance.repo.tm.modal.comment"
                        type={FieldType.String}
                        onChange={newComment => setComment(newComment)}
                        defaultValue={testmergeinfo?.comment ?? ""}
                    />
                    <span className="text-muted font-italic mt-4 d-inline-block">
                        <FormattedMessage id="view.instance.repo.tm.modal.tip" />
                    </span>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={() => setShowModal(false)}>
                        <FormattedMessage id="generic.close" />
                    </Button>
                    <Button
                        onClick={() => {
                            if (selectedCommit) onSelectCommit(selectedCommit, comment);
                            setShowModal(false);
                        }}>
                        <FormattedMessage id="generic.save" />
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
