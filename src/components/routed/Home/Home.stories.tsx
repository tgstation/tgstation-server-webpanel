import { Meta, StoryObj } from "@storybook/react";
import { Suspense } from "react";
import { loadQuery, useRelayEnvironment } from "react-relay";

import { HomeCardPermissionsQuery } from "./graphql/__generated__/HomeCardPermissionsQuery.graphql";
import HomeCardPermissions from "./graphql/HomeCardPermissions";
import Home from "./Home";

import { WithRelayParameters } from "@/../.storybook/MockRelayEnvironment";
import SessionContext from "@/context/session/SessionContext";
import { UserPasswordCredentials } from "@/lib/Credentials";

interface IArgs {
    defaultCredentials: boolean;
}

const variables = {
    userID: "fdsa"
};

const TestComponent = (props: IArgs) => {
    const queryRef = loadQuery<HomeCardPermissionsQuery>(
        useRelayEnvironment(),
        HomeCardPermissions,
        variables
    );

    return (
        <SessionContext.Provider
            value={{
                currentSession: {
                    bearer: "asdf",
                    userID: "fdsa",
                    originalCredentials: new UserPasswordCredentials(
                        "asdf",
                        "asdf",
                        props.defaultCredentials
                    )
                },
                setSession: () => {}
            }}>
            <Suspense>
                <Home queryRef={queryRef} />
            </Suspense>
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
    },
    variables
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
