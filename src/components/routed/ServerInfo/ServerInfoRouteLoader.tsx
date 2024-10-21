import { lazy } from "react";
import { Environment } from "react-relay";
import { RouteObject } from "react-router-dom";

import { ServerInformationQuery } from "./graphql/__generated__/ServerInformationQuery.graphql";
import ServerInformation from "./graphql/ServerInformation";

import devDelay from "@/lib/devDelay";
import RouteQueryLoader from "@/lib/RouteQueryLoader";

const ServerInfo = lazy(
    async () => await devDelay(() => import("./ServerInfo"), "Component Load: ServerInfo")
);

const ServerInfoRouteLoader = <TRouteObject extends RouteObject>(
    relayEnvironment: Environment,
    partialRoute: TRouteObject
): TRouteObject =>
    RouteQueryLoader<ServerInformationQuery, TRouteObject>(
        relayEnvironment,
        ServerInformation,
        () => ({}),
        partialRoute,
        queryRef => <ServerInfo queryRef={queryRef} />
    );

export default ServerInfoRouteLoader;
