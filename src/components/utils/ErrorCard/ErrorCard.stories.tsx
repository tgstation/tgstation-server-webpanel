import { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor, within } from "@storybook/test";

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
export const WithoutStackAndClose: Story = {
    args: {
        error: new Error("Deez nuts"),
        onClose: fn()
    },
    play: async ({ args, canvasElement, step }) => {
        const canvas = within(canvasElement);

        await step("Close card", async () => {
            await userEvent.click(canvas.getByTestId("errorcard-close"));
        });

        await waitFor(() => expect(args.onClose).toBeCalled());
    }
};
export const WithStackAndClose: Story = {
    args: {
        error: new Error("Deez nuts"),
        errorInfo: {
            componentStack: "\nThis is a stack trace\nWhat do you expect?"
        },
        onClose: fn()
    },
    play: async ({ args, canvasElement, step }) => {
        const canvas = within(canvasElement);

        await step("Close card", async () => {
            await userEvent.click(canvas.getByTestId("errorcard-close"));
        });

        await waitFor(() => expect(args.onClose).toBeCalled());
    }
};
export const TgsErrorWithAdditionalData: Story = {
    name: "TGS Error With Additional Data",
    args: {
        error: {
            errorCode: "USER_NAME_CHANGE",
            additionalData: "some AdditionalData",
            message: "TGS fuckery",
            " $fragmentType": "ErrorMessageSingleFragment"
        }
    }
};
export const TgsError: Story = {
    name: "TGS Error",
    args: {
        error: {
            errorCode: "USER_NAME_CHANGE",
            message: "TGS fuckery",
            additionalData: null,
            " $fragmentType": "ErrorMessageSingleFragment"
        }
    }
};
