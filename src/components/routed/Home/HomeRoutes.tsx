import {
    faCogs,
    faHdd,
    faInfoCircle,
    faKey,
    faTools,
    faUser
} from "@fortawesome/free-solid-svg-icons";
import { lazy } from "react";
import { RouteObject } from "react-router-dom";

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

const HomeRoutes: HomeRoute[] = [
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
    {
        path: "admin",
        icon: faTools,
        localeNameId: "routes.admin",
        calculateEnabled: data =>
            data.node?.effectivePermissionSet?.administrationRights.canChangeVersion ||
            data.node?.effectivePermissionSet?.administrationRights.canDownloadLogs ||
            data.node?.effectivePermissionSet?.administrationRights.canUploadVersion,
        element: <NotFound />
    },
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
    {
        path: "/info",
        icon: faInfoCircle,
        localeNameId: "routes.info",
        element: <NotFound />
    }
];

export default HomeRoutes;
