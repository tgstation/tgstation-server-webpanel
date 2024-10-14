import { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, waitFor, within } from "@storybook/test";
import { useContext, useEffect } from "react";

import ErrorViewer from "./ErrorViewer";

import { ErrorMessageSingleFragment$data } from "@/components/graphql/__generated__/ErrorMessageSingleFragment.graphql";
import ErrorsContext from "@/context/errors/Context";
import ErrorsProvider from "@/context/errors/Provider";
import sleep from "@/lib/sleep";

interface IArgs {
    errors?: (ErrorMessageSingleFragment$data | Error)[];
}

const InnerTestComponent = (props: IArgs) => {
    const context = useContext(ErrorsContext);

    useEffect(() => {
        context.addErrors(props.errors ?? []);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <ErrorViewer />;
};

const TestComponent = (props: IArgs) => {
    return (
        <ErrorsProvider>
            <InnerTestComponent {...props} />
        </ErrorsProvider>
    );
};

const config: Meta<typeof TestComponent> = {
    component: TestComponent,
    title: "Core/Error Viewer"
};

export default config;

type Story = StoryObj<typeof config>;

export const Empty: Story = {};

export const OneErrorClosePlay: Story = {
    name: "One Error (Closes on Play)",
    args: {
        errors: [
            {
                errorCode: "API_INVALID_PAGE_OR_PAGE_SIZE",
                message: "Test Error Message 1",
                additionalData: null,
                " $fragmentType": "ErrorMessageSingleFragment"
            }
        ]
    },
    play: async ({ canvasElement, step }) => {
        const canvas = within(canvasElement);

        await sleep(100);

        await step("Close card", async () => {
            await userEvent.click(canvas.getByTestId("errorcard-close"));
        });

        await waitFor(() => expect(canvas.queryByTestId("errorcard-close")).toBeNull());
    }
};

export const ThreeErrors: Story = {
    args: {
        errors: [
            {
                errorCode: "API_INVALID_PAGE_OR_PAGE_SIZE",
                message: "Test Error Message 1",
                additionalData: null,
                " $fragmentType": "ErrorMessageSingleFragment"
            },
            {
                errorCode: "BAD_HEADERS",
                message: "Test Error Message 2",
                additionalData: "Some additional data",
                " $fragmentType": "ErrorMessageSingleFragment"
            },
            new Error("DEEZ NUTZ")
        ]
    }
};
