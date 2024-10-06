import { graphql } from "react-relay";

const LoginMutation = graphql`
    mutation LoginMutation {
        login {
            errors {
                ... on ErrorMessageError {
                    additionalData
                    errorCode
                    message
                }
            }
            bearer
            user {
                id
                name
            }
        }
    }
`;

export default LoginMutation;
