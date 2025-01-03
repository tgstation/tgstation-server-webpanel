import { lazy } from "react";
import { Environment, PreloadedQuery, useFragment, usePreloadedQuery } from "react-relay";
import { KeyType } from "react-relay/relay-hooks/helpers";
import { Outlet, RouteObject } from "react-router";

import IRoutePermissionsChecker from "./IRoutePermissionsChecker";
import IPermissionedRouteInfo from "./PermissionedRouteInfo";
import IPermissionedRouteProps from "./PermissionedRouteProps";

import { RoutePermissionsQuery } from "@/components/graphql/__generated__/RoutePermissionsQuery.graphql";
import RoutePermissions from "@/components/graphql/RoutePermissions";
import devDelay from "@/lib/devDelay";
import RouteQueryLoader from "@/lib/RouteQueryLoader";

const PermissionedRoute = lazy(
    async () =>
        await devDelay(() => import("./PermissionedRoute"), "Component Load: PermissionedRoute")
);

interface IWrappedProps<TFragmentKey extends KeyType>
    extends Omit<IPermissionedRouteProps<TFragmentKey>, "fragmentKey"> {
    queryRef: PreloadedQuery<RoutePermissionsQuery>;
}

const WrapPermissionedRoute = <TFragmentKey extends KeyType>(
    props: IWrappedProps<TFragmentKey>
) => {
    const data = usePreloadedQuery<RoutePermissionsQuery>(RoutePermissions, props.queryRef);
    return (
        <PermissionedRoute
            {...props}
            fragmentKey={data.swarm.users.current as unknown as TFragmentKey}
        />
    );
};

const PermissionedRouteLoader = <TFragmentKey extends KeyType, TRouteObject extends RouteObject>(
    relayEnvironment: Environment,
    permissionedRouteInfo: IPermissionedRouteInfo<TFragmentKey>,
    partialRoute: TRouteObject
): TRouteObject & IRoutePermissionsChecker =>
    RouteQueryLoader<RoutePermissionsQuery, TRouteObject & IRoutePermissionsChecker>(
        relayEnvironment,
        RoutePermissions,
        () => ({}),
        {
            usePermissionsCheck: () => {
                if (!permissionedRouteInfo.fragmentKey) {
                    throw new Error(
                        "Expected IPermissionedRouteInfo<TFragmentKey>.fragmentKey to be set!"
                    );
                }

                const fragment = useFragment<TFragmentKey>(
                    permissionedRouteInfo.fragmentNode,
                    permissionedRouteInfo.fragmentKey
                );

                return permissionedRouteInfo.permissionEvaluator(fragment);
            },
            ...partialRoute
        },
        queryRef => (
            <WrapPermissionedRoute queryRef={queryRef} {...permissionedRouteInfo}>
                <Outlet />
            </WrapPermissionedRoute>
        )
    );

export default PermissionedRouteLoader;
