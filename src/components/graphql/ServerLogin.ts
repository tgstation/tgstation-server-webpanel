import { graphql } from "react-relay";

const ServerLogin = graphql`
    mutation ServerLoginMutation {
        login {
            errors {
                ...ErrorMessageArrayFragment
            }
            loginResult {
                bearer
                user {
                    id
                    ...CommonUserDetailsFragment
                }
            }
        }
    }
`;

export default ServerLogin;
