import { Meta, StoryObj } from "@storybook/react";

import NotFound from "./NotFound";
const config: Meta<typeof NotFound> = {
    component: NotFound,
    title: "Core/Not Found"
};

export default config;

type Story = StoryObj<typeof config>;

export const Default: Story = {};
