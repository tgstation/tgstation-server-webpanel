import { Meta, StoryObj } from "@storybook/react";

import ErrorCard from "./ErrorCard";

const config: Meta<typeof ErrorCard> = {
    component: ErrorCard,
    title: "Utils/Error Card"
};

export default config;

type Story = StoryObj<typeof config>;
export const WithoutStack: Story = {
    args: {
        error: new Error("Deez nuts")
    }
};
export const WithStack: Story = {
    args: {
        error: new Error("Deez nuts"),
        errorInfo: {
            componentStack: "\nThis is a stack trace\nWhat do you expect?"
        }
    }
};
