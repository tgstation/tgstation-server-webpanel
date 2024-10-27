import { faLinux, faWindows } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FormattedMessage } from "react-intl";
import { PreloadedQuery, usePreloadedQuery } from "react-relay";
import { Link } from "react-router-dom";

import UpdateInformation from "./graphql/UpdateInformation";
import { UpdateInformationQuery } from "./graphql/__generated__/UpdateInformationQuery.graphql";

import { Button } from "@/components/ui/button";

interface IProps {
    queryRef: PreloadedQuery<UpdateInformationQuery>;
}

const Administration = (props: IProps) => {
    const data = usePreloadedQuery<UpdateInformationQuery>(UpdateInformation, props.queryRef);
    const gatewayInfo = data.swarm.currentNode.gateway.information;
    const updateInfo = data.swarm.updateInformation;
    const adminRights = data.swarm.users.current.effectivePermissionSet.administrationRights;

    const handleRestart = () => {
        throw new Error("TODO Restarting");
    };

    return (
        <>
            <div className="text-center">
                <h3>
                    <FormattedMessage id="view.admin.hostos" />
                    <FontAwesomeIcon
                        fixedWidth
                        icon={gatewayInfo.windowsHost ? faWindows : faLinux}
                    />
                </h3>
                {updateInfo.trackedRepositoryUrl && (
                    <h5>
                        <FormattedMessage id="view.admin.remote" />
                        <a href={updateInfo.trackedRepositoryUrl}>
                            {updateInfo.trackedRepositoryUrl}
                        </a>
                    </h5>
                )}
                <h3>
                    <FormattedMessage id="view.admin.version.current" />
                    <span
                        className={
                            updateInfo.latestVersion &&
                            gatewayInfo.version < updateInfo.latestVersion
                                ? "text-danger"
                                : ""
                        }>
                        {gatewayInfo.version}
                    </span>
                </h3>
                <h3>
                    <FormattedMessage id="view.admin.version.latest" />
                    <span
                        className={
                            updateInfo.latestVersion &&
                            gatewayInfo.version < updateInfo.latestVersion
                                ? "text-danger"
                                : ""
                        }>
                        {updateInfo.latestVersion ?? (
                            <FormattedMessage id="view.admin.version.latest.unknown" />
                        )}
                    </span>
                </h3>
                <hr className="mt-2 mb-2" />
                <Button
                    className="mr-2 text-destructive-foreground bg-destructive"
                    disabled={!adminRights.canRestartHost}
                    onClick={handleRestart}>
                    <FormattedMessage id="view.admin.reboot.button" />
                </Button>
                <Button
                    asChild
                    className="mr-2 bg-primary"
                    disabled={!(adminRights.canChangeVersion || adminRights.canUploadVersion)}>
                    <Link to="update">
                        <FormattedMessage id="view.admin.update.button" />
                    </Link>
                </Button>
                <Button asChild className="mr-2 bg-primary" disabled={!adminRights.canDownloadLogs}>
                    <Link to="logs">
                        <FormattedMessage id="view.admin.logs.button" />
                    </Link>
                </Button>
            </div>
        </>
    );
    /*
    <Modal show={this.state.showRebootModal} onHide={handleClose} size="lg" centered>
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
        <Button variant="danger" onClick={() => void this.restart()}>
            <FormattedMessage id="view.admin.reboot.button" />
        </Button>
    </Modal.Footer>
</Modal>*/
};

export default Administration;
