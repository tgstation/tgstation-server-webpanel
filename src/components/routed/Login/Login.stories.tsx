import { Meta, StoryObj } from "@storybook/react";

import EnumDropdown from "./Login";
const config: Meta<typeof EnumDropdown> = {
    component: EnumDropdown,
    title: "Login"
};

export default config;

type Story = StoryObj<typeof config>;

export const Default: Story = {};
