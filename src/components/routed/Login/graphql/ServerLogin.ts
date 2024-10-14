import { graphql } from "react-relay";

// TODO: Retrieve user details from a common fragment
const ServerLogin = graphql`
    mutation ServerLoginMutation {
        login {
            errors {
                ...ErrorMessageArrayFragment
            }
            loginResult {
                bearer
                user {
                    ...CommonUserDetailsFragment
                }
            }
        }
    }
`;

export default ServerLogin;
