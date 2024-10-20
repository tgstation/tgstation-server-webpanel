import { graphql } from "react-relay";

const HomeCardPermissions = graphql`
    query HomeCardPermissionsQuery($userID: ID!) {
        node(id: $userID) {
            ... on User {
                effectivePermissionSet {
                    administrationRights {
                        canChangeVersion
                        canDownloadLogs
                        canUploadVersion
                        canEditOwnPassword
                        canReadUsers
                        canWriteUsers
                    }
                    instanceManagerRights {
                        canList
                        canRead
                    }
                }
            }
        }
    }
`;

export default HomeCardPermissions;
