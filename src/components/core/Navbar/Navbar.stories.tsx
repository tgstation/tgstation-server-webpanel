import { Meta, StoryObj } from "@storybook/react";

import Navbar from "./Navbar";

const config: Meta<typeof Navbar> = {
    component: Navbar,
    title: "Core/Navbar"
};

export default config;

type Story = StoryObj<typeof config>;

export const Default: Story = {};
