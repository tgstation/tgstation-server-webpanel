import { graphql } from "react-relay";

const CurrentUserUpdate = graphql`
    subscription CurrentUserUpdateSubscription {
        currentUserUpdated {
            id
            name
        }
    }
`;

export default CurrentUserUpdate;
