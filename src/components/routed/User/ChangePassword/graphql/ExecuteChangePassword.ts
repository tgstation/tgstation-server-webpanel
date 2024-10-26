import { graphql } from "react-relay";

const ExecuteChangePassword = graphql`
    mutation ExecuteChangePasswordMutation($newPassword: String!) {
        setCurrentUserPassword(input: { newPassword: $newPassword }) {
            errors {
                ...ErrorMessageArrayFragment
            }
        }
    }
`;

export default ExecuteChangePassword;
