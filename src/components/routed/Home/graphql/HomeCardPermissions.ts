import { graphql } from "react-relay";

const HomeCardPermissions = graphql`
    query HomeCardPermissionsQuery {
        swarm {
            users {
                current {
                    effectivePermissionSet {
                        ...AdministrationPermissionsFragment
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
    }
`;

export default HomeCardPermissions;
