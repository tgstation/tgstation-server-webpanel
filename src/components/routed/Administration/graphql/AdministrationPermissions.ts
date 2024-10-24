import { graphql } from "react-relay";

const AdministrationPermissions = graphql`
    fragment AdministrationPermissionsFragment on PermissionSet {
        administrationRights {
            canChangeVersion
            canDownloadLogs
            canRestartHost
            canUploadVersion
        }
    }
`;

export default AdministrationPermissions;
