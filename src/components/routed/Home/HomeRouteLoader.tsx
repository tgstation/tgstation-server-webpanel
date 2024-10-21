import { lazy } from "react";
import { Environment } from "react-relay";
import { RouteObject } from "react-router-dom";

import { HomeCardPermissionsQuery } from "./graphql/__generated__/HomeCardPermissionsQuery.graphql";
import HomeCardPermissions from "./graphql/HomeCardPermissions";

import useSession from "@/context/session/useSession";
import devDelay from "@/lib/devDelay";
import RouteQueryLoader from "@/lib/RouteQueryLoader";

const Home = lazy(async () => await devDelay(() => import("./Home"), "Component Load: Home"));

const HomeRouteLoader = (relayEnvironment: Environment, partialRoute: RouteObject): RouteObject => {
    const session = useSession();
    return RouteQueryLoader<HomeCardPermissionsQuery>(
        relayEnvironment,
        HomeCardPermissions,
        () => {
            if (!session.currentSession) {
                return null;
            }

            return {
                userID: session.currentSession.userID
            };
        },
        partialRoute,
        queryRef => <Home queryRef={queryRef} />
    );
};

export default HomeRouteLoader;
