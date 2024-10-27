import { faLinux, faWindows } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FormattedMessage } from "react-intl";
import { PreloadedQuery, usePreloadedQuery } from "react-relay";
import { Link } from "react-router-dom";
import { lt } from "semver";

import UpdateInformation from "./graphql/UpdateInformation";
import { UpdateInformationQuery } from "./graphql/__generated__/UpdateInformationQuery.graphql";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";

interface IProps {
    queryRef: PreloadedQuery<UpdateInformationQuery>;
}

const Administration = (props: IProps) => {
    const data = usePreloadedQuery<UpdateInformationQuery>(UpdateInformation, props.queryRef);
    const gatewayInfo = data.swarm.currentNode.gateway.information;
    const updateInfo = data.swarm.updateInformation;
    const adminRights = data.swarm.users.current.effectivePermissionSet.administrationRights;

    const outOfDate = updateInfo.latestVersion && lt(gatewayInfo.version, updateInfo.latestVersion);

    const handleRestart = () => {
        throw new Error("TODO: Handle Restarting");
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
                        <Link to={updateInfo.trackedRepositoryUrl}>
                            {updateInfo.trackedRepositoryUrl}
                        </Link>
                    </h5>
                )}
                <h3>
                    <FormattedMessage id="view.admin.version.current" />
                    <span className={outOfDate ? "text-warning" : ""}>{gatewayInfo.version}</span>
                </h3>
                <h3>
                    <FormattedMessage id="view.admin.version.latest" />
                    <span className={outOfDate ? "text-warning" : ""}>
                        {updateInfo.latestVersion ?? (
                            <FormattedMessage id="view.admin.version.latest.unknown" />
                        )}
                    </span>
                </h3>
                <hr className="mt-2 mb-2" />
                <Dialog>
                    <DialogTrigger asChild>
                        <Button
                            className="mr-2 text-destructive-foreground bg-destructive"
                            disabled={!adminRights.canRestartHost}>
                            <FormattedMessage id="view.admin.reboot.button" />
                        </Button>
                    </DialogTrigger>
                    <Button
                        asChild
                        className="mr-2 bg-primary"
                        disabled={!(adminRights.canChangeVersion || adminRights.canUploadVersion)}>
                        <Link to="update">
                            <FormattedMessage id="view.admin.update.button" />
                        </Link>
                    </Button>
                    <Button
                        asChild
                        className="mr-2 bg-primary"
                        disabled={!adminRights.canDownloadLogs}>
                        <Link to="logs">
                            <FormattedMessage id="view.admin.logs.button" />
                        </Link>
                    </Button>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                <FormattedMessage id="view.admin.reboot.modal.title" />
                            </DialogTitle>
                        </DialogHeader>
                        <FormattedMessage id="view.admin.reboot.modal.body" />
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button>
                                    <FormattedMessage id="generic.close" />
                                </Button>
                            </DialogClose>
                            <DialogClose asChild>
                                <Button
                                    className="bg-destructive text-destructive-foreground"
                                    onClick={handleRestart}>
                                    <FormattedMessage id="view.admin.reboot.button" />
                                </Button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
};

export default Administration;
