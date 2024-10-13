import { graphql } from "react-relay";

const NavbarAuthenticated = graphql`
    fragment NavbarAuthenticatedFragment on Query {
        swarm {
            users {
                current {
                    ...CommonUserDetailsFragment
                }
            }
            currentNode {
                gateway {
                    information {
                        version
                    }
                }
            }
        }
    }
`;

export default NavbarAuthenticated;
