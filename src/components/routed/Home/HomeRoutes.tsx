import {
    faCogs,
    faHdd,
    faInfoCircle,
    faKey,
    faTools,
    faUser
} from "@fortawesome/free-solid-svg-icons";
import { lazy } from "react";
import { Environment } from "react-relay";
import { RouteObject } from "react-router-dom";

import AdministrationRouteLoader from "../Administration/AdministrationRouteLoader";
import ServerInfoRouteLoader from "../ServerInfo/ServerInfoRouteLoader";

import HomeCardProps from "./HomeCard/HomeCardProps";

import NotFound from "@/components/core/NotFound/NotFound";
import devDelay from "@/lib/devDelay";

const Configuration = lazy(
    async () =>
        await devDelay(
            () => import("@/components/routed/Configuration/Configuration"),
            "Component Load: Configuration"
        )
);

interface IHomeRouteProtected {
    unprotected?: boolean;
}

type HomeRoute = RouteObject & IHomeRouteProtected & Omit<HomeCardProps, "queryData">;

const HomeRoutes = (relayEnviroment: Environment): HomeRoute[] => [
    {
        path: "instances",
        icon: faHdd,
        localeNameId: "routes.instancelist",
        calculateEnabled: data =>
            data.node?.effectivePermissionSet?.instanceManagerRights.canList ||
            data.node?.effectivePermissionSet?.instanceManagerRights.canRead,
        element: <NotFound />
    },
    {
        path: "users",
        icon: faUser,
        localeNameId: "routes.usermanager",
        calculateEnabled: data =>
            data.node?.effectivePermissionSet?.administrationRights.canReadUsers ||
            data.node?.effectivePermissionSet?.administrationRights.canWriteUsers,
        element: <NotFound />
    },
    AdministrationRouteLoader(relayEnviroment, {
        path: "admin",
        icon: faTools,
        localeNameId: "routes.admin",
        calculateEnabled: data =>
            data.node?.effectivePermissionSet?.administrationRights.canChangeVersion ||
            data.node?.effectivePermissionSet?.administrationRights.canDownloadLogs ||
            data.node?.effectivePermissionSet?.administrationRights.canUploadVersion
    }),
    {
        path: "/users/passwd",
        icon: faKey,
        localeNameId: "routes.passwd",
        calculateEnabled: data =>
            data.node?.effectivePermissionSet?.administrationRights.canEditOwnPassword,
        element: <NotFound />
    },
    {
        path: "/config",
        icon: faCogs,
        localeNameId: "routes.config",
        element: <Configuration />,
        unprotected: true
    },
    ServerInfoRouteLoader(relayEnviroment, {
        path: "/info",
        icon: faInfoCircle,
        localeNameId: "routes.info"
    })
];

export default HomeRoutes;
