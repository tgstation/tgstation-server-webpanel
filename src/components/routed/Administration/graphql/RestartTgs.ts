import { graphql } from "react-relay";

const RestartTgs = graphql`
    mutation RestartTgsMutation {
        restartServerNode {
            errors {
                ...ErrorMessageArrayFragment
            }
        }
    }
`;

export default RestartTgs;
