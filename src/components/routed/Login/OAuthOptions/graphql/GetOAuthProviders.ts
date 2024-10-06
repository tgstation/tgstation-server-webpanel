import { graphql } from "react-relay";

const GetOAuthProviders = graphql`
    query GetOAuthProvidersQuery {
        swarm {
            currentNode {
                gateway {
                    information {
                        oAuthProviderInfos {
                            discord {
                                clientID
                            }
                            gitHub {
                                clientID
                                redirectUri
                            }
                            invisionCommunity {
                                clientID
                                redirectUri
                                serverUrl
                            }
                            keycloak {
                                clientID
                                redirectUri
                                serverUrl
                            }
                            tgForums {
                                clientID
                                redirectUri
                            }
                        }
                    }
                }
            }
        }
    }
`;

export default GetOAuthProviders;
