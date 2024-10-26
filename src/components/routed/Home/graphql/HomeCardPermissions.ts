import { graphql } from "react-relay";

const HomeCardPermissions = graphql`
    query HomeCardPermissionsQuery {
        swarm {
            users {
                current {
                    id
                    ...AdministrationPermissionsFragment
                    ...ChangePasswordPermissionsFragment
                }
            }
        }
    }
`;

export default HomeCardPermissions;
