import { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor, within } from "@storybook/test";

import PasswordForm from "./PasswordForm";
const config: Meta<typeof PasswordForm> = {
    component: PasswordForm,
    title: "Routed/Login/Password Form",
    args: {
        onSubmit: fn()
    }
};

export default config;

type Story = StoryObj<typeof config>;

export const Default: Story = {
    play: async ({ args, canvasElement, step }) => {
        const canvas = within(canvasElement);

        const usernameField = canvas.getByTestId("login-username");
        const passwordField = canvas.getByTestId("login-password");
        const submitButton = canvas.getByTestId("login-submit");

        await step("No touch submit", async () => {
            await userEvent.click(submitButton);
            await waitFor(() => expect(args.onSubmit).not.toHaveBeenCalled());
        });

        await userEvent.clear(usernameField);
        await step("With colon user submit", async () => {
            await userEvent.type(usernameField, "test:username");
            await userEvent.click(submitButton);
            await waitFor(() => expect(args.onSubmit).not.toHaveBeenCalled());
        });

        await userEvent.clear(usernameField);
        await step("With user submit", async () => {
            await userEvent.type(usernameField, "test username");
            await userEvent.click(submitButton);
            await waitFor(() => expect(args.onSubmit).toHaveBeenCalledWith("test username", ""));
        });

        await userEvent.clear(usernameField);
        await step("With password only submit", async () => {
            await userEvent.type(passwordField, "some password");
            await userEvent.click(submitButton);
            await waitFor(() => expect(args.onSubmit).toBeCalledTimes(1));
        });

        await userEvent.clear(passwordField);
        await step("With full submit", async () => {
            await userEvent.type(usernameField, "test username");
            await userEvent.type(passwordField, "some password");
            await userEvent.click(submitButton);
            await waitFor(() => {
                expect(args.onSubmit).toBeCalledTimes(2);
                expect(args.onSubmit).toHaveBeenCalledWith("test username", "some password");
            });
        });
    }
};
