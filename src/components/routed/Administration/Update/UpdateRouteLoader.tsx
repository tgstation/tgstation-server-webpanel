import { lazy } from "react";
import { Environment } from "react-relay";
import { RouteObject } from "react-router-dom";

import { UpdatePermissionsFragment$key } from "./graphql/__generated__/UpdatePermissionsFragment.graphql";
import { UpdatePreflightQuery } from "./graphql/__generated__/UpdatePreflightQuery.graphql";
import UpdatePermissions from "./graphql/UpdatePermissions";
import UpdatePreflight from "./graphql/UpdatePreflight";

import PermissionedRouteLoader from "@/components/core/Router/PermissionedRoute/PermissionedRouteLoader";
import devDelay from "@/lib/devDelay";
import RouteQueryLoader from "@/lib/RouteQueryLoader";

const Update = lazy(async () => await devDelay(() => import("./Update"), "Component Load: Update"));

const UpdateRouteLoader = <TRouteObject extends RouteObject>(
    relayEnvironment: Environment,
    partialRoute: TRouteObject,
    fragmentKey?: UpdatePermissionsFragment$key
) => {
    if (partialRoute.children) {
        throw new Error("UpdateRouteLoader cannot have children");
    }

    return PermissionedRouteLoader<UpdatePermissionsFragment$key, TRouteObject>(
        relayEnvironment,
        {
            fragmentNode: UpdatePermissions,
            permissionEvaluator: user => {
                const adminRights = user.effectivePermissionSet.administrationRights;
                return adminRights.canChangeVersion || adminRights.canUploadVersion;
            },
            fragmentKey
        },
        {
            children: [
                RouteQueryLoader<UpdatePreflightQuery>(
                    relayEnvironment,
                    UpdatePreflight,
                    () => ({}),
                    {
                        path: ""
                    },
                    queryRef => <Update queryRef={queryRef} />
                )
            ],
            ...partialRoute
        }
    );
};

export default UpdateRouteLoader;
