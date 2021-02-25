import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import Button from "react-bootstrap/esm/Button";
import OverlayTrigger from "react-bootstrap/esm/OverlayTrigger";
import Tooltip from "react-bootstrap/esm/Tooltip";
import { FormattedMessage } from "react-intl";
import { RouteComponentProps, withRouter } from "react-router-dom";

import { RepositoryRights } from "../../../ApiClient/generatedcode/_enums";
import { Components } from "../../../ApiClient/generatedcode/_generated";
import InstancePermissionSetClient from "../../../ApiClient/InstancePermissionSetClient";
import InternalError, { ErrorCode } from "../../../ApiClient/models/InternalComms/InternalError";
import { StatusCode } from "../../../ApiClient/models/InternalComms/InternalStatus";
import RepositoryClient from "../../../ApiClient/RepositoryClient";
import JobsController from "../../../ApiClient/util/JobsController";
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
}

export default withRouter(
    class CodeDeployment extends React.Component<IProps, IState> {
        public constructor(props: IProps) {
            super(props);

            RouteData.instanceid = props.match.params.id;

            this.state = {
                loading: true,
                errors: [],
                newOrigin: "https://github.com/tgstation/tgstation", // all shall be /tg/
                cloneRecurseSubmodules: true
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
                this.setState({
                    serverModel,
                    newReference: null,
                    newUsername: null,
                    newPassword: null
                });
            } else {
                this.addError(response.error);
            }

            if (setLoading)
                this.setState({
                    loading: false
                });
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
                return <Loading text="loading.user.load" />;
            }

            const serverModel = this.state.serverModel;
            let body: React.ReactNode | null;
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

        private checkPermission(right: Components.Schemas.RepositoryRights): boolean {
            return (
                this.state.repositoryRights != null && (this.state.repositoryRights & right) !== 0
            );
        }

        private renderClonePage(model: Components.Schemas.RepositoryResponse): React.ReactNode {
            const canClone = this.checkPermission(RepositoryRights.SetOrigin);
            const canCreds = this.checkPermission(RepositoryRights.ChangeCredentials);
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
                            this.setState({ newOrigin });
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
            this.props.history.push(AppRoutes.instancejobs.link || AppRoutes.instancejobs.route);
        }

        private renderMainPage(model: Components.Schemas.RepositoryResponse): React.ReactNode {
            return null;
        }
    }
);
