import { graphql } from "react-relay";

// TODO: Retrieve user details from a common fragment
const ServerLogin = graphql`
    mutation ServerLoginMutation {
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

export default ServerLogin;
