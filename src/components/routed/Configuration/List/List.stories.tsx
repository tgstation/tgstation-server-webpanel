import { Meta } from "@storybook/react";

import List from "./List";

const config: Meta<typeof List> = {
    component: List,
    title: "Routed/Configuration/List"
};

export default config;

export const Default = () => <List />;
