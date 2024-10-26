import { graphql } from "react-relay";

const UpdateInformation = graphql`
    query UpdateInformationQuery {
        swarm {
            updateInformation {
                generatedAt
                latestVersion
                trackedRepositoryUrl
                updateInProgress
            }
        }
    }
`;

export default UpdateInformation;
