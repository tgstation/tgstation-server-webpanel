import { graphql } from "react-relay";

const PermissionSet = graphql`
    query PermissionSetQuery {
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

export default PermissionSet;
