import { faPlus } from "@fortawesome/free-solid-svg-icons/faPlus";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { CSSProperties, ReactNode } from "react";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Table from "react-bootstrap/Table";
import Tooltip from "react-bootstrap/Tooltip";
import { FormattedMessage } from "react-intl";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { satisfies as SemverSatisfies } from "semver";

import {
    InstanceManagerRights,
    InstanceResponse
} from "../../../ApiClient/generatedcode/generated";
import InstanceClient from "../../../ApiClient/InstanceClient";
import InstancePermissionSetClient from "../../../ApiClient/InstancePermissionSetClient";
import InternalError, { ErrorCode } from "../../../ApiClient/models/InternalComms/InternalError";
import { StatusCode } from "../../../ApiClient/models/InternalComms/InternalStatus";
import ServerClient from "../../../ApiClient/ServerClient";
import { GeneralContext } from "../../../contexts/GeneralContext";
import { resolvePermissionSet } from "../../../utils/misc";
import { AppRoutes, RouteData } from "../../../utils/routes";
import ErrorAlert from "../../utils/ErrorAlert";
import { DebugJsonViewer } from "../../utils/JsonViewer";
import Loading from "../../utils/Loading";
import PageHelper from "../../utils/PageHelper";

type Instance = InstanceResponse & {
    canAccess: boolean;
};

interface IState {
    instances: Instance[];
    loading?: boolean;
    errors: Array<InternalError<ErrorCode> | undefined>;
    page: number;
    maxPage?: number;
}
interface IProps extends RouteComponentProps {}

class InstanceList extends React.Component<IProps, IState> {
    public declare context: GeneralContext;

    public constructor(props: IProps) {
        super(props);

        this.setOnline = this.setOnline.bind(this);

        this.state = {
            loading: true,
            instances: [],
            errors: [],
            page: RouteData.instancelistpage ?? 1
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

    public async componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<IState>) {
        if (prevState.page !== this.state.page) {
            RouteData.instancelistpage = this.state.page;
            await this.loadInstances();
        }
    }

    private async loadInstances(): Promise<void> {
        this.setState({
            loading: true
        });

        const instancelist = await InstanceClient.listInstances({ page: this.state.page });
        const tgsversionresponse = await ServerClient.getServerInfo();
        const enableVersionWorkaround =
            tgsversionresponse.code === StatusCode.OK &&
            SemverSatisfies(tgsversionresponse.payload.apiVersion, "<9.1.0");
        const modifiedlist: Array<Instance> = [];
        if (instancelist.code == StatusCode.OK) {
            //Safety against being on non existant pages
            if (
                this.state.page > instancelist.payload.totalPages &&
                instancelist.payload.totalPages !== 0
            ) {
                this.setState({
                    page: 1
                });
                return;
            }

            const work: Array<Promise<void>> = [];
            for (const instance of instancelist.payload.content) {
                const modifiedinstance = instance as Instance;
                if (!enableVersionWorkaround) {
                    modifiedinstance.canAccess =
                        modifiedinstance.online && modifiedinstance.accessible;
                    modifiedlist.push(modifiedinstance);
                } else if (instance.online) {
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
                instances: modifiedlist.sort((a, b) => a.id - b.id),
                maxPage: instancelist.payload.totalPages
            });
        } else {
            this.addError(instancelist.error);
        }

        this.setState({
            loading: false
        });
    }

    public async componentDidMount(): Promise<void> {
        await this.loadInstances();
    }

    private async setOnline(instance: Instance) {
        //Yes this is desynchronized and will use the last known state of the instance
        // to determine what state we should put it in, thats intentional, if the user clicks Set Online, it needs
        // to be online, no matter what it previously was
        const desiredState = !instance.online;
        const instanceedit = await InstanceClient.editInstance(({
            id: instance.id,
            online: desiredState
        } as unknown) as InstanceResponse);
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

        const canOnline = !!(
            resolvePermissionSet(this.context.user).instanceManagerRights &
            InstanceManagerRights.SetOnline
        );

        const tablecellstyling: CSSProperties = {
            verticalAlign: "middle"
        };

        return (
            <div className="text-center">
                <DebugJsonViewer obj={this.state.instances} />
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
                    <FormattedMessage id="view.instance.list.title" />
                </h3>
                <Table striped bordered hover variant="dark" responsive className="mb-4">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>
                                <FormattedMessage id="generic.name" />
                            </th>
                            <th>
                                <FormattedMessage id="generic.online" />
                            </th>
                            <th>
                                <FormattedMessage id="generic.path" />
                            </th>
                            <th>
                                <FormattedMessage id="generic.configmode" />
                            </th>
                            <th>
                                <FormattedMessage id="generic.action" />
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.instances.map(value => {
                            return (
                                <tr key={value.id}>
                                    <td style={tablecellstyling}>{value.id}</td>
                                    <td style={tablecellstyling}>{value.name}</td>
                                    <td style={tablecellstyling}>
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
                                    <td style={tablecellstyling}>
                                        {value.moveJob ? (
                                            <FormattedMessage id="view.instance.moving" />
                                        ) : (
                                            value.path
                                        )}
                                    </td>
                                    <td style={tablecellstyling}>
                                        <FormattedMessage
                                            id={`view.instance.configmode.${value.configurationType.toString()}`}
                                        />
                                    </td>
                                    <td className="align-middle p-1" style={tablecellstyling}>
                                        <Button
                                            className="mx-1"
                                            onClick={() => {
                                                RouteData.selectedinstanceid = value.id;
                                                this.props.history.push(
                                                    AppRoutes.instanceedit.link ??
                                                        AppRoutes.instanceedit.route
                                                );
                                            }}
                                            disabled={!value.canAccess}>
                                            <FormattedMessage id="generic.edit" />
                                        </Button>
                                        <Button
                                            className="mx-1"
                                            variant={value.online ? "danger" : "success"}
                                            onClick={() => this.setOnline(value)}
                                            disabled={!canOnline}>
                                            <FormattedMessage
                                                id={`view.instance.list.set.${
                                                    value.online ? "offline" : "online"
                                                }`}
                                            />
                                        </Button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
                <PageHelper
                    selectPage={newPage => this.setState({ page: newPage })}
                    totalPages={this.state.maxPage ?? 1}
                    currentPage={this.state.page}
                />
                <div className="align-middle">
                    <div className="mb-4">{this.renderAddInstance()}</div>
                    <Button
                        className="mx-1"
                        onClick={() => {
                            this.props.history.push(
                                AppRoutes.instancejobs.link ?? AppRoutes.instancejobs.route
                            );
                        }}>
                        <FormattedMessage id="routes.instancejobs" />
                    </Button>
                </div>
            </div>
        );
    }

    private renderAddInstance(): React.ReactNode {
        const canCreate = !!(
            resolvePermissionSet(this.context.user).instanceManagerRights &
            InstanceManagerRights.Create
        );

        return (
            <OverlayTrigger
                overlay={
                    <Tooltip id="create-instance-tooltip">
                        <FormattedMessage id="perms.instance.create.warning" />
                    </Tooltip>
                }
                show={canCreate ? false : undefined}>
                {({ ref, ...triggerHandler }) => (
                    <Button
                        ref={ref}
                        className="mx-1"
                        variant="success"
                        onClick={() => {
                            this.props.history.push(
                                AppRoutes.instancecreate.link ?? AppRoutes.instancecreate.route
                            );
                        }}
                        disabled={!canCreate}
                        {...triggerHandler}>
                        <div>
                            <FontAwesomeIcon className="mr-2" icon={faPlus} />
                            <FormattedMessage id="routes.instancecreate" />
                        </div>
                    </Button>
                )}
            </OverlayTrigger>
        );
    }
}
InstanceList.contextType = GeneralContext;
export default withRouter(InstanceList);
