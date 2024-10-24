import { lazy } from "react";
import { Environment } from "react-relay";
import { RouteObject } from "react-router-dom";

import { AdministrationPermissionsFragment$key } from "./graphql/__generated__/AdministrationPermissionsFragment.graphql";
import { UpdateInformationQuery } from "./graphql/__generated__/UpdateInformationQuery.graphql";
import AdministrationPermissions from "./graphql/AdministrationPermissions";
import UpdateInformation from "./graphql/UpdateInformation";

import PermissionedRouteLoader from "@/components/core/Router/PermissionedRoute/PermissionedRouteLoader";
import devDelay from "@/lib/devDelay";
import RouteQueryLoader from "@/lib/RouteQueryLoader";

const Administration = lazy(
    async () => await devDelay(() => import("./Administration"), "Component Load: Administration")
);

const AdministrationRouteLoader = <TRouteObject extends RouteObject>(
    relayEnvironment: Environment,
    partialRoute: TRouteObject
): TRouteObject => {
    if (partialRoute.children) {
        throw new Error("AdministrationRouteLoader cannot have children");
    }

    return PermissionedRouteLoader<AdministrationPermissionsFragment$key, TRouteObject>(
        relayEnvironment,
        {
            fragmentNode: AdministrationPermissions,
            permissionEvaluator: permissions => {
                const adminRights = permissions.administrationRights;
                return (
                    adminRights.canChangeVersion ||
                    adminRights.canDownloadLogs ||
                    adminRights.canRestartHost ||
                    adminRights.canUploadVersion
                );
            }
        },
        {
            children: [
                RouteQueryLoader<UpdateInformationQuery>(
                    relayEnvironment,
                    UpdateInformation,
                    () => {
                        return {};
                    },
                    {
                        path: ""
                    },
                    queryRef => <Administration queryRef={queryRef} />
                )
            ],
            ...partialRoute
        }
    );
};

export default AdministrationRouteLoader;
