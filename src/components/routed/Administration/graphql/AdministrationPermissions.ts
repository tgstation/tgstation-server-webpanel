import { graphql } from "react-relay";

const AdministrationPermissions = graphql`
    fragment AdministrationPermissionsFragment on User {
        effectivePermissionSet {
            administrationRights {
                canChangeVersion
                canDownloadLogs
                canRestartHost
                canUploadVersion
            }
        }
    }
`;

export default AdministrationPermissions;
