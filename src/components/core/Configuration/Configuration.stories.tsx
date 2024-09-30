import { Meta } from "@storybook/react";
import Configuration from "./Configuration";

const config: Meta<typeof Configuration> = {
    component: Configuration,
    title: "Configuration",
};

export default config;

export const Default = () => <Configuration />;
