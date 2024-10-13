import { graphql } from "react-relay";

const CommonUserDetails = graphql`
    fragment CommonUserDetailsFragment on User {
        id
        name
    }
`;

export default CommonUserDetails;
