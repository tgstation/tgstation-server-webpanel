import { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor, within } from "@storybook/test";

import Login from "./Login";
import GetOAuthProviders from "./OAuthOptions/graphql/GetOAuthProviders";
import {
    GetOAuthProvidersQuery,
    GetOAuthProvidersQuery$data
} from "./OAuthOptions/graphql/__generated__/GetOAuthProvidersQuery.graphql";

import { MockRelayEnvironment, WithRelayParameters } from "@/../.storybook/MockRelayEnvironment";
import ErrorsProvider from "@/context/errors/Provider";
import useErrors from "@/context/errors/useErrors";
import SessionProvider from "@/context/session/Provider";
import useSession from "@/context/session/useSession";
import { ICredentials } from "@/lib/Credentials";
import sleep from "@/lib/sleep";
import { useEffect } from "react";
import { MockPayloadGenerator } from "relay-test-utils";

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
    onSessionCreated: () => void;
    hasErrors: () => void;
}

const InnerTestComponent = (args: IExtraArgs) => {
    oAuthProviders = args.oAuthProviders ?? [];
    setMockData();

    const session = useSession();
    useEffect(() => {
        if (session.currentSession) {
            args.onSessionCreated();
        }
    }, [args, session]);

    const errors = useErrors();
    useEffect(() => {
        if (errors.errors.length > 0) {
            args.hasErrors();
        }
    }, [args, errors]);

    return <Login {...args} />;
};

const TestComponent = (args: IExtraArgs) => {
    return (
        <ErrorsProvider>
            <SessionProvider setCredentials={() => {}}>
                <InnerTestComponent {...args} />
            </SessionProvider>
        </ErrorsProvider>
    );
};

const relay: WithRelayParameters<GetOAuthProvidersQuery> = {
    query: GetOAuthProviders,
    mockResolvers: {
        Query: () => mockData
    }
};

const config: Meta<typeof TestComponent> = {
    component: TestComponent,
    title: "Routed/Login",
    args: {
        setTemporaryCredentials: fn(),
        onSessionCreated: fn(),
        hasErrors: fn()
    },
    argTypes: {
        oAuthProviders: {
            options: ["Discord", "GitHub", "TGForums", "Invision", "Keycloak"],
            control: {
                type: "inline-check"
            },
            name: "OAuth Providers"
        }
    },
    parameters: {
        query: GetOAuthProviders,
        relay
    }
};

export default config;

type Story = StoryObj<typeof config>;

export const Default: Story = {};
export const SuccessfulLoginTest: Story = {
    play: async ({ args, canvasElement, step }) => {
        const canvas = within(canvasElement);

        await sleep(1000);
        const usernameField = canvas.getByTestId("login-username");
        const passwordField = canvas.getByTestId("login-password");
        const submitButton = canvas.getByTestId("login-submit");

        await step("Fake login", async () => {
            expect(args.setTemporaryCredentials).not.toBeCalled();
            expect(args.onSessionCreated).not.toBeCalled();
            expect(args.hasErrors).not.toBeCalled();
            await userEvent.type(usernameField, "test username");
            await userEvent.type(passwordField, "some password");
            await userEvent.click(submitButton);
            await waitFor(() => {
                const usernameField = canvas.queryByTestId("login-username");
                expect(usernameField).toBeNull();
                expect(args.setTemporaryCredentials).toBeCalled();
            });

            MockRelayEnvironment.mock.resolveMostRecentOperation(operation => {
                const payload = MockPayloadGenerator.generate(operation, {
                    LoginPayload: () => ({
                        errors: [],
                        loginResult: {
                            bearer: "new_bearer",
                            user: {
                                id: "current_user_id",
                                name: "current_user_name"
                            }
                        },
                        query: {}
                    })
                });

                return payload;
            });
            await waitFor(() => {
                expect(args.onSessionCreated).toBeCalled();
                expect(args.hasErrors).not.toBeCalled();
            });
        });
    }
};

export const UnauthenticatedLoginTest: Story = {
    play: async ({ args, canvasElement, step }) => {
        const canvas = within(canvasElement);

        await sleep(1000);
        const usernameField = canvas.getByTestId("login-username");
        const passwordField = canvas.getByTestId("login-password");
        const submitButton = canvas.getByTestId("login-submit");

        await step("Fake login", async () => {
            expect(args.setTemporaryCredentials).not.toBeCalled();
            expect(args.onSessionCreated).not.toBeCalled();
            await userEvent.type(usernameField, "test username");
            await userEvent.type(passwordField, "some password");
            await userEvent.click(submitButton);
            await waitFor(() => {
                const usernameField = canvas.queryByTestId("login-username");
                expect(usernameField).toBeNull();
                expect(args.setTemporaryCredentials).toBeCalled();
            });

            MockRelayEnvironment.mock.resolveMostRecentOperation(operation => {
                const payload = MockPayloadGenerator.generate(operation, {
                    LoginPayload: () => ({
                        errors: [
                            {
                                message: "Unauthenticated"
                            }
                        ],
                        loginResult: null,
                        query: {}
                    })
                });

                return payload;
            });
            await waitFor(() => {
                expect(args.onSessionCreated).not.toBeCalled();
                expect(args.hasErrors).toBeCalled();
            });
        });
    }
};
