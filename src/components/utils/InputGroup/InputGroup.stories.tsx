import { Meta } from "@storybook/react";
import InputGroup from "./InputGroup";

const config: Meta<typeof InputGroup> = {
    component: InputGroup,
    title: "Input Group",
};

export default config;

export const Test = () => (
    <div className="grid grid-cols-2">
        <InputGroup label="Test" />
    </div>
);
export const Loading = () => (
    <div className="grid grid-cols-2">
        <InputGroup label="loading.loading" />
    </div>
);
export const Tooltip = () => (
    <div className="grid grid-cols-2">
        <InputGroup label="Test" tooltip="loading.loading" />
    </div>
);
