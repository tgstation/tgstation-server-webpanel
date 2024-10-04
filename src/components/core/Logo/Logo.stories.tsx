import { Meta } from "@storybook/react";

import Logo from "./Logo";

const config: Meta<typeof Logo> = {
    component: Logo,
    title: "Bottom Right Logo"
};

export default config;

export const Default = () => <Logo />;
