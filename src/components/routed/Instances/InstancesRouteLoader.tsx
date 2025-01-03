import { lazy } from "react";
import { Environment } from "react-relay";
import { RouteObject } from "react-router";

import { InstancesPermissionsFragment$key } from "./graphql/__generated__/InstancesPermissionsFragment.graphql";
import InstancesPermissions from "./graphql/InstancesPermissions";

import PermissionedRouteLoader from "@/components/core/Router/PermissionedRoute/PermissionedRouteLoader";
import devDelay from "@/lib/devDelay";

const Instances = lazy(
    async () => await devDelay(() => import("./Instances"), "Component Load: Instances")
);

const InstancesRouteLoader = <TRouteObject extends RouteObject>(
    relayEnvironment: Environment,
    partialRoute: TRouteObject,
    fragmentKey?: InstancesPermissionsFragment$key
) => {
    if (partialRoute.children) {
        throw new Error("AdministrationRouteLoader cannot have children");
    }

    return PermissionedRouteLoader<InstancesPermissionsFragment$key, TRouteObject>(
        relayEnvironment,
        {
            fragmentNode: InstancesPermissions,
            permissionEvaluator: user => {
                const instanceRights = user.effectivePermissionSet.instanceManagerRights;
                return instanceRights.canCreate || instanceRights.canList || instanceRights.canRead;
            },
            fragmentKey
        },
        {
            children: [
                {
                    path: "",
                    element: <Instances />
                }
            ],
            ...partialRoute
        }
    );
};

export default InstancesRouteLoader;
