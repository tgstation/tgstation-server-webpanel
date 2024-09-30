import { Meta } from "@storybook/react";
import InputGroup from "./InputGroup";

const config: Meta<typeof InputGroup> = {
    component: InputGroup,
    title: "Input Group",
};

export default config;

export const Test = () => <InputGroup label="Test" />;
export const Loading = () => <InputGroup label="loading.loading" />;
export const Tooltip = () => (
    <InputGroup label="Test" tooltip="loading.loading" />
);
