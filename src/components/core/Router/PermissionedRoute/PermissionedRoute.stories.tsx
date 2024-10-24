import { Meta, StoryObj } from "@storybook/react";
import { useLazyLoadQuery } from "react-relay";

import { PermissionSetQuery } from "./graphql/__generated__/PermissionSetQuery.graphql";
import PermissionSet from "./graphql/PermissionSet";
import PermissionedRoute from "./PermissionedRoute";

import { WithRelayParameters } from "@/../.storybook/MockRelayEnvironment";
import { AdministrationPermissionsFragment$key } from "@/components/routed/Administration/graphql/__generated__/AdministrationPermissionsFragment.graphql";
import AdministrationPermissions from "@/components/routed/Administration/graphql/AdministrationPermissions";

const variables = {};

const TestComponent = () => {
    const data = useLazyLoadQuery<PermissionSetQuery>(PermissionSet, variables);

    return (
        <PermissionedRoute
            fragmentNode={AdministrationPermissions}
            fragmentKey={
                data.swarm.users.current
                    .effectivePermissionSet as AdministrationPermissionsFragment$key
            }
            permissionEvaluator={permissions => permissions.administrationRights.canChangeVersion}>
            <div></div>
        </PermissionedRoute>
    );
};

const CreateRelay = (fieldsEnabled: boolean): WithRelayParameters<PermissionSetQuery> => ({
    query: PermissionSet,
    mockResolvers: {
        AdministrationRightsFlags: () => ({
            canChangeVersion: fieldsEnabled,
            canDownloadLogs: fieldsEnabled,
            canEditOwnOAuthConnections: fieldsEnabled,
            canEditOwnPassword: fieldsEnabled,
            canReadUsers: fieldsEnabled,
            canRestartHost: fieldsEnabled,
            canUploadVersion: fieldsEnabled,
            canWriteUsers: fieldsEnabled
        })
    },
    variables
});

const config: Meta<typeof TestComponent> = {
    component: TestComponent,
    title: "Core/Router/Permissioned Route"
};

export default config;

type Story = StoryObj<typeof config>;
export const Default: Story = {
    parameters: {
        relay: CreateRelay(true)
    }
};

export const MissingPermissions: Story = {
    parameters: {
        relay: CreateRelay(false)
    }
};
