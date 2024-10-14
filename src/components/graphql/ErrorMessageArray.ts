import { graphql } from "react-relay";

const ErrorMessageArray = graphql`
    fragment ErrorMessageArrayFragment on ErrorMessageError @relay(plural: true) {
        additionalData
        errorCode
        message
    }
`;

export default ErrorMessageArray;
