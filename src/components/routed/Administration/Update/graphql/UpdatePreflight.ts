import { graphql } from "react-relay";

const UpdatePreflight = graphql`
    query UpdatePreflightQuery {
        swarm {
            users {
                current {
                    effectivePermissionSet {
                        administrationRights {
                            canChangeVersion
                            canUploadVersion
                        }
                    }
                }
            }
            updateInformation {
                latestVersion
            }
        }
    }
`;

export default UpdatePreflight;
