import { graphql } from "react-relay";

const UpdateInformation = graphql`
    query UpdateInformationQuery {
        swarm {
            currentNode {
                gateway {
                    information {
                        windowsHost
                        version
                    }
                }
            }
            updateInformation {
                generatedAt
                latestVersion
                trackedRepositoryUrl
                updateInProgress
            }
            users {
                current {
                    id
                    effectivePermissionSet {
                        administrationRights {
                            canChangeVersion
                            canDownloadLogs
                            canRestartHost
                            canUploadVersion
                        }
                    }
                }
            }
        }
    }
`;

export default UpdateInformation;
