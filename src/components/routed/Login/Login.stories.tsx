import { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import Login from "./Login";
import GetOAuthProviders from "./OAuthOptions/graphql/GetOAuthProviders";
import {
    GetOAuthProvidersQuery,
    GetOAuthProvidersQuery$data
} from "./OAuthOptions/graphql/__generated__/GetOAuthProvidersQuery.graphql";

import { WithRelayParameters } from "@/../.storybook/MockRelayEnvironment";
import { ICredentials } from "@/lib/Credentials";

let mockData: GetOAuthProvidersQuery$data;

let oAuthProviders: string[] = [];
const setMockData = () => {
    const mockDiscord = {
        clientID: "test_discord_client_id"
    };

    const mockGitHub = {
        clientID: "test_github_client_id",
        redirectUri: "https://github.com"
    };

    const mockInvision = {
        clientID: "test_invision_client_id",
        redirectUri: "https://localhost:8080",
        serverUrl: "https://invision.com"
    };

    const mockKeycloak = {
        clientID: "test_invision_client_id",
        redirectUri: "https://localhost:8080",
        serverUrl: "https://keycloak.com"
    };

    const mockTG = {
        clientID: "test_tgstation_client_id",
        redirectUri: "https://tgstation13.org"
    };

    const hasProvider = (provider: string) => oAuthProviders.some(x => x === provider);

    mockData = {
        swarm: {
            currentNode: {
                gateway: {
                    information: {
                        oAuthProviderInfos: {
                            gitHub: hasProvider("GitHub") ? mockGitHub : null,
                            discord: hasProvider("Discord") ? mockDiscord : null,
                            invisionCommunity: hasProvider("Invision") ? mockInvision : null,
                            tgForums: hasProvider("TGForums") ? mockTG : null,
                            keycloak: hasProvider("Keycloak") ? mockKeycloak : null
                        }
                    }
                }
            }
        }
    };
};

setMockData();

interface IExtraArgs {
    oAuthProviders: string[];
    setTemporaryCredentials: (credentials: ICredentials) => void;
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
        setTemporaryCredentials: fn()
    },
    argTypes: {
        oAuthProviders: {
            options: ["Discord", "GitHub", "TGForums", "Invision", "Keycloak"],
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
