import { graphql } from "react-relay";

const ChangePasswordPreflight = graphql`
    query ChangePasswordPreflightQuery {
        swarm {
            currentNode {
                gateway {
                    information {
                        minimumPasswordLength
                    }
                }
            }
            users {
                current {
                    canonicalName
                }
            }
        }
    }
`;

export default ChangePasswordPreflight;
