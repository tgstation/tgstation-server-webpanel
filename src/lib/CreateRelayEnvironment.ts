import { ExecutionResult } from "graphql";
import { createClient, Sink } from "graphql-sse";
import {
    Environment,
    FetchFunction,
    GraphQLResponse,
    Network,
    Observable,
    RecordSource,
    Store,
    SubscribeFunction
} from "relay-runtime";
import {
    PayloadData,
    PayloadError,
    PayloadExtensions
} from "relay-runtime/lib/network/RelayNetworkTypes";

import Pkg from "@/../package.json";

const CreateRelayEnvironment = (
    serverUrl: string
): {
    relayEnviroment: Environment;
    setAuthorizationHeader: (headerValue: string | null, temporary: boolean) => void;
} => {
    const graphQLEndpoint = `${serverUrl}/api/graphql`;

    let currentAuthHeader: string | null = null;
    let temporaryAuthHeader: string | null = null;
    const createAuthHeader = () => {
        const header = temporaryAuthHeader ?? currentAuthHeader;
        temporaryAuthHeader = null;
        return header ?? "";
    };

    const fetchFn: FetchFunction = async (request, variables) => {
        const resp = await fetch(graphQLEndpoint, {
            method: "POST",
            headers: {
                Accept: "application/graphql-response+json; charset=utf-8, application/json; charset=utf-8",
                "Content-Type": "application/json",
                Api: `Tgstation.Server.Api/${Pkg.tgs_graphql_api_version}`,
                Authorization: createAuthHeader()
            },
            body: JSON.stringify({
                query: request.text, // <-- The GraphQL document composed by Relay
                variables
            })
        });

        const result = await resp.json();

        if (import.meta.env.VITE_RELAY_DELAY_SECONDS) {
            await new Promise<void>(resolve => {
                setTimeout(() => resolve(), import.meta.env.VITE_RELAY_DELAY_SECONDS * 1000);
            });
        }

        return result;
    };

    // We only want to setup subscriptions if we are on the client.
    const subscriptionsClient = createClient({
        url: graphQLEndpoint,
        headers: (): Record<string, string> => {
            return {
                Api: `Tgstation.Server.Api/${Pkg.tgs_graphql_api_version}`,
                Authorization: createAuthHeader()
            };
        }
    });

    const subscribeFn: SubscribeFunction = (operation, variables) => {
        const gqlSseRelaySinkAdapter = <Data, Extensions>(
            relaySink: Sink<GraphQLResponse>
        ): Sink<ExecutionResult<Data, Extensions>> => {
            return {
                error: (error: unknown) => relaySink.error(error),
                complete: () => relaySink.complete(),
                next: (value: ExecutionResult<Data, Extensions>) => {
                    const data = value.data as PayloadData;
                    const errors = value.errors?.map(graphQLError => graphQLError as PayloadError);
                    const extensions = value.extensions as PayloadExtensions;
                    relaySink.next({
                        data,
                        errors,
                        extensions
                    });
                }
            };
        };

        return Observable.create(sink => {
            if (!operation.text) {
                return sink.error(new Error("Operation text cannot be empty"));
            }
            return subscriptionsClient.subscribe(
                {
                    operationName: operation.name,
                    query: operation.text,
                    variables
                },
                gqlSseRelaySinkAdapter(sink)
            );
        });
    };

    console.log("Creating relay environment...");
    return {
        relayEnviroment: new Environment({
            network: Network.create(fetchFn, subscribeFn),
            store: new Store(new RecordSource())
        }),
        setAuthorizationHeader: (headerValue, temporary) => {
            if (temporary) {
                if (temporaryAuthHeader)
                    throw new Error("Temporary auth header set multiple times without use!");
                temporaryAuthHeader = headerValue;
            } else {
                currentAuthHeader = headerValue;
            }
        }
    };
};

export default CreateRelayEnvironment;
