import { Meta, StoryObj } from "@storybook/react";

import { HomeCardPermissionsQuery } from "./graphql/__generated__/HomeCardPermissionsQuery.graphql";
import HomeCardPermissions from "./graphql/HomeCardPermissions";
import Home from "./Home";

import { WithRelayParameters } from "@/../.storybook/MockRelayEnvironment";
import SessionContext from "@/context/session/SessionContext";
import { DefaultUserPasswordCredentials, UserPasswordCredentials } from "@/lib/Credentials";

interface IArgs {
    defaultCredentials: boolean;
}

const TestComponent = (props: IArgs) => {
    const session = {
        currentSession: {
            bearer: "asdf",
            userId: "fdsa",
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

const CreateRelay = (fieldsEnabled: boolean): WithRelayParameters<HomeCardPermissionsQuery> => ({
    query: HomeCardPermissions,
    mockResolvers: {
        PermissionSet: () => ({
            administrationRights: {
                canChangeVersion: fieldsEnabled,
                canDownloadLogs: fieldsEnabled,
                canEditOwnPassword: fieldsEnabled,
                canReadUsers: fieldsEnabled,
                canUploadVersion: fieldsEnabled,
                canWriteUsers: fieldsEnabled
            },
            instanceManagerRights: {
                canList: fieldsEnabled,
                canRead: fieldsEnabled
            }
        })
    }
});

const config: Meta<typeof TestComponent> = {
    component: TestComponent,
    title: "Routed/Home"
};

export default config;

type Story = StoryObj<typeof config>;

export const Default: Story = {
    parameters: {
        relay: CreateRelay(true)
    }
};

export const DisabledPerms: Story = {
    parameters: {
        relay: CreateRelay(false)
    }
};

export const WithDefaultAdminPassword: Story = {
    args: {
        defaultCredentials: true
    },
    parameters: {
        relay: CreateRelay(true)
    }
};
