import { Meta } from "@storybook/react";

import InputGroup from "./InputGroup";

import { Input } from "@/components/ui/input";

const config: Meta<typeof InputGroup> = {
    component: InputGroup,
    title: "Utils/Input Group"
};

export default config;

export const TextBoxTest = () => (
    <div className="grid grid-cols-2">
        <InputGroup label="Test">
            <Input />
        </InputGroup>
    </div>
);
export const TextBoxLoading = () => (
    <div className="grid grid-cols-2">
        <InputGroup label="loading.loading">
            <Input />
        </InputGroup>
    </div>
);
export const TextBox = () => (
    <div className="grid grid-cols-2">
        <InputGroup label="Test" tooltip="loading.loading">
            <Input />
        </InputGroup>
    </div>
);
