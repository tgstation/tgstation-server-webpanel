import { graphql } from "react-relay";

const ServerInformation = graphql`
    query ServerInformationQuery {
        swarm {
            currentNode {
                gateway {
                    information {
                        apiVersion
                        dmApiVersion
                        graphQLApiVersion
                        instanceLimit
                        minimumPasswordLength
                        swarmProtocolVersion
                        userGroupLimit
                        userLimit
                        version
                        windowsHost
                        oAuthProviderInfos {
                            discord {
                                clientID
                            }
                            gitHub {
                                clientID
                            }
                            invisionCommunity {
                                clientID
                            }
                            keycloak {
                                clientID
                            }
                            tgForums {
                                clientID
                            }
                        }
                    }
                }
            }
            nodes {
                controller
                identifier
                address
            }
        }
    }
`;

export default ServerInformation;
