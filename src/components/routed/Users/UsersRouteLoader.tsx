import { lazy } from "react";
import { Environment } from "react-relay";
import { RouteObject } from "react-router";

import { UsersPermissionsFragment$key } from "./graphql/__generated__/UsersPermissionsFragment.graphql";
import UsersPermissions from "./graphql/UsersPermissions";

import PermissionedRouteLoader from "@/components/core/Router/PermissionedRoute/PermissionedRouteLoader";
import devDelay from "@/lib/devDelay";

const Users = lazy(async () => await devDelay(() => import("./Users"), "Component Load: Users"));

const UsersRouteLoader = <TRouteObject extends RouteObject>(
    relayEnvironment: Environment,
    partialRoute: TRouteObject,
    fragmentKey?: UsersPermissionsFragment$key
) => {
    if (partialRoute.children) {
        throw new Error("AdministrationRouteLoader cannot have children");
    }

    return PermissionedRouteLoader<UsersPermissionsFragment$key, TRouteObject>(
        relayEnvironment,
        {
            fragmentNode: UsersPermissions,
            permissionEvaluator: user => {
                const adminRights = user.effectivePermissionSet.administrationRights;
                return adminRights.canReadUsers || adminRights.canWriteUsers;
            },
            fragmentKey
        },
        {
            children: [
                {
                    path: "",
                    element: <Users />
                }
            ],
            ...partialRoute
        }
    );
};

export default UsersRouteLoader;
