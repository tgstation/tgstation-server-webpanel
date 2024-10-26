import { graphql } from "react-relay";

const ChangePasswordPermissions = graphql`
    fragment ChangePasswordPermissionsFragment on User {
        systemIdentifier
        effectivePermissionSet {
            administrationRights {
                canEditOwnPassword
            }
        }
    }
`;

export default ChangePasswordPermissions;
