import { faLinux } from "@fortawesome/free-brands-svg-icons/faLinux";
import { faWindows } from "@fortawesome/free-brands-svg-icons/faWindows";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { ReactNode } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { FormattedMessage } from "react-intl";
import { RouteComponentProps } from "react-router";
import { withRouter } from "react-router-dom";

import AdminClient from "../../ApiClient/AdminClient";
import {
    AdministrationResponse,
    AdministrationRights
} from "../../ApiClient/generatedcode/generated";
import InternalError, { ErrorCode } from "../../ApiClient/models/InternalComms/InternalError";
import { StatusCode } from "../../ApiClient/models/InternalComms/InternalStatus";
import { GeneralContext } from "../../contexts/GeneralContext";
import { resolvePermissionSet } from "../../utils/misc";
import { AppRoutes } from "../../utils/routes";
import ErrorAlert from "../utils/ErrorAlert";
import { DebugJsonViewer } from "../utils/JsonViewer";
import Loading from "../utils/Loading";

interface IProps extends RouteComponentProps {}
interface IState {
    adminInfo?: AdministrationResponse;
    error?: InternalError<ErrorCode>;
    busy: boolean;
    showRebootModal?: boolean;
}

class Administration extends React.Component<IProps, IState> {
    public declare context: GeneralContext;

    public constructor(props: IProps) {
        super(props);
        this.restart = this.restart.bind(this);

        this.state = {
            busy: false
        };
    }

    public async componentDidMount(): Promise<void> {
        this.setState({
            busy: true
        });
        const tasks = [];

        console.time("DataLoad");
        tasks.push(this.loadAdminInfo());

        await Promise.all(tasks);
        console.timeEnd("DataLoad");
        this.setState({
            busy: false
        });
    }

    private async loadAdminInfo() {
        console.time("AdminLoad");
        const response = await AdminClient.getAdminInfo();
        switch (response.code) {
            case StatusCode.ERROR: {
                this.setState({
                    error: response.error
                });
                break;
            }
            case StatusCode.OK: {
                this.setState({
                    adminInfo: response.payload
                });
                break;
            }
        }
        console.timeEnd("AdminLoad");
    }

    private async restart() {
        this.setState({
            showRebootModal: false,
            busy: true
        });
        console.time("Reboot");
        const response = await AdminClient.restartServer();
        switch (response.code) {
            case StatusCode.ERROR: {
                this.setState({
                    error: response.error
                });
                break;
            }
            case StatusCode.OK: {
                window.location.reload();
            }
        }
        this.setState({
            busy: false
        });
        console.timeEnd("Reboot");
    }

    public render(): ReactNode {
        if (this.state.busy) {
            return <Loading text="loading.admin" />;
        }

        const handleClose = () => this.setState({ showRebootModal: false });
        const handleOpen = () => this.setState({ showRebootModal: true });

        const canReboot = !!(
            resolvePermissionSet(this.context.user).administrationRights &
            AdministrationRights.RestartHost
        );
        const canUpdate = !!(
            resolvePermissionSet(this.context.user).administrationRights &
            AdministrationRights.ChangeVersion
        );
        const canLogs = !!(
            resolvePermissionSet(this.context.user).administrationRights &
            AdministrationRights.DownloadLogs
        );

        return (
            <React.Fragment>
                <DebugJsonViewer obj={this.state.adminInfo} />
                <ErrorAlert
                    error={this.state.error}
                    onClose={() => this.setState({ error: undefined })}
                />
                <div className="text-center">
                    {this.state.adminInfo ? (
                        <React.Fragment>
                            <h3 className=" text-secondary">
                                <FormattedMessage id="view.admin.hostos" />
                                <FontAwesomeIcon
                                    fixedWidth
                                    icon={this.context.serverInfo.windowsHost ? faWindows : faLinux}
                                />
                            </h3>
                            <h5 className="text-secondary">
                                <FormattedMessage id="view.admin.remote" />
                                <a href={this.state.adminInfo.trackedRepositoryUrl}>
                                    {this.state.adminInfo.trackedRepositoryUrl}
                                </a>
                            </h5>
                            <h3 className="text-secondary">
                                <FormattedMessage id="view.admin.version.current" />
                                <span
                                    className={
                                        this.context.serverInfo.version <
                                        this.state.adminInfo.latestVersion
                                            ? "text-danger"
                                            : ""
                                    }>
                                    {this.context.serverInfo.version}
                                </span>
                            </h3>
                            <h3 className="text-secondary">
                                <FormattedMessage id="view.admin.version.latest" />
                                <span
                                    className={
                                        this.context.serverInfo.version <
                                        this.state.adminInfo.latestVersion
                                            ? "text-danger"
                                            : ""
                                    }>
                                    {this.state.adminInfo.latestVersion}
                                </span>
                            </h3>
                        </React.Fragment>
                    ) : null}
                    <hr />
                    <Button
                        className="mr-2"
                        variant="danger"
                        disabled={!canReboot}
                        onClick={handleOpen}>
                        <FormattedMessage id="view.admin.reboot.button" />
                    </Button>
                    <Button
                        className="mr-2"
                        variant="primary"
                        disabled={!canUpdate}
                        onClick={() => {
                            this.props.history.push(
                                AppRoutes.admin_update.link ?? AppRoutes.admin_update.route
                            );
                        }}>
                        <FormattedMessage id="view.admin.update.button" />
                    </Button>
                    <Button
                        variant="primary"
                        disabled={!canLogs}
                        onClick={() => {
                            this.props.history.push(
                                AppRoutes.admin_logs.link ?? AppRoutes.admin_logs.route
                            );
                        }}>
                        <FormattedMessage id="view.admin.logs.button" />
                    </Button>
                    <Modal
                        show={this.state.showRebootModal}
                        onHide={handleClose}
                        size="lg"
                        centered>
                        <Modal.Header closeButton>
                            <Modal.Title>
                                <FormattedMessage id="view.admin.reboot.modal.title" />
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <FormattedMessage id="view.admin.reboot.modal.body" />
                        </Modal.Body>
                        <Modal.Footer>
                            <Button onClick={handleClose}>
                                <FormattedMessage id="generic.close" />
                            </Button>
                            <Button variant="danger" onClick={this.restart}>
                                <FormattedMessage id="view.admin.reboot.button" />
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </div>
            </React.Fragment>
        );
    }
}
Administration.contextType = GeneralContext;
export default withRouter(Administration);
