import { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor, within } from "@storybook/test";
import { loadQuery, useRelayEnvironment } from "react-relay";

import ChangePassword from "./ChangePassword";
import ChangePasswordPreflight from "./graphql/ChangePasswordPreflight";
import { ChangePasswordPreflightQuery } from "./graphql/__generated__/ChangePasswordPreflightQuery.graphql";

import { WithRelayParameters } from "@/../.storybook/MockRelayEnvironment";
import sleep from "@/lib/sleep";

const variables = {};

const testUsername = "Dominion";

interface IArgs {
    onSubmit: (password: string) => void;
}

const TestComponent = (args: IArgs) => {
    const queryRef = loadQuery<ChangePasswordPreflightQuery>(
        useRelayEnvironment(),
        ChangePasswordPreflight,
        variables
    );

    return <ChangePassword queryRef={queryRef} submitCallback={args.onSubmit} />;
};

const CreateRelay = (): WithRelayParameters<ChangePasswordPreflightQuery> => ({
    query: ChangePasswordPreflight,
    mockResolvers: {
        User: () => ({
            canonicalName: testUsername.toLocaleUpperCase()
        }),
        GatewayInformation: () => ({
            minimumPasswordLength: 4
        })
    },
    variables
});

const config: Meta<typeof TestComponent> = {
    component: TestComponent,
    title: "Routed/User/Change Password",
    args: {
        onSubmit: fn()
    }
};

export default config;

type Story = StoryObj<typeof config>;

export const Default: Story = {
    parameters: {
        relay: CreateRelay()
    }
};

export const Play: Story = {
    parameters: {
        relay: CreateRelay()
    },
    play: async ({ args, canvasElement, step }) => {
        const canvas = within(canvasElement);

        let passwordField = canvas.getByTestId("changePassword-password");
        let confirmField = canvas.getByTestId("changePassword-passwordConfirm");
        let submitButton = canvas.getByTestId("changePassword-submit");

        const refocus = async () => {
            await sleep(100);
            passwordField = canvas.getByTestId("changePassword-password");
            confirmField = canvas.getByTestId("changePassword-passwordConfirm");
            submitButton = canvas.getByTestId("changePassword-submit");
            await userEvent.clear(passwordField);
            await userEvent.clear(confirmField);
        };

        await step("No touch submit", async () => {
            await userEvent.click(submitButton);
            await waitFor(() => expect(args.onSubmit).not.toHaveBeenCalled());
        });

        await step("Short submit", async () => {
            await userEvent.type(passwordField, "asd");
            await userEvent.type(confirmField, "asd");
            await userEvent.click(submitButton);
            await waitFor(() => expect(args.onSubmit).not.toHaveBeenCalled());
        });

        await refocus();
        await step("With user submit", async () => {
            await userEvent.type(passwordField, testUsername);
            await userEvent.type(passwordField, testUsername);
            await userEvent.click(submitButton);
            await waitFor(() => expect(args.onSubmit).not.toHaveBeenCalled());
        });

        await refocus();
        await step("With password only submit", async () => {
            await userEvent.type(passwordField, "some password");
            await userEvent.click(submitButton);
            await waitFor(() => expect(args.onSubmit).not.toHaveBeenCalled());
        });

        await refocus();
        await step("With full submit", async () => {
            await userEvent.type(passwordField, "some password");
            await userEvent.type(confirmField, "some password");
            await userEvent.click(submitButton);
            await waitFor(() => expect(args.onSubmit).toHaveBeenCalledWith("some password"));
        });
    }
};
