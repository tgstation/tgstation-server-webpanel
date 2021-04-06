import { faPlus } from "@fortawesome/free-solid-svg-icons/faPlus";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { ReactNode } from "react";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/esm/Card";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Modal from "react-bootstrap/Modal";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Table from "react-bootstrap/Table";
import Tooltip from "react-bootstrap/Tooltip";
import { FormattedMessage } from "react-intl";
import { Link, RouteComponentProps, withRouter } from "react-router-dom";

import { InstanceManagerRights } from "../../../ApiClient/generatedcode/_enums";
import { Components } from "../../../ApiClient/generatedcode/_generated";
import InstanceClient from "../../../ApiClient/InstanceClient";
import InstancePermissionSetClient from "../../../ApiClient/InstancePermissionSetClient";
import InternalError, { ErrorCode } from "../../../ApiClient/models/InternalComms/InternalError";
import { StatusCode } from "../../../ApiClient/models/InternalComms/InternalStatus";
import ServerClient from "../../../ApiClient/ServerClient";
import UserClient from "../../../ApiClient/UserClient";
import { resolvePermissionSet } from "../../../utils/misc";
import { AppRoutes, RouteData } from "../../../utils/routes";
import { ErrorAlert, Loading } from "../../utils";

type Instance = Components.Schemas.InstanceResponse & {
    canAccess: boolean;
};

interface IState {
    instances: Instance[];
    loading?: boolean;
    loadingNewInstance: boolean;
    errors: Array<InternalError<ErrorCode> | undefined>;
    errorNewInstance?: InternalError<ErrorCode>;
    //isnt directly used but is used to make react rerender when the selected insance is changed
    instanceid?: number;
    canOnline: boolean;
    canCreate: boolean;
    // For creating a new instance
    creatingInstance: boolean;
    serverInformation?: Components.Schemas.ServerInformationResponse;
    instanceName?: string;
    instancePath?: string;
    instanceEnabled?: boolean;
    prefix?: string;
}
interface IProps extends RouteComponentProps {}

export default withRouter(
    class InstanceList extends React.Component<IProps, IState> {
        public constructor(props: IProps) {
            super(props);

            this.setOnline = this.setOnline.bind(this);

            const actualid =
                RouteData.instanceid !== undefined ? parseInt(RouteData.instanceid) : undefined;

            this.state = {
                loading: true,
                loadingNewInstance: false,
                instances: [],
                errors: [],
                instanceid: actualid,
                canOnline: false,
                canCreate: false,
                creatingInstance: false
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

        private async loadInstances(): Promise<void> {
            const instancelist = await InstanceClient.listInstances();
            const modifiedlist: Array<Instance> = [];

            if (instancelist.code == StatusCode.OK) {
                const work: Array<Promise<void>> = [];
                for (const instance of instancelist.payload) {
                    const modifiedinstance = instance as Instance;
                    if (instance.online) {
                        work.push(
                            InstancePermissionSetClient.getCurrentInstancePermissionSet(
                                instance.id
                            ).then(permissionset => {
                                if (permissionset.code == StatusCode.OK) {
                                    modifiedinstance.canAccess = true;
                                } else {
                                    modifiedinstance.canAccess = false;
                                    if (permissionset.error.code !== ErrorCode.HTTP_ACCESS_DENIED) {
                                        this.addError(permissionset.error);
                                    }
                                }
                                modifiedlist.push(modifiedinstance);
                            })
                        );
                    } else {
                        modifiedinstance.canAccess = false;
                        modifiedlist.push(modifiedinstance);
                    }
                }

                await Promise.all(work);

                this.setState({
                    instances: modifiedlist.sort((a, b) => a.id - b.id)
                });
            } else {
                this.addError(instancelist.error);
            }
        }

        public async componentDidMount(): Promise<void> {
            await this.loadInstances();

            await UserClient.getCurrentUser().then(userinfo => {
                if (userinfo.code === StatusCode.OK) {
                    const instanceManagerRights = resolvePermissionSet(userinfo.payload)
                        .instanceManagerRights;
                    this.setState({
                        canOnline: !!(instanceManagerRights & InstanceManagerRights.SetOnline),
                        canCreate: !!(instanceManagerRights & InstanceManagerRights.Create)
                    });
                } else {
                    this.addError(userinfo.error);
                }
            });

            const serverInformationStatus = await ServerClient.getServerInfo();
            if (serverInformationStatus.code !== StatusCode.OK) {
                this.setState({
                    loading: false
                });
                this.addError(serverInformationStatus.error);
            } else {
                const serverInformation = serverInformationStatus.payload;
                this.setState({
                    serverInformation,
                    prefix: serverInformation.validInstancePaths?.length
                        ? serverInformation.validInstancePaths[0]
                        : undefined,
                    loading: false
                });
            }
        }

        private async setOnline(instance: Instance) {
            //Yes this is desynchronized and will use the last known state of the instance
            // to determine what state we should put it in, thats intentional, if the user clicks Set Online, it needs
            // to be online, no matter what it previously was
            const desiredState = !instance.online;
            const instanceedit = await InstanceClient.editInstance(({
                id: instance.id,
                online: desiredState
            } as unknown) as Components.Schemas.InstanceResponse);
            if (instanceedit.code === StatusCode.OK) {
                await this.loadInstances();
            } else {
                this.addError(instanceedit.error);
            }
        }

        public render(): ReactNode {
            if (this.state.loading) {
                return <Loading text="loading.instance.list" />;
            }

            return (
                <>
                    {!!this.state.creatingInstance && this.renderNewInstanceModal()}
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
                                    if (this.state.errorNewInstance === err) {
                                        this.setState({ errorNewInstance: undefined });
                                    }
                                }}
                            />
                        );
                    })}
                    <Card>
                        <Card.Header>
                            <h1>
                                <FormattedMessage id="view.instance.list.title" />
                            </h1>
                        </Card.Header>
                        <Table striped hover variant="dark" responsive className="mb-4">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>
                                        <FormattedMessage id="view.instance.list.name" />
                                    </th>
                                    <th>
                                        <FormattedMessage id="generic.status" />
                                    </th>
                                    <th>
                                        <FormattedMessage id="generic.path" />
                                    </th>
                                </tr>
                            </thead>
                            <tbody>{this.renderListing()}</tbody>
                        </Table>
                        <Card.Body>{this.renderAddInstance()}</Card.Body>
                    </Card>
                </>
            );
        }
        // Highlander style, there can only be one!
        private renderNewInstanceModal(): React.ReactNode {
            const vlad_paths = this.state.serverInformation?.validInstancePaths;
            return (
                <Modal
                    aria-labelledby="contained-modal-title-vcenter"
                    show={this.state.creatingInstance}
                    centered
                    onHide={() => {
                        this.setState({ creatingInstance: false });
                    }}>
                    <Modal.Header closeButton>
                        <Modal.Title>Create a new instance</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {this.state.errorNewInstance && (
                            <ErrorAlert
                                error={this.state.errorNewInstance}
                                onClose={() => this.setState({ errorNewInstance: undefined })}
                            />
                        )}
                        <Form.Group>
                            <Form.Label>
                                <FormattedMessage id="view.instance.create.name" />
                            </Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter instance name"
                                onChange={e => {
                                    const instanceName = e.target.value;
                                    this.setState({
                                        instanceName
                                    });
                                }}
                                value={this.state.instanceName}
                                required
                                isInvalid={!this.state.instanceName}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>
                                <FormattedMessage id="view.instance.create.path" />
                            </Form.Label>
                            <InputGroup hasValidation>
                                {vlad_paths != null ? (
                                    <>
                                        <InputGroup.Text>
                                            <FormattedMessage id="view.instance.create.path.prefix" />
                                        </InputGroup.Text>
                                        <Form.Control
                                            as="select"
                                            custom
                                            required
                                            onChange={event => {
                                                this.setState({
                                                    prefix: event.target.value
                                                });
                                            }}>
                                            {vlad_paths.map(validPath => {
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
                                    </>
                                ) : null}
                                <Form.Control
                                    type="text"
                                    placeholder="Enter instance directory"
                                    required
                                    onChange={event => {
                                        const instancePath = event.target.value;
                                        this.setState({
                                            instancePath
                                        });
                                    }}
                                    value={this.state.instancePath}
                                    isInvalid={!this.state.instancePath}
                                    disabled={this.state.loadingNewInstance}
                                />
                            </InputGroup>
                        </Form.Group>
                        <Form.Group>
                            <Form.Check
                                type="switch"
                                checked={this.state.instanceEnabled}
                                id={"enable-server-on-create"}
                                onChange={e => {
                                    this.setState({
                                        instanceEnabled: e.target.checked
                                    });
                                }}
                                disabled={this.state.loadingNewInstance}
                                label={<FormattedMessage id="view.instance.create.enabled" />}
                            />
                        </Form.Group>
                        <Modal.Footer>
                            <Button
                                onClick={async () => {
                                    await this.submit();
                                }}
                                disabled={
                                    !this.state.instanceName ||
                                    !this.state.instancePath ||
                                    this.state.loadingNewInstance
                                }
                                variant="success">
                                <FormattedMessage id="view.instance.create.submit" />
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    this.setState({ creatingInstance: false });
                                }}>
                                <FormattedMessage id="generic.cancel" />
                            </Button>
                        </Modal.Footer>
                    </Modal.Body>
                </Modal>
            );
        }

        private async submit() {
            //The required attribute should prevent this from ever happening but id rather not fuck over someone
            if (!this.state.instancePath) {
                return;
            }

            const instancePath =
                (this.state.prefix ? this.state.prefix + "/" : "") + this.state.instancePath;

            this.setState({
                loadingNewInstance: true
            });

            const result = await InstanceClient.createInstance({
                name: this.state.instanceName!,
                path: instancePath
            });

            if (result.code === StatusCode.ERROR) {
                this.setState({
                    errorNewInstance: result.error,
                    loadingNewInstance: false,
                    creatingInstance: false
                });
                this.addError(result.error);
                return;
            }
            await this.loadInstances();
            const instance = result.payload as Instance;
            await this.setOnline(instance);
            RouteData.instanceid = result.payload.id.toString();
            this.props.history.push(AppRoutes.instancelist.link || AppRoutes.instancelist.route);
            this.setState({
                loadingNewInstance: false,
                creatingInstance: false
            });
        }

        private renderListing(): React.ReactNode {
            return this.state.instances.map(value => {
                return (
                    <tr key={value.id}>
                        <td>
                            <code>{value.id}</code>
                        </td>
                        <td>
                            <Link
                                onClick={() => {
                                    RouteData.instanceid = String(value.id);
                                }}
                                to={`/instances/hosting/${value.id}`}>
                                {value.name}
                            </Link>
                        </td>
                        <td>
                            {value.online ? (
                                <Badge variant="success">
                                    <FormattedMessage id="generic.online" />
                                </Badge>
                            ) : (
                                <Badge variant="danger">
                                    <FormattedMessage id="generic.offline" />
                                </Badge>
                            )}
                        </td>
                        <td>
                            <code>
                                {value.moveJob ? (
                                    <FormattedMessage id="view.instance.moving" />
                                ) : (
                                    value.path
                                )}
                            </code>
                        </td>
                        <td>
                            <Button
                                size="sm"
                                variant={value.online ? "danger" : "success"}
                                onClick={() => this.setOnline(value)}
                                disabled={!this.state.canOnline}>
                                <FormattedMessage
                                    id={`view.instance.list.set.${
                                        value.online ? "offline" : "online"
                                    }`}
                                />
                            </Button>
                        </td>
                    </tr>
                );
            });
        }

        private renderAddInstance(): React.ReactNode {
            return (
                <OverlayTrigger
                    overlay={
                        <Tooltip id="tooltip-disabled">
                            <FormattedMessage id="perms.instance.create.warning" />
                        </Tooltip>
                    }
                    placement="top"
                    trigger={!this.state.canCreate ? ["hover", "focus"] : []}>
                    <div>
                        <Button
                            variant="success"
                            block
                            onClick={() => {
                                this.setState({ creatingInstance: true });
                            }}
                            style={!this.state.canCreate ? { pointerEvents: "none" } : {}}
                            disabled={!this.state.canCreate}>
                            <div>
                                <FontAwesomeIcon className="mr-2" icon={faPlus} />
                                <FormattedMessage id="view.instance.create.title" />
                            </div>
                        </Button>
                    </div>
                </OverlayTrigger>
            );
        }
    }
);
