import { graphql } from "react-relay";

const HomeCardPermissions = graphql`
    query HomeCardPermissionsQuery {
        swarm {
            users {
                current {
                    ...AdministrationPermissionsFragment
                    ...ChangePasswordPermissionsFragment
                }
            }
        }
    }
`;

export default HomeCardPermissions;
