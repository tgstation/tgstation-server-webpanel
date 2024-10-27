import { Meta, StoryObj } from "@storybook/react";
import { Suspense } from "react";
import { loadQuery, useRelayEnvironment } from "react-relay";

import Administration from "./Administration";
import { UpdateInformationQuery } from "./graphql/__generated__/UpdateInformationQuery.graphql";
import UpdateInformation from "./graphql/UpdateInformation";

import { WithRelayParameters } from "@/../.storybook/MockRelayEnvironment";

const variables = {};

const TestComponent = () => {
    const queryRef = loadQuery<UpdateInformationQuery>(
        useRelayEnvironment(),
        UpdateInformation,
        variables
    );

    return (
        <Suspense>
            <Administration queryRef={queryRef} />
        </Suspense>
    );
};

const CreateRelay = (): WithRelayParameters<UpdateInformationQuery> => ({
    query: UpdateInformation,
    mockResolvers: {
        Query: () => ({
            swarm: {
                currentNode: {
                    gateway: {
                        information: {
                            version: "6.11.1",
                            windowsHost: true
                        }
                    }
                },
                updateInformation: {
                    trackedRepositoryUrl: "https://github.com/tgstation/tgstation-server",
                    latestVersion: "420.69.9001"
                }
            }
        })
    },
    variables
});

const config: Meta<typeof TestComponent> = {
    component: TestComponent,
    title: "Routed/Administration"
};

export default config;

type Story = StoryObj<typeof config>;

export const Default: Story = {
    parameters: {
        relay: CreateRelay()
    }
};
