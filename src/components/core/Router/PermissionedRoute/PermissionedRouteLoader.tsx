import { lazy } from "react";
import { Environment, PreloadedQuery, useFragment, usePreloadedQuery } from "react-relay";
import { KeyType } from "react-relay/relay-hooks/helpers";
import { Outlet, RouteObject } from "react-router-dom";

import { PermissionSetQuery } from "./graphql/__generated__/PermissionSetQuery.graphql";
import PermissionSet from "./graphql/PermissionSet";
import IRoutePermissionsChecker from "./IRoutePermissionsChecker";
import IPermissionedRouteInfo from "./PermissionedRouteInfo";
import IPermissionedRouteProps from "./PermissionedRouteProps";

import devDelay from "@/lib/devDelay";
import RouteQueryLoader from "@/lib/RouteQueryLoader";

const PermissionedRoute = lazy(
    async () =>
        await devDelay(() => import("./PermissionedRoute"), "Component Load: PermissionedRoute")
);

interface IWrappedProps<TFragmentKey extends KeyType>
    extends Omit<IPermissionedRouteProps<TFragmentKey>, "fragmentKey"> {
    queryRef: PreloadedQuery<PermissionSetQuery>;
}

const WrapPermissionedRoute = <TFragmentKey extends KeyType>(
    props: IWrappedProps<TFragmentKey>
) => {
    const data = usePreloadedQuery<PermissionSetQuery>(PermissionSet, props.queryRef);
    return (
        <PermissionedRoute
            {...props}
            fragmentKey={data.swarm.users.current.effectivePermissionSet as TFragmentKey}
        />
    );
};

const PermissionedRouteLoader = <TFragmentKey extends KeyType, TRouteObject extends RouteObject>(
    relayEnvironment: Environment,
    permissionedRouteInfo: IPermissionedRouteInfo<TFragmentKey>,
    partialRoute: TRouteObject
): TRouteObject & IRoutePermissionsChecker =>
    RouteQueryLoader<PermissionSetQuery, TRouteObject & IRoutePermissionsChecker>(
        relayEnvironment,
        PermissionSet,
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
