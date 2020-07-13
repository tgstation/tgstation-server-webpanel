import React from "react";
import AccessDenied from "../utils/AccessDenied";
import { AppRoutes } from "../../utils/routes";
import InternalError, { ErrorCode } from "../../ApiClient/models/InternalComms/InternalError";
import { StatusCode } from "../../ApiClient/models/InternalComms/InternalStatus";
import Loading from "../utils/Loading";
import ErrorAlert from "../utils/ErrorAlert";
import { Components } from "../../ApiClient/generatedcode/_generated";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWindows } from "@fortawesome/free-brands-svg-icons/faWindows";
import { faLinux } from "@fortawesome/free-brands-svg-icons/faLinux";
import AdminClient from "../../ApiClient/AdminClient";
import ServerClient from "../../ApiClient/ServerClient";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import UserClient from "../../ApiClient/UserClient";
import { AdministrationRights } from "../../ApiClient/generatedcode/_enums";
import { FormattedMessage } from "react-intl";

interface IProps {}
interface IState {
    adminInfo?: Components.Schemas.Administration;
    serverInfo?: Components.Schemas.ServerInformation;
    error?: InternalError<ErrorCode>;
    busy: boolean;
    canReboot: boolean;
    showRebootModal?: boolean;
}

export default class Administration extends React.Component<IProps, IState> {
    public constructor(props: IProps) {
        super(props);
        this.restart = this.restart.bind(this);

        this.state = {
            busy: false,
            canReboot: false
        };
    }

    public async componentDidMount() {
        this.setState({
            busy: true
        });
        const tasks = [];

        console.time("DataLoad");
        tasks.push(this.loadAdminInfo());
        tasks.push(this.loadServerInfo());
        tasks.push(this.checkRebootRights());

        await Promise.all(tasks);
        console.timeEnd("DataLoad");
        this.setState({
            busy: false
        });
    }

    private async loadServerInfo() {
        console.time("ServerLoad");
        const response = await ServerClient.getServerInfo();
        switch (response.code) {
            case StatusCode.ERROR: {
                this.setState({
                    error: response.error
                });
                break;
            }
            case StatusCode.OK: {
                this.setState({
                    serverInfo: response.payload
                });
                break;
            }
        }
        console.timeEnd("ServerLoad");
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

    private async checkRebootRights() {
        const response = await UserClient.getCurrentUser();

        if (response.code === StatusCode.OK) {
            this.setState({
                canReboot: !!(
                    response.payload!.administrationRights & AdministrationRights.RestartHost
                )
            });
        }
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
                //doesnt happen, the page reloads first
            }
        }
        this.setState({
            busy: false
        });
        console.timeEnd("Reboot");
    }

    public render() {
        if (this.state.busy) {
            return <Loading />;
        }

        const handleClose = () => this.setState({ showRebootModal: false });
        const handleOpen = () => this.setState({ showRebootModal: true });

        return (
            <React.Fragment>
                <AccessDenied currentRoute={AppRoutes.admin} />
                <ErrorAlert
                    error={this.state.error}
                    onClose={() => this.setState({ error: undefined })}
                />
                {this.state.adminInfo && this.state.serverInfo ? (
                    <div className="text-center">
                        <h3 className=" text-secondary">
                            Host Machine OS:{" "}
                            <FontAwesomeIcon
                                fixedWidth
                                //@ts-ignore //it works on my machine, idk, typescript hates this for some reason
                                icon={this.state.adminInfo.windowsHost ? faWindows : faLinux}
                            />
                        </h3>
                        <h5 className="text-secondary">
                            Remote repository:{" "}
                            <a href={this.state.adminInfo.trackedRepositoryUrl!}>
                                {this.state.adminInfo.trackedRepositoryUrl!}
                            </a>
                        </h5>
                        <h3 className="text-secondary">
                            Current version:{" "}
                            <span
                                className={
                                    this.state.serverInfo.version! <
                                    this.state.adminInfo.latestVersion!
                                        ? "text-danger"
                                        : ""
                                }>
                                {this.state.serverInfo.version!}
                            </span>
                        </h3>
                        <h3 className="text-secondary">
                            Latest version:{" "}
                            <span
                                className={
                                    this.state.serverInfo.version! <
                                    this.state.adminInfo.latestVersion!
                                        ? "text-danger"
                                        : ""
                                }>
                                {this.state.adminInfo.latestVersion!}
                            </span>
                        </h3>
                        <hr />
                        <Button
                            variant="danger"
                            disabled={!this.state.canReboot}
                            onClick={handleOpen}>
                            <FormattedMessage id="view.admin.reboot.button" />
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
                ) : (
                    ""
                )}
            </React.Fragment>
        );
    }
}
