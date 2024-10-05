import { Meta } from "@storybook/react";

import Logo from "./Logo";

const config: Meta<typeof Logo> = {
    component: Logo,
    title: "Core/Logo"
};

export default config;

export const Default = () => <Logo />;
