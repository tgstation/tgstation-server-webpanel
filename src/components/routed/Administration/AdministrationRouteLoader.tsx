import { lazy } from "react";
import { Environment } from "react-relay";
import { RouteObject } from "react-router-dom";

import { UpdateInformationQuery } from "./graphql/__generated__/UpdateInformationQuery.graphql";
import UpdateInformation from "./graphql/UpdateInformation";

import devDelay from "@/lib/devDelay";
import RouteQueryLoader from "@/lib/RouteQueryLoader";

const Administration = lazy(
    async () => await devDelay(() => import("./Administration"), "Component Load: Administration")
);

const AdministrationRouteLoader = <TRouteObject extends RouteObject>(
    relayEnvironment: Environment,
    partialRoute: TRouteObject
): TRouteObject =>
    RouteQueryLoader<UpdateInformationQuery, TRouteObject>(
        relayEnvironment,
        UpdateInformation,
        () => {
            return {};
        },
        partialRoute,
        queryRef => <Administration queryRef={queryRef} />
    );

export default AdministrationRouteLoader;
