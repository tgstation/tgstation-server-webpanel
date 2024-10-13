import { graphql } from "react-relay";

const ErrorMessage = graphql`
    fragment ErrorMessageFragment on ErrorMessageError {
        additionalData
        errorCode
        message
    }
`;

export default ErrorMessage;
