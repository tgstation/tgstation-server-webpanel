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
import InstancesRouteLoader from "../Instances/InstancesRouteLoader";
import ServerInfoRouteLoader from "../ServerInfo/ServerInfoRouteLoader";
import ChangePasswordRouteLoader from "../Users/ChangePassword/ChangePasswordRouteLoader";
import UsersRouteLoader from "../Users/UsersRouteLoader";

import HomeCardProps from "./HomeCard/HomeCardProps";
import { HomeCardPermissionsQuery$data } from "./graphql/__generated__/HomeCardPermissionsQuery.graphql";

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

const HomeRoutes = (
    relayEnviroment: Environment,
    queryData?: HomeCardPermissionsQuery$data
): HomeRoute[] => {
    const currentUser = queryData?.swarm.users.current;

    return [
        InstancesRouteLoader(
            relayEnviroment,
            {
                path: "instances",
                icon: faHdd,
                localeNameId: "routes.instancelist"
            },
            currentUser
        ),
        UsersRouteLoader(
            relayEnviroment,
            {
                path: "users",
                icon: faUser,
                localeNameId: "routes.usermanager"
            },
            currentUser
        ),
        AdministrationRouteLoader(
            relayEnviroment,
            {
                path: "admin",
                icon: faTools,
                localeNameId: "routes.admin"
            },
            currentUser
        ),
        ChangePasswordRouteLoader(
            relayEnviroment,
            {
                path: "/users/passwd",
                icon: faKey,
                localeNameId: "routes.passwd"
            },
            currentUser
        ),
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
};

export default HomeRoutes;
