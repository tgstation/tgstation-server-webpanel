import { lazy } from "react";
import { Environment } from "react-relay";
import { RouteObject } from "react-router-dom";

import { ChangePasswordPermissionsFragment$key } from "./graphql/__generated__/ChangePasswordPermissionsFragment.graphql";
import { ChangePasswordPreflightQuery } from "./graphql/__generated__/ChangePasswordPreflightQuery.graphql";
import ChangePasswordPermissions from "./graphql/ChangePasswordPermissions";
import ChangePasswordPreflight from "./graphql/ChangePasswordPreflight";

import PermissionedRouteLoader from "@/components/core/Router/PermissionedRoute/PermissionedRouteLoader";
import devDelay from "@/lib/devDelay";
import RouteQueryLoader from "@/lib/RouteQueryLoader";

const ChangePassword = lazy(
    async () => await devDelay(() => import("./ChangePassword"), "Component Load: Change Password")
);

const ChangePasswordRouteLoader = <TRouteObject extends RouteObject>(
    relayEnvironment: Environment,
    partialRoute: TRouteObject,
    fragmentKey?: ChangePasswordPermissionsFragment$key
) => {
    if (partialRoute.children) {
        throw new Error("AdministrationRouteLoader cannot have children");
    }

    return PermissionedRouteLoader(
        relayEnvironment,
        {
            fragmentNode: ChangePasswordPermissions,
            permissionEvaluator: user =>
                !user.systemIdentifier &&
                user.effectivePermissionSet.administrationRights.canEditOwnPassword,
            fragmentKey
        },
        {
            children: [
                RouteQueryLoader<ChangePasswordPreflightQuery>(
                    relayEnvironment,
                    ChangePasswordPreflight,
                    () => ({}),
                    {
                        path: ""
                    },
                    queryRef => <ChangePassword queryRef={queryRef} />
                )
            ],
            ...partialRoute
        }
    );
};

export default ChangePasswordRouteLoader;
