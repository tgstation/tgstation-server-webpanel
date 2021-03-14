import {
    faCodeBranch,
    faDownload,
    faTimes,
    faUndo,
    faUpload
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import Button from "react-bootstrap/esm/Button";
import Col from "react-bootstrap/esm/Col";
import InputGroup from "react-bootstrap/esm/InputGroup";
import OverlayTrigger from "react-bootstrap/esm/OverlayTrigger";
import Row from "react-bootstrap/esm/Row";
import Tab from "react-bootstrap/esm/Tab";
import Table from "react-bootstrap/esm/Table";
import Tabs from "react-bootstrap/esm/Tabs";
import Tooltip from "react-bootstrap/esm/Tooltip";
import { FormattedMessage } from "react-intl";
import { RouteComponentProps, withRouter } from "react-router-dom";

import DreamMakerClient from "../../../ApiClient/DreamMakerClient";
import {
    ErrorCode as TGSErrorCode,
    RemoteGitProvider,
    RepositoryRights
} from "../../../ApiClient/generatedcode/_enums";
import { Components } from "../../../ApiClient/generatedcode/_generated";
import InstancePermissionSetClient from "../../../ApiClient/InstancePermissionSetClient";
import InternalError, {
    ErrorCode,
    GenericErrors
} from "../../../ApiClient/models/InternalComms/InternalError";
import InternalStatus, { StatusCode } from "../../../ApiClient/models/InternalComms/InternalStatus";
import RepositoryClient from "../../../ApiClient/RepositoryClient";
import JobsController from "../../../ApiClient/util/JobsController";
import GitHubClient, { CommitData, PRData } from "../../../utils/GithubClient";
import { AppRoutes, RouteData } from "../../../utils/routes";
import ErrorAlert from "../../utils/ErrorAlert";
import InputField from "../../utils/InputField";
import Loading from "../../utils/Loading";

interface IProps extends RouteComponentProps<{ id: string; tab?: string }> {}
interface IState {
    loading: boolean;
    errors: Array<InternalError<ErrorCode> | undefined>;

    repositoryRights?: RepositoryRights;

    serverModel?: Components.Schemas.RepositoryResponse;

    newOrigin: string;
    cloneRecurseSubmodules: boolean;
    newUsername?: string | null;
    newPassword?: string | null;
    newReference?: string | null;

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
    editLock: boolean;
    tab: string;
}

export default withRouter(
    class RepositoryManager extends React.Component<IProps, IState> {
        public constructor(props: IProps) {
            super(props);

            RouteData.instanceid = props.match.params.id;
            RouteData.selectedrepotab = props.match.params.tab;

            this.state = {
                loading: true,
                errors: [],
                newOrigin: "https://github.com/tgstation/tgstation", // all shall be /tg/
                cloneRecurseSubmodules: true,
                editLock: false,
                tab: RouteData.selectedrepotab || "info",
                newTestMerges: [],
                deployAfterTestMerges: true,
                checkingAutoSetup: false,
                commitData: new Map<number, CommitData[] | null>()
            };
        }

        public async componentDidMount() {
            this.setState({
                loading: true
            });

            const refreshPromise = this.refresh(false);
            const permissionSetResponse = await InstancePermissionSetClient.getCurrentInstancePermissionSet(
                parseInt(this.props.match.params.id)
            );
            if (permissionSetResponse.code === StatusCode.OK) {
                this.setState({
                    repositoryRights: permissionSetResponse.payload.repositoryRights
                });
            } else {
                this.addError(permissionSetResponse.error);
            }

            await refreshPromise;

            this.setState({
                loading: false
            });
        }

        private async refresh(setLoading: boolean): Promise<void> {
            if (setLoading)
                this.setState({
                    loading: true
                });

            const response = await RepositoryClient.getCurrent(
                parseInt(this.props.match.params.id)
            );

            if (response.code === StatusCode.OK) {
                const serverModel = response.payload;
                this.digestResponse(serverModel);

                this.setState({
                    newReference: null,
                    newUsername: null,
                    newPassword: null
                });

                const prData = await this.getPRData(serverModel);
                this.setState({
                    prData,
                    commitData: new Map<number, CommitData[] | null>()
                });
            } else {
                this.addError(response.error);
            }

            if (setLoading)
                this.setState({
                    loading: false
                });
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
                return <Loading text="loading.repo" />;
            }

            const serverModel = this.state.serverModel;
            let body: React.ReactNode | null;

            if (
                this.state.errors.some(
                    err => err?.originalErrorMessage?.errorCode === TGSErrorCode.RepoCloning
                )
            )
                return <Loading text="loading.repo.clone" />;

            if (
                this.state.errors.some(
                    err => err?.originalErrorMessage?.errorCode === TGSErrorCode.RepoBusy
                )
            )
                return <Loading text="loading.repo.busy" />;

            if (!serverModel) body = null;
            else if (!serverModel.origin) body = this.renderClonePage(serverModel);
            else body = this.renderMainPage(serverModel);

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
                    {body}
                </div>
            );
        }

        private checkOriginCloning(newOrigin: string) {
            this.setState({
                newOrigin
            });
        }

        private renderClonePage(model: Components.Schemas.RepositoryResponse): React.ReactNode {
            const canClone = this.checkFlag(RepositoryRights.SetOrigin);
            const canCreds = this.checkFlag(RepositoryRights.ChangeCredentials);
            return (
                <React.Fragment>
                    <h3>
                        <FormattedMessage id="view.instance.repo.clone" />
                    </h3>
                    <InputField
                        name="repository.clone_url"
                        defaultValue={this.state.newOrigin}
                        type="str"
                        onChange={newOrigin => {
                            this.checkOriginCloning(newOrigin);
                        }}
                        disabled={!canClone}
                    />
                    <InputField
                        name="repository.clone_reference"
                        defaultValue="(default branch)"
                        type="str"
                        onChange={newReference => {
                            this.setState({ newReference });
                        }}
                        disabled={!canClone}
                    />
                    <InputField
                        name="repository.access_user"
                        defaultValue={model.accessUser || ""}
                        type="str"
                        onChange={newUsername => {
                            this.setState({ newUsername });
                        }}
                        disabled={!canCreds}
                    />
                    <InputField
                        name="repository.access_password"
                        defaultValue=""
                        type="str"
                        password
                        onChange={newPassword => {
                            this.setState({ newPassword });
                        }}
                        disabled={!canCreds}
                    />
                    <InputField
                        name="repository.clone_recurse"
                        defaultValue={this.state.cloneRecurseSubmodules}
                        type="bool"
                        onChange={cloneRecurseSubmodules => {
                            this.setState({ cloneRecurseSubmodules });
                        }}
                        disabled={!canCreds}
                    />
                    <br />
                    <OverlayTrigger
                        overlay={
                            <Tooltip id="clone-repo-tooltip">
                                <FormattedMessage id="perms.instance.repo.clone.warning" />
                            </Tooltip>
                        }
                        show={canClone ? false : undefined}>
                        {({ ref, ...triggerHandler }) => (
                            <Button
                                ref={ref}
                                className="mx-1"
                                variant="success"
                                onClick={() => {
                                    void this.clone();
                                }}
                                disabled={!canClone}
                                {...triggerHandler}>
                                <div>
                                    <FontAwesomeIcon className="mr-2" icon={faDownload} />
                                    <FormattedMessage id="view.instance.repo.clone.action" />
                                </div>
                            </Button>
                        )}
                    </OverlayTrigger>
                </React.Fragment>
            );
        }

        private async clone(): Promise<void> {
            this.setState({
                loading: true
            });

            const response = await RepositoryClient.clone(
                {
                    origin: this.state.newOrigin,
                    reference: this.state.newReference,
                    accessUser: this.state.newUsername,
                    accessToken: this.state.newPassword,
                    recurseSubmodules: this.state.cloneRecurseSubmodules
                },
                parseInt(this.props.match.params.id)
            );

            this.setState({
                loading: false
            });

            if (response.code != StatusCode.OK) {
                this.addError(response.error);
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
            await this.refresh(true);
        }

        private async editRepo(
            model?: Components.Schemas.RepositoryUpdateRequest,
            maybeDeployAfter?: boolean
        ): Promise<void> {
            this.setState({
                loading: true,
                errors: []
            });

            const instanceId = parseInt(this.props.match.params.id);
            let response: InternalStatus<Components.Schemas.RepositoryResponse, GenericErrors>;
            if (!model) {
                response = await RepositoryClient.delete(instanceId);
            } else {
                response = await RepositoryClient.edit(instanceId, model);
            }

            if (response.code === StatusCode.OK) {
                this.digestResponse(response.payload);

                if (maybeDeployAfter && this.state.deployAfterTestMerges) {
                    await new Promise<number>(resolve =>
                        window.setTimeout(() => resolve(1), 10000)
                    );

                    const jobResponse = await DreamMakerClient.deploy(instanceId);
                    if (jobResponse.code === StatusCode.OK) {
                        JobsController.register(jobResponse.payload);
                    } else {
                        this.addError(jobResponse.error);
                    }
                }
            } else {
                this.addError(response.error);
            }

            this.setState({
                loading: false
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

        private checkFlag(flag: RepositoryRights): boolean {
            return (
                this.state.repositoryRights == null || (this.state.repositoryRights & flag) !== 0
            );
        }

        private renderMainPage(model: Components.Schemas.RepositoryResponse): React.ReactNode {
            return (
                <div className="text-center">
                    <h3>
                        <FormattedMessage id="view.instance.repo" />
                    </h3>
                    <Tabs
                        activeKey={this.state.tab}
                        onSelect={tab => {
                            if (!tab) return;

                            RouteData.selectedrepotab = tab;
                            window.history.pushState(
                                null,
                                window.document.title,
                                AppRoutes.instancecode.link || AppRoutes.instancecode.route
                            );

                            this.setState({ tab });
                        }}
                        id="test"
                        className="justify-content-center mb-3 mt-4 flex-column flex-md-row">
                        {this.renderInfoTab(model)}
                        {this.renderTestMergeManager(model)}
                    </Tabs>
                </div>
            );
        }

        private renderTestMergeManager(
            model: Components.Schemas.RepositoryResponse
        ): React.ReactNode {
            const activeTestMerges = model.revisionInformation?.activeTestMerges || [];
            const noActiveTestMergesRemovedOrChanged = activeTestMerges.every(activeTestMerge =>
                this.state.newTestMerges.some(
                    newTestMerge =>
                        newTestMerge.number === activeTestMerge.number &&
                        newTestMerge.targetCommitSha === activeTestMerge.targetCommitSha &&
                        newTestMerge.comment === activeTestMerge.comment
                )
            );
            const newTestMergesWithoutActiveTestMerges = this.state.newTestMerges.filter(
                newTestMerge =>
                    !activeTestMerges.some(
                        activeTestMerge => activeTestMerge.number === newTestMerge.number
                    )
            );

            const noChanges =
                noActiveTestMergesRemovedOrChanged &&
                newTestMergesWithoutActiveTestMerges.length === 0;
            return (
                <Tab
                    eventKey="test_merging"
                    title={<FormattedMessage id="view.instance.repo.test_merging" />}>
                    {this.renderDeployToggle()}
                    <br />
                    {this.renderAutomaticTestMergeAdder()}
                    <br />
                    {this.renderManualTestMergeAdder()}
                    <br />
                    {this.renderPendingChanges(model)}
                    <div className="d-flex justify-content-center w-50 mx-auto text-center">
                        <Button
                            disabled={
                                !(
                                    this.checkFlag(RepositoryRights.MergePullRequest) &&
                                    this.checkFlag(RepositoryRights.UpdateBranch)
                                )
                            }
                            className="btn mx-3 btn-info w-25"
                            variant="success"
                            onClick={() => {
                                void this.editRepo(
                                    {
                                        reference: model.reference,
                                        updateFromOrigin: true,
                                        newTestMerges: this.state.newTestMerges
                                    },
                                    true
                                );
                            }}>
                            <FormattedMessage id="view.instance.repo.test_merging.apply" />
                        </Button>
                        <Button
                            disabled={
                                !(
                                    this.checkFlag(RepositoryRights.MergePullRequest) &&
                                    this.checkFlag(RepositoryRights.UpdateBranch) &&
                                    noActiveTestMergesRemovedOrChanged
                                ) || noChanges
                            }
                            className="btn mx-3 btn-info w-25"
                            variant="success"
                            onClick={() => {
                                void this.editRepo(
                                    {
                                        updateFromOrigin: true,
                                        newTestMerges: newTestMergesWithoutActiveTestMerges
                                    },
                                    true
                                );
                            }}>
                            <FormattedMessage id="view.instance.repo.test_merging.apply.merge" />
                        </Button>
                        <Button
                            disabled={
                                !(
                                    this.checkFlag(RepositoryRights.MergePullRequest) &&
                                    noActiveTestMergesRemovedOrChanged
                                ) || noChanges
                            }
                            className="btn mx-3 btn-info w-25"
                            variant="success"
                            onClick={() => {
                                void this.editRepo(
                                    {
                                        newTestMerges: newTestMergesWithoutActiveTestMerges
                                    },
                                    true
                                );
                            }}>
                            <FormattedMessage id="view.instance.repo.test_merging.apply.raw" />
                        </Button>
                    </div>
                </Tab>
            );
        }

        private renderDeployToggle(): React.ReactNode {
            return (
                <InputField
                    name="repository.deploy"
                    tooltip="view.instance.repo.deploy"
                    defaultValue={this.state.deployAfterTestMerges}
                    type="bool"
                    onChange={newval => {
                        this.setState({ deployAfterTestMerges: newval });
                    }}
                />
            );
        }

        private renderPendingChanges(
            model: Components.Schemas.RepositoryResponse
        ): React.ReactNode {
            const activeTestMerges = model.revisionInformation?.activeTestMerges || [];

            const renderTr = (
                parameters: Components.Schemas.TestMergeParameters,
                additionalInfo?: Components.Schemas.TestMerge,
                showMerger?: boolean,
                revertButton?: boolean
            ) => {
                const leftButton = revertButton ? (
                    <Button
                        disabled={!this.checkFlag(RepositoryRights.UpdateBranch)}
                        className="btn mx-3 btn-info w-25"
                        variant="success"
                        onClick={() => {
                            const newPendingTestMerges = this.state.newTestMerges.filter(
                                oldParameters => parameters.number !== oldParameters.number
                            );
                            newPendingTestMerges.push({
                                number: parameters.number,
                                targetCommitSha: parameters.targetCommitSha,
                                comment: parameters.comment
                            });

                            this.setState({
                                newTestMerges: newPendingTestMerges
                            });
                        }}>
                        <FontAwesomeIcon className="mr-2" icon={faUndo} />
                    </Button>
                ) : (
                    <React.Fragment>
                        <Button
                            disabled={!this.checkFlag(RepositoryRights.UpdateBranch)}
                            className="btn mx-3 btn-info w-25"
                            variant="danger"
                            onClick={() => {
                                const newPendingTestMerges = this.state.newTestMerges.filter(
                                    oldParameters => parameters.number !== oldParameters.number
                                );

                                this.setState({
                                    newTestMerges: newPendingTestMerges
                                });
                            }}>
                            <FontAwesomeIcon className="mr-2" icon={faTimes} />
                        </Button>
                        {parameters.targetCommitSha ? (
                            <Button
                                disabled={!this.checkFlag(RepositoryRights.UpdateBranch)}
                                className="btn mx-3 btn-info w-25"
                                variant="success"
                                onClick={() => {
                                    const newPendingTestMerges = this.state.newTestMerges.filter(
                                        potential => potential.number !== parameters.number
                                    );
                                    newPendingTestMerges.push({
                                        number: parameters.number,
                                        // @ts-expect-error: actually a bug in the API definition, LHS should be nullable. https://github.com/tgstation/tgstation-server/issues/1234
                                        targetCommitSha: null,
                                        comment: parameters.comment
                                    });

                                    this.setState({
                                        newTestMerges: newPendingTestMerges
                                    });
                                }}>
                                <FontAwesomeIcon className="mr-2" icon={faUpload} />
                            </Button>
                        ) : null}
                    </React.Fragment>
                );

                return (
                    <tr style={{ backgroundColor: revertButton ? "red" : undefined }}>
                        <td className="py-1">
                            {additionalInfo?.url ? (
                                <a
                                    href={additionalInfo.url}
                                    target="_blank"
                                    rel="noopener noreferrer">
                                    #{parameters.number}
                                </a>
                            ) : (
                                <span>#{parameters.number}</span>
                            )}
                        </td>
                        <td className="py-1">{parameters.targetCommitSha || "HEAD"}</td>
                        {showMerger && additionalInfo?.mergedBy ? (
                            <td className="py-1">{additionalInfo.mergedBy.name}</td>
                        ) : null}
                        <td className="py-1">
                            {parameters.comment ? (
                                <span>{parameters.comment}</span>
                            ) : (
                                <b>
                                    <FormattedMessage id="view.instance.repo.test_merging.active.comment.none" />
                                </b>
                            )}
                        </td>
                        <td className="py-1">{leftButton}</td>
                    </tr>
                );
            };

            const renderTable = (body: React.ReactNode, header: string, showMerger: boolean) => {
                return (
                    <React.Fragment>
                        <br />
                        <h5>
                            <FormattedMessage id={`view.instance.repo.test_merging.${header}`} />
                        </h5>
                        <Table striped hover variant="dark" className="text-left">
                            <thead className="bg-dark">
                                <th>#</th>
                                <th>
                                    <FormattedMessage id="view.instance.repo.test_merging.active.sha" />
                                </th>
                                {showMerger ? (
                                    <th>
                                        <FormattedMessage id="view.instance.repo.test_merging.active.merger" />
                                    </th>
                                ) : null}
                                <th>
                                    <FormattedMessage id="view.instance.repo.test_merging.active.comment" />
                                </th>
                                <th>
                                    <FormattedMessage id="view.instance.repo.test_merging.active.action" />
                                </th>
                            </thead>
                            <tbody>{body}</tbody>
                        </Table>
                    </React.Fragment>
                );
            };

            return (
                <React.Fragment>
                    {renderTable(
                        <React.Fragment>
                            {activeTestMerges
                                .filter(testMerge =>
                                    this.state.newTestMerges.some(
                                        parameters =>
                                            parameters.number === testMerge.number &&
                                            parameters.targetCommitSha === testMerge.targetCommitSha
                                    )
                                )
                                .map(testMerge => {
                                    return renderTr(testMerge, testMerge, true);
                                })}
                        </React.Fragment>,
                        "active",
                        true
                    )}
                    {renderTable(
                        <React.Fragment>
                            {this.state.newTestMerges
                                .concat(
                                    activeTestMerges.filter(
                                        activeTestMerge =>
                                            !this.state.newTestMerges.some(
                                                parameters =>
                                                    parameters.number === activeTestMerge.number &&
                                                    parameters.targetCommitSha ===
                                                        activeTestMerge.targetCommitSha &&
                                                    parameters.comment === activeTestMerge.comment
                                            )
                                    )
                                )
                                .map(parameters => {
                                    const activeTestMerge = activeTestMerges.find(
                                        potentialActiveTestMerge =>
                                            parameters.number === potentialActiveTestMerge.number &&
                                            parameters.targetCommitSha ===
                                                potentialActiveTestMerge.targetCommitSha &&
                                            parameters.comment === potentialActiveTestMerge.comment
                                    );

                                    if (
                                        activeTestMerge &&
                                        this.state.newTestMerges.includes(parameters)
                                    )
                                        return null;

                                    return renderTr(
                                        parameters,
                                        activeTestMerge,
                                        false,
                                        !!activeTestMerge
                                    );
                                })}
                        </React.Fragment>,
                        "pending",
                        false
                    )}
                </React.Fragment>
            );
        }

        private async loadCommitData(prNumber: number): Promise<void> {
            if (this.state.commitData.has(prNumber) || !this.state.serverModel) return;

            const copyMap = new Map<number, CommitData[] | null>(this.state.commitData);
            copyMap.set(prNumber, null);

            this.setState({
                commitData: copyMap
            });

            const response = await GitHubClient.getCommits(
                this.state.serverModel.remoteRepositoryOwner!,
                this.state.serverModel.remoteRepositoryName!,
                prNumber
            );

            if (response.code !== StatusCode.OK) {
                this.addError(response.error);
                return;
            }

            const copyMap2 = new Map<number, CommitData[] | null>(this.state.commitData);
            copyMap2.set(prNumber, response.payload);

            this.setState({
                commitData: copyMap2
            });
        }

        private renderAutomaticTestMergeAdder(): React.ReactNode | null {
            if (!this.state.prData?.length) return null;

            return (
                <React.Fragment>
                    <h5>
                        <FormattedMessage id="view.instance.repo.test_merging.auto" />
                    </h5>
                    <InputGroup>
                        <InputGroup.Prepend className="w-40 flex-grow-1 flex-xl-grow-0 overflow-auto mb-2 mb-xl-0">
                            <InputGroup.Text className="flex-fill">
                                <FormattedMessage id="fields.repository.test_merge.auto" />
                            </InputGroup.Text>
                        </InputGroup.Prepend>
                        <div className="flex-grow-1 w-100 w-xl-auto d-flex mb-3 mb-xl-0">
                            <select
                                className="flex-fill mb-0"
                                onChange={event => {
                                    const newPrNumber = parseInt(
                                        event.target.selectedOptions[0].value
                                    );
                                    this.setState({
                                        autoTestMergeNumber: newPrNumber
                                    });

                                    void this.loadCommitData(newPrNumber);
                                }}
                                disabled={!this.checkFlag(RepositoryRights.MergePullRequest)}>
                                <FormattedMessage id="view.instance.repo.test_merging.auto.select">
                                    {message => (
                                        <option
                                            selected={this.state.autoTestMergeNumber == null}
                                            value="0">
                                            {message}
                                        </option>
                                    )}
                                </FormattedMessage>
                                {this.state.prData
                                    .filter(
                                        data =>
                                            !this.state.newTestMerges.some(
                                                parameters => parameters.number === data.number
                                            )
                                    )
                                    .map(data => (
                                        <option
                                            value={data.number}
                                            key={data.number}
                                            selected={
                                                data.number === this.state.autoTestMergeNumber
                                            }>
                                            #{data.number} - {data.title} @{data.author}
                                        </option>
                                    ))}
                            </select>
                        </div>
                    </InputGroup>
                    <InputGroup>
                        <InputGroup.Prepend className="w-40 flex-grow-1 flex-xl-grow-0 overflow-auto mb-2 mb-xl-0">
                            <InputGroup.Text className="flex-fill">
                                <FormattedMessage id="fields.repository.test_merge.sha" />
                            </InputGroup.Text>
                        </InputGroup.Prepend>
                        <div className="flex-grow-1 w-100 w-xl-auto d-flex mb-3 mb-xl-0">
                            <select
                                className="flex-fill mb-0"
                                onChange={event => {
                                    let newSha: string | null =
                                        event.target.selectedOptions[0].value;
                                    if (newSha === "HEAD") newSha = null;
                                    this.setState({
                                        autoTestMergeSha: newSha
                                    });
                                }}
                                disabled={
                                    !(
                                        this.state.commitData.has(
                                            this.state.autoTestMergeNumber || 0
                                        ) &&
                                        !!this.state.commitData.get(
                                            this.state.autoTestMergeNumber || 0
                                        ) &&
                                        this.checkFlag(RepositoryRights.MergePullRequest)
                                    )
                                }>
                                <FormattedMessage id="loading.commits">
                                    {message => (
                                        <option
                                            selected={this.state.autoTestMergeSha == null}
                                            value="HEAD">
                                            HEAD
                                            {this.state.autoTestMergeNumber &&
                                            this.state.commitData.has(
                                                this.state.autoTestMergeNumber
                                            ) &&
                                            !this.state.commitData.get(
                                                this.state.autoTestMergeNumber
                                            )
                                                ? ` (${message!.toString()})`
                                                : ""}
                                        </option>
                                    )}
                                </FormattedMessage>
                                {!!this.state.autoTestMergeNumber &&
                                this.state.commitData.has(this.state.autoTestMergeNumber) &&
                                !!this.state.commitData.get(this.state.autoTestMergeNumber)
                                    ? this.state.commitData
                                          .get(this.state.autoTestMergeNumber)!
                                          .map(data => (
                                              <option
                                                  value={data.sha}
                                                  key={data.sha}
                                                  selected={
                                                      data.sha === this.state.autoTestMergeSha
                                                  }>
                                                  {data.sha.substring(0, 7)} - {data.message}
                                              </option>
                                          ))
                                    : null}
                            </select>
                        </div>
                    </InputGroup>
                    <InputField
                        name="repository.test_merge.comment"
                        tooltip="view.instance.repo.test_merging.comment"
                        defaultValue={this.state.autoTestMergeComment || ""}
                        type="str"
                        onChange={newval => {
                            void this.setState({ autoTestMergeComment: newval });
                        }}
                        disabled={!this.checkFlag(RepositoryRights.MergePullRequest)}
                    />
                    <br />
                    <Button
                        disabled={!this.state.autoTestMergeNumber}
                        className="btn mx-3 btn-info w-25"
                        variant="success"
                        onClick={() => {
                            const newPendingTestMerges = [...this.state.newTestMerges];

                            newPendingTestMerges.push({
                                number: this.state.autoTestMergeNumber!, // this wouldn't fire if this wasn't the case
                                // @ts-expect-error: actually a bug in the API definition, LHS should be nullable. https://github.com/tgstation/tgstation-server/issues/1234
                                targetCommitSha: this.state.autoTestMergeSha,
                                comment: this.state.autoTestMergeComment
                            });

                            this.setState({
                                newTestMerges: newPendingTestMerges,
                                autoTestMergeNumber: null,
                                autoTestMergeComment: null,
                                autoTestMergeSha: null
                            });
                        }}>
                        <FormattedMessage id="view.instance.repo.test_merging.add" />
                    </Button>
                </React.Fragment>
            );
        }

        private renderManualTestMergeAdder(): React.ReactNode {
            return (
                <React.Fragment>
                    <br />
                    <h5>
                        <FormattedMessage id="view.instance.repo.test_merging.manual" />
                    </h5>
                    <InputField
                        name="repository.test_merge.number"
                        defaultValue={this.state.manualTestMergeNumber || 1}
                        type="num"
                        onChange={newval => {
                            void this.setState({ manualTestMergeNumber: newval });
                        }}
                        disabled={!this.checkFlag(RepositoryRights.MergePullRequest)}
                    />
                    <InputField
                        name="repository.test_merge.sha"
                        defaultValue={this.state.manualTestMergeSha || "HEAD"}
                        type="str"
                        onChange={newval => {
                            void this.setState({ manualTestMergeSha: newval });
                        }}
                        disabled={!this.checkFlag(RepositoryRights.MergePullRequest)}
                    />
                    <InputField
                        name="repository.test_merge.comment"
                        tooltip="view.instance.repo.test_merging.comment"
                        defaultValue={this.state.manualTestMergeComment || ""}
                        type="str"
                        onChange={newval => {
                            void this.setState({ manualTestMergeComment: newval });
                        }}
                        disabled={!this.checkFlag(RepositoryRights.MergePullRequest)}
                    />
                    <br />
                    <Button
                        disabled={!this.state.manualTestMergeNumber}
                        className="btn mx-3 btn-info w-25"
                        variant="success"
                        onClick={() => {
                            const newPendingTestMerges = [...this.state.newTestMerges];

                            newPendingTestMerges.push({
                                number: this.state.manualTestMergeNumber!, // this wouldn't fire if this wasn't the case
                                // @ts-expect-error: actually a bug in the API definition, LHS should be nullable. https://github.com/tgstation/tgstation-server/issues/1234
                                targetCommitSha: this.state.manualTestMergeSha,
                                comment: this.state.manualTestMergeComment
                            });

                            this.setState({
                                newTestMerges: newPendingTestMerges,
                                manualTestMergeNumber: null,
                                manualTestMergeComment: null,
                                manualTestMergeSha: null
                            });
                        }}>
                        <FormattedMessage id="view.instance.repo.test_merging.add" />
                    </Button>
                </React.Fragment>
            );
        }

        private renderInfoTab(model: Components.Schemas.RepositoryResponse): React.ReactNode {
            const setEditLock = (value: boolean) => {
                this.setState({
                    editLock: value
                });
            };

            return (
                <Tab eventKey="info" title={<FormattedMessage id="generic.info" />}>
                    <Row xs={1} md={2}>
                        <Col>
                            <h5 className="m-0">
                                <FormattedMessage id="view.instance.repo.origin" />:
                            </h5>
                        </Col>
                        <Col className="mb-2">{model.origin}</Col>
                    </Row>
                    {model.reference != null ? (
                        <Row xs={1} md={2}>
                            <Col>
                                <h5 className="m-0">
                                    <FormattedMessage id="view.instance.repo.reference" />:
                                </h5>
                            </Col>
                            <Col className="mb-2">{model.reference}</Col>
                        </Row>
                    ) : null}
                    <Row xs={1} md={2}>
                        <Col>
                            <h5 className="m-0">
                                <FormattedMessage id="view.instance.repo.sha" />:
                            </h5>
                        </Col>
                        <Col className="mb-2">{model.revisionInformation?.commitSha}</Col>
                    </Row>
                    <Row xs={1} md={2}>
                        <Col>
                            <h5 className="m-0">
                                <FormattedMessage id="view.instance.repo.origin_sha" />:
                            </h5>
                        </Col>
                        <Col className="mb-2">{model.revisionInformation?.originCommitSha}</Col>
                    </Row>
                    <br />
                    <InputField
                        name="repository.sha"
                        defaultValue=""
                        type="str"
                        onChange={newval => {
                            void this.editRepo({ checkoutSha: newval });
                        }}
                        disabled={!this.checkFlag(RepositoryRights.SetSha)}
                        setEditLock={setEditLock}
                        editLock={this.state.editLock}
                    />
                    <InputField
                        name="repository.reference"
                        defaultValue=""
                        type="str"
                        onChange={newval => {
                            void this.editRepo({ reference: newval });
                        }}
                        disabled={!this.checkFlag(RepositoryRights.SetReference)}
                        setEditLock={setEditLock}
                        editLock={this.state.editLock}
                    />
                    <br />
                    <InputField
                        name="repository.committer_name"
                        defaultValue={model.committerName}
                        type="str"
                        onChange={newval => {
                            void this.editRepo({ committerName: newval });
                        }}
                        disabled={!this.checkFlag(RepositoryRights.ChangeCommitter)}
                        setEditLock={setEditLock}
                        editLock={this.state.editLock}
                    />
                    <InputField
                        name="repository.committer_email"
                        defaultValue={model.committerEmail}
                        type="str"
                        onChange={newval => {
                            void this.editRepo({ committerEmail: newval });
                        }}
                        disabled={!this.checkFlag(RepositoryRights.ChangeCommitter)}
                        setEditLock={setEditLock}
                        editLock={this.state.editLock}
                    />
                    <br />
                    <InputField
                        name="repository.access_user"
                        defaultValue={model.accessUser || ""}
                        type="str"
                        onChange={newval => {
                            void this.editRepo({ accessUser: newval });
                        }}
                        disabled={!this.checkFlag(RepositoryRights.ChangeCredentials)}
                        setEditLock={setEditLock}
                        editLock={this.state.editLock}
                    />
                    <InputField
                        name="repository.access_password"
                        defaultValue=""
                        type="str"
                        password
                        onChange={newval => {
                            void this.editRepo({ accessToken: newval });
                        }}
                        disabled={!this.checkFlag(RepositoryRights.ChangeCredentials)}
                        setEditLock={setEditLock}
                        editLock={this.state.editLock}
                    />
                    <br />
                    <InputField
                        tooltip="perms.instance.repo.update.conflict"
                        name="repository.update_testmerges"
                        defaultValue={model.autoUpdatesKeepTestMerges}
                        type="bool"
                        onChange={newval => {
                            void this.editRepo({
                                autoUpdatesKeepTestMerges: newval
                            });
                        }}
                        disabled={!this.checkFlag(RepositoryRights.ChangeAutoUpdateSettings)}
                        setEditLock={setEditLock}
                        editLock={this.state.editLock}
                    />
                    <InputField
                        name="repository.merger_name"
                        tooltip="perms.instance.repo.update.users"
                        defaultValue={model.showTestMergeCommitters}
                        type="bool"
                        onChange={newval => {
                            void this.editRepo({ showTestMergeCommitters: newval });
                        }}
                        disabled={!this.checkFlag(RepositoryRights.ChangeTestMergeCommits)}
                        setEditLock={setEditLock}
                        editLock={this.state.editLock}
                    />
                    <InputField
                        name="repository.push_test_merges"
                        tooltip="perms.instance.repo.update.orphaned"
                        defaultValue={model.pushTestMergeCommits}
                        type="bool"
                        onChange={newval => {
                            void this.editRepo({ pushTestMergeCommits: newval });
                        }}
                        disabled={!this.checkFlag(RepositoryRights.ChangeTestMergeCommits)}
                        setEditLock={setEditLock}
                        editLock={this.state.editLock}
                    />
                    <InputField
                        name="repository.test_merge_comment"
                        defaultValue={model.postTestMergeComment}
                        type="bool"
                        onChange={newval => {
                            void this.editRepo({ postTestMergeComment: newval });
                        }}
                        disabled={!this.checkFlag(RepositoryRights.ChangeTestMergeCommits)}
                        setEditLock={setEditLock}
                        editLock={this.state.editLock}
                    />
                    <InputField
                        name="repository.github_deployment"
                        defaultValue={model.createGitHubDeployments}
                        type="bool"
                        onChange={newval => {
                            void this.editRepo({ createGitHubDeployments: newval });
                        }}
                        disabled={!this.checkFlag(RepositoryRights.ChangeTestMergeCommits)}
                        setEditLock={setEditLock}
                        editLock={this.state.editLock}
                    />
                    {this.renderDeployToggle()}
                    <br />
                    <div className="d-flex justify-content-center w-50 mx-auto text-center">
                        <Button
                            disabled={!this.checkFlag(RepositoryRights.UpdateBranch)}
                            className="btn mx-3 btn-info w-25"
                            variant="success"
                            onClick={() => {
                                void this.editRepo(
                                    {
                                        reference: model.reference,
                                        updateFromOrigin: true
                                    },
                                    true
                                );
                            }}>
                            <FontAwesomeIcon className="mr-2" icon={faUpload} />
                            <FormattedMessage id="view.instance.repo.update" />
                        </Button>
                        <Button
                            disabled={!this.checkFlag(RepositoryRights.UpdateBranch)}
                            className="btn mx-3 btn-info w-25"
                            variant="success"
                            onClick={() => {
                                void this.editRepo(
                                    {
                                        updateFromOrigin: true
                                    },
                                    true
                                );
                            }}>
                            <FontAwesomeIcon className="mr-2" icon={faCodeBranch} />
                            <FormattedMessage id="view.instance.repo.update.merge" />
                        </Button>
                        <Button
                            disabled={!this.checkFlag(RepositoryRights.Delete)}
                            className="btn mx-3 btn-info w-25"
                            variant="danger"
                            onClick={() => {
                                void this.editRepo();
                            }}>
                            <FontAwesomeIcon className="mr-2" icon={faTimes} />
                            <FormattedMessage id="view.instance.repo.delete" />
                        </Button>
                    </div>
                </Tab>
            );
        }
    }
);
