import { Meta, StoryObj } from "@storybook/react";

import Login from "./Login";
const config: Meta<typeof Login> = {
    component: Login,
    title: "Routed/Login"
};

export default config;

type Story = StoryObj<typeof config>;

export const Default: Story = {};
