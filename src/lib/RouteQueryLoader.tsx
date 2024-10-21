import { ReactNode } from "react";
import { Environment, loadQuery, PreloadedQuery } from "react-relay";
import { LoaderFunctionArgs, RouteObject, useLoaderData } from "react-router-dom";
import { GraphQLTaggedNode, OperationType, VariablesOf } from "relay-runtime";

import { useOnMountUnsafe } from "./useOnMountUnsafe";

interface ILoaderData<TQuery extends OperationType> {
    queryRef: PreloadedQuery<TQuery> | null;
}

interface IProps<TQuery extends OperationType> {
    elementFunc: (queryRef: PreloadedQuery<TQuery> | null) => ReactNode;
}

const WrapQueryDisposal = <TQuery extends OperationType>(props: IProps<TQuery>) => {
    const loaderData = useLoaderData() as ILoaderData<TQuery>;
    const queryRef = loaderData.queryRef;
    const disposeFn = queryRef?.dispose;

    useOnMountUnsafe(() => {
        if (!disposeFn) {
            return () => {};
        }
        return () => {
            console.log("Disposing query");
            disposeFn();
        };
    }, [disposeFn]);

    return props.elementFunc(queryRef);
};

const RouteQueryLoader = <TQuery extends OperationType>(
    relayEnvironment: Environment,
    query: GraphQLTaggedNode,
    variablesProvider: (args: LoaderFunctionArgs) => VariablesOf<TQuery> | null,
    partialRoute: RouteObject,
    elementFunc: (queryRef: PreloadedQuery<TQuery> | null) => ReactNode
): RouteObject => {
    if (partialRoute.element) {
        throw new Error("Route element should not be set!");
    }
    if (partialRoute.loader) {
        throw new Error("Route loader should not be set!");
    }
    if (partialRoute.shouldRevalidate) {
        throw new Error("Route loader should not be set!");
    }

    partialRoute.element = <WrapQueryDisposal elementFunc={elementFunc} />;
    partialRoute.loader = args => {
        const variables = variablesProvider(args);
        let loaderData: ILoaderData<TQuery>;
        if (variables) {
            console.log("loading query");
            loaderData = {
                queryRef: loadQuery<TQuery>(relayEnvironment, query, variables)
            };
        } else {
            loaderData = {
                queryRef: null
            };
        }
        return loaderData;
    };
    partialRoute.shouldRevalidate = () => false;
    return partialRoute;
};

export default RouteQueryLoader;
