import { Meta, StoryObj } from "@storybook/react";
import { Suspense } from "react";
import { loadQuery, useRelayEnvironment } from "react-relay";

import { ServerInformationQuery } from "./graphql/__generated__/ServerInformationQuery.graphql";
import ServerInformation from "./graphql/ServerInformation";
import ServerInfo from "./ServerInfo";

import { WithRelayParameters } from "@/../.storybook/MockRelayEnvironment";

const variables = {};

const TestComponent = () => {
    const queryRef = loadQuery<ServerInformationQuery>(
        useRelayEnvironment(),
        ServerInformation,
        variables
    );

    return (
        <Suspense>
            <ServerInfo queryRef={queryRef} />
        </Suspense>
    );
};

const CreateRelay = (): WithRelayParameters<ServerInformationQuery> => ({
    query: ServerInformation,
    mockResolvers: {
        Query: () => ({
            swarm: {
                currentNode: {
                    gateway: {
                        information: {
                            apiVersion: "10.10.0",
                            dmApiVersion: "5.10.0",
                            graphQLApiVersion: "0.3.0",
                            instanceLimit: 10,
                            minimumPasswordLength: 15,
                            swarmProtocolVersion: "7.0.0",
                            userGroupLimit: 25,
                            userLimit: 100,
                            version: "6.11.1",
                            windowsHost: true,
                            oAuthProviderInfos: {
                                discord: {
                                    clientID: "asdf"
                                },
                                gitHub: {
                                    clientID: "asdf"
                                },
                                invisionCommunity: {
                                    clientID: "asdf"
                                },
                                keycloak: {
                                    clientID: "asdf"
                                },
                                tgForums: {
                                    clientID: "asdf"
                                }
                            }
                        }
                    }
                },
                nodes: [
                    {
                        address: "http://example1.org",
                        controller: true,
                        identifier: "Pro-Skub"
                    },
                    {
                        address: "http://example1.org",
                        controller: false,
                        identifier: "Anti-Skub"
                    }
                ]
            }
        })
    },
    variables
});

const config: Meta<typeof TestComponent> = {
    component: TestComponent,
    title: "Routed/Server Info"
};

export default config;

type Story = StoryObj<typeof config>;

export const Default: Story = {
    parameters: {
        relay: CreateRelay()
    }
};
