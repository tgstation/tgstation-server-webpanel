import { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import Login from "./Login";
import GetOAuthProviders from "./OAuthOptions/graphql/GetOAuthProviders";
import {
    GetOAuthProvidersQuery,
    GetOAuthProvidersQuery$data,
    OAuthProvider
} from "./OAuthOptions/graphql/__generated__/GetOAuthProvidersQuery.graphql";

import { WithRelayParameters } from "@/../.storybook/MockRelayEnvironment";

let mockData: GetOAuthProvidersQuery$data;

let oAuthProviders: string[] = [];
const setMockData = () => {
    const actualProviders: {
        readonly key: OAuthProvider;
        readonly value: {
            readonly clientId: string | null | undefined;
            readonly redirectUri: string | null | undefined;
            readonly serverUrl: string | null | undefined;
        };
    }[] = [];

    const hasProvider = (provider: string) => oAuthProviders.some(x => x === provider);
    if (hasProvider("Discord")) {
        actualProviders.push({
            key: "DISCORD",
            value: {
                clientId: "test_discord_client_id",
                redirectUri: "https://discord.com",
                serverUrl: undefined
            }
        });
    }

    if (hasProvider("GitHub")) {
        actualProviders.push({
            key: "GIT_HUB",
            value: {
                clientId: "test_github_client_id",
                redirectUri: "https://github.com",
                serverUrl: undefined
            }
        });
    }

    if (hasProvider("Invision")) {
        actualProviders.push({
            key: "GIT_HUB",
            value: {
                clientId: "test_invision_client_id",
                redirectUri: "https://invision.com",
                serverUrl: undefined
            }
        });
    }

    if (hasProvider("Keycloak")) {
        actualProviders.push({
            key: "KEYCLOAK",
            value: {
                clientId: "test_invision_client_id",
                redirectUri: "https://keycloak.com",
                serverUrl: undefined
            }
        });
    }

    if (hasProvider("TGForums")) {
        actualProviders.push({
            key: "TG_FORUMS",
            value: {
                clientId: "test_tgstation_client_id",
                redirectUri: "https://tgstation13.org",
                serverUrl: undefined
            }
        });
    }

    mockData = {
        swarm: {
            currentNode: {
                gateway: {
                    information: {
                        oAuthProviderInfos: actualProviders
                    }
                }
            }
        }
    };
};

setMockData();

interface IExtraArgs {
    oAuthProviders: string[];
    setTemporaryHeader: (headerValue: string) => void;
}

const TestComponent = (args: IExtraArgs) => {
    oAuthProviders = args.oAuthProviders ?? [];
    setMockData();
    return <Login {...args} />;
};

const config: Meta<typeof TestComponent> = {
    component: TestComponent,
    title: "Routed/Login",
    args: {
        setTemporaryHeader: fn()
    },
    argTypes: {
        oAuthProviders: {
            options: ["Discord", "GitHub", "Invision", "Keycloak", "TGForums"],
            control: {
                type: "inline-check"
            },
            name: "OAuth Providers"
        }
    }
};

export default config;

type Story = StoryObj<typeof config>;

const relay: WithRelayParameters<GetOAuthProvidersQuery> = {
    query: GetOAuthProviders,
    mockResolvers: {
        Query: () => mockData
    }
};

export const Default: Story = {
    parameters: {
        query: GetOAuthProviders,
        relay
    }
};
