import { Meta, StoryObj } from "@storybook/react";

import OAuthOptions from "./OAuthOptions";
const config: Meta<typeof OAuthOptions> = {
    component: OAuthOptions,
    title: "Routed/Login/OAuth Options"
};

export default config;

type Story = StoryObj<typeof config>;

export const Default: Story = {
    parameters: {}
};
