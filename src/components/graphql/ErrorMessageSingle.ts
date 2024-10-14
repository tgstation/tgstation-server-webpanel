import { graphql } from "react-relay";

const ErrorMessageSingle = graphql`
    fragment ErrorMessageSingleFragment on ErrorMessageError {
        additionalData
        errorCode
        message
    }
`;

export default ErrorMessageSingle;
