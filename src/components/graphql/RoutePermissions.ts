import { graphql } from "react-relay";

const RoutePermissions = graphql`
    query RoutePermissionsQuery {
        swarm {
            users {
                current {
                    id
                    ...AdministrationPermissionsFragment
                    ...ChangePasswordPermissionsFragment
                    ...InstancesPermissionsFragment
                    ...UsersPermissionsFragment
                }
            }
        }
    }
`;

export default RoutePermissions;
