import { graphql } from "react-relay";

const RestartTgs = graphql`
    mutation RestartTgsMutation {
        restartServerNode {
            errors {
                ... on ErrorMessageError {
                    additionalData
                    errorCode
                    message
                }
            }
        }
    }
`;

export default RestartTgs;
