import { Meta, StoryObj } from "@storybook/react";
import { userEvent, waitFor, within, expect, fn } from "@storybook/test";
import EnumDropdown from "./EnumDropdown";
const config: Meta<typeof EnumDropdown> = {
    component: EnumDropdown,
    title: "Enum Dropdown",
    args: {
        onChange: fn(),
    },
};

enum TestEnum {
    A = "perms.group.warning",
    B = "perms.group.create",
}

export default config;

type Story = StoryObj<typeof config>;

export const Default: Story = {
    args: {
        enum: TestEnum,
        value: TestEnum.A,
    },
    play: async ({ args, canvasElement, step }) => {
        const canvas = within(canvasElement);

        await step("Open Dropdown", async () => {
            await userEvent.click(canvas.getByTestId("dropdown-button"));
        });

        await step("Select Create Item", async () => {
            const content = within(canvasElement.parentElement!);
            await new Promise((resolve) => setTimeout(resolve, 100));
            await userEvent.click(content.getByTestId("dropdown-item-B"));
        });

        await waitFor(() => expect(args.onChange).toBeCalledWith(TestEnum.B));
        await new Promise((resolve) => setTimeout(resolve, 100));

        await step("Open Dropdown", async () => {
            await userEvent.click(canvas.getByTestId("dropdown-button"));
        });

        await new Promise((resolve) => setTimeout(resolve, 100));

        await step("Select Warning Item", async () => {
            const content = within(canvasElement.parentElement!);
            await new Promise((resolve) => setTimeout(resolve, 100));
            await userEvent.click(content.getByTestId("dropdown-item-A"));
        });

        await waitFor(() => expect(args.onChange).toBeCalledWith(TestEnum.A));
    },
};
export const NoIntl = () => (
    <EnumDropdown enum={TestEnum} noIntl value={TestEnum.A} />
);
