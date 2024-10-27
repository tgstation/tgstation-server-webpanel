import { graphql } from "react-relay";

const SessionInvalidation = graphql`
    subscription SessionInvalidationSubscription {
        sessionInvalidated
    }
`;

export default SessionInvalidation;
