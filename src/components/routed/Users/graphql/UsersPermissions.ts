import { graphql } from "react-relay";

const UsersPermissions = graphql`
    fragment UsersPermissionsFragment on User {
        effectivePermissionSet {
            administrationRights {
                canReadUsers
                canWriteUsers
            }
        }
    }
`;

export default UsersPermissions;
