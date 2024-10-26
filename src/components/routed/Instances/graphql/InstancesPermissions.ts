import { graphql } from "react-relay";

const InstancesPermissions = graphql`
    fragment InstancesPermissionsFragment on User {
        effectivePermissionSet {
            instanceManagerRights {
                canCreate
                canList
                canRead
            }
        }
    }
`;

export default InstancesPermissions;
