import { graphql } from "react-relay";

const UpdatePermissions = graphql`
    fragment UpdatePermissionsFragment on User {
        effectivePermissionSet {
            administrationRights {
                canChangeVersion
                canUploadVersion
            }
        }
    }
`;

export default UpdatePermissions;
