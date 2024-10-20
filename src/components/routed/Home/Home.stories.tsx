import { Meta, StoryObj } from "@storybook/react";

import Home from "./Home";

import SessionContext from "@/context/session/SessionContext";
import { DefaultUserPasswordCredentials, UserPasswordCredentials } from "@/lib/Credentials";

interface IArgs {
    defaultCredentials: boolean;
}

const TestComponent = (props: IArgs) => {
    const session = {
        currentSession: {
            bearer: "asdf",
            originalCredentials: props.defaultCredentials
                ? new DefaultUserPasswordCredentials()
                : new UserPasswordCredentials("asdf", "asdf")
        },
        setSession: () => {}
    };

    return (
        <SessionContext.Provider value={session}>
            <Home />
        </SessionContext.Provider>
    );
};

const config: Meta<typeof TestComponent> = {
    component: TestComponent,
    title: "Routed/Home"
};

export default config;

type Story = StoryObj<typeof config>;

export const Default: Story = {};

export const WithDefaultAdminPassword: Story = {
    args: {
        defaultCredentials: true
    }
};
