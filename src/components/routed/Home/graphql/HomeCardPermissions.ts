import { graphql } from "react-relay";

const HomeCardPermissions = graphql`
    query HomeCardPermissionsQuery {
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

export default HomeCardPermissions;
