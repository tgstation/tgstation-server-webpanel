import { Meta, StoryObj } from "@storybook/react";
import { Suspense } from "react";
import { loadQuery, useRelayEnvironment } from "react-relay";

import Update from "./Update";
import UpdatePreflight from "./graphql/UpdatePreflight";
import { UpdatePreflightQuery } from "./graphql/__generated__/UpdatePreflightQuery.graphql";

import { WithRelayParameters } from "@/../.storybook/MockRelayEnvironment";

const variables = {};

const TestComponent = () => {
    const queryRef = loadQuery<UpdatePreflightQuery>(
        useRelayEnvironment(),
        UpdatePreflight,
        variables
    );

    return (
        <Suspense>
            <Update queryRef={queryRef} />
        </Suspense>
    );
};

const CreateRelay = (): WithRelayParameters<UpdatePreflightQuery> => ({
    query: UpdatePreflight,
    mockResolvers: {
        Query: () => ({
            swarm: {}
        })
    },
    variables
});

const config: Meta<typeof TestComponent> = {
    component: TestComponent,
    title: "Routed/Administration/Update"
};

export default config;

type Story = StoryObj<typeof config>;

export const Default: Story = {
    parameters: {
        relay: CreateRelay()
    }
};
