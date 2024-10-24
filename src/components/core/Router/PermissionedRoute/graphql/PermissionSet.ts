import { graphql } from "react-relay";

const PermissionSet = graphql`
    query PermissionSetQuery {
        swarm {
            users {
                current {
                    effectivePermissionSet {
                        ...AdministrationPermissionsFragment
                    }
                }
            }
        }
    }
`;

export default PermissionSet;
