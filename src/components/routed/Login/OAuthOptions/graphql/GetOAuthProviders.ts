import { graphql } from "relay-runtime";

const GetOAuthProviders = graphql`
    query GetOAuthProvidersQuery {
        swarm {
            currentNode {
                gateway {
                    information {
                        oAuthProviderInfos {
                            key
                            value {
                                clientId
                                redirectUri
                                serverUrl
                            }
                        }
                    }
                }
            }
        }
    }
`;

export default GetOAuthProviders;
