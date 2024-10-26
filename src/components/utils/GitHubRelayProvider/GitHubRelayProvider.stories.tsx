import { Meta, StoryObj } from "@storybook/react";

import GitHubRelayProvider from "./GitHubRelayProvider";

const TestComponent = () => {
    return (
        <GitHubRelayProvider>
            <div></div>
        </GitHubRelayProvider>
    );
};

const config: Meta<typeof TestComponent> = {
    component: TestComponent,
    title: "Utils/GitHub Relay Provider"
};

export default config;

type Story = StoryObj<typeof config>;
export const MissingTokenCard: Story = {};
