import { Meta, StoryObj } from "@storybook/react";

import ErrorBoundary from "./ErrorBoundary";

const FailComponent = () => {
    throw new Error("lol. lmao.");
};

interface IProps {
    locationKey?: string;
}

const TestComponent = (props: IProps) => {
    return (
        <ErrorBoundary locationKey={props.locationKey}>
            <FailComponent />
        </ErrorBoundary>
    );
};

const config: Meta<typeof TestComponent> = {
    component: TestComponent,
    title: "Utils/Error Boundary"
};

export default config;

type Story = StoryObj<typeof config>;
export const WithKey: Story = {
    args: {
        locationKey: "some_location_key"
    }
};

export const WithoutKey: Story = {};
