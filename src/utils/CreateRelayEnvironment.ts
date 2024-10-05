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

import Pkg from "@/../package.json";

const CreateRelayEnvironment = (
    serverUrl: string
): {
    relayEnviroment: Environment;
    setBearer: (bearer: string | null) => void;
} => {
    const graphQLEndpoint = `${serverUrl}/api/graphql`;

    let currentBearer: string | null = null;
    const createAuthHeader = () => {
        return currentBearer ? `Bearer ${currentBearer}` : "";
    };

    const fetchFn: FetchFunction = async (request, variables) => {
        const resp = await fetch(graphQLEndpoint, {
            method: "POST",
            headers: {
                Accept: "application/graphql-response+json; charset=utf-8, application/json; charset=utf-8",
                "Content-Type": "application/json",
                Api: `Tgstation.Server.Api/${Pkg.tgs_api_version}`,
                Authorization: request.name === "Login" ? "" : createAuthHeader() // login should always be unauthed
            },
            body: JSON.stringify({
                query: request.text, // <-- The GraphQL document composed by Relay
                variables
            })
        });

        return await resp.json();
    };

    // We only want to setup subscriptions if we are on the client.
    const subscriptionsClient = createClient({
        url: graphQLEndpoint,
        headers: (): Record<string, string> => {
            return {
                Api: `Tgstation.Server.Api/${Pkg.tgs_api_version}`,
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
                    return {
                        data: value.data,
                        errors: value.errors,
                        extensions: value.extensions
                    };
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
        setBearer: newBearer => (currentBearer = newBearer)
    };
};

export default CreateRelayEnvironment;
