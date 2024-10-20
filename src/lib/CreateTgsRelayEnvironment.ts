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

import { ICredentials, OAuthCredentials } from "./Credentials";
import devDelay from "./devDelay";
import { TgsNetworkErrorPrefix } from "./NetworkErrorPrefixes";

import Pkg from "@/../package.json";

const CreateRelayEnvironment = (
    serverUrl: string
): {
    relayEnviroment: Environment;
    setCredentials: (credentials: ICredentials | null, temporary: boolean) => void;
} => {
    const graphQLEndpoint = `${serverUrl}/api/graphql`;

    let currentCredentials: ICredentials | null = null;
    let temporaryCredentials: ICredentials | null = null;
    const createAuthHeader = () => {
        const credentials = currentCredentials ?? temporaryCredentials;
        const header = credentials?.createAuthorizationHeader();

        if (credentials instanceof OAuthCredentials) {
            return [header, credentials.provider];
        }

        temporaryCredentials = null;
        return [header, null];
    };

    const fetchFn: FetchFunction = async (request, variables) => {
        const [authHeader, oAuthHeader] = createAuthHeader();
        const requestHeaders: HeadersInit = new Headers();
        requestHeaders.set(
            "Accept",
            "application/graphql-response+json; charset=utf-8, application/json; charset=utf-8"
        );
        requestHeaders.set("Content-Type", "application/json");
        requestHeaders.set("Api", `Tgstation.Server.Api/${Pkg.tgs_graphql_api_version}`);
        if (authHeader) {
            requestHeaders.set("Authorization", authHeader);
            if (oAuthHeader) {
                requestHeaders.set("OAuthProvider", oAuthHeader);
            }
        }

        return await devDelay(async () => {
            let resp;
            try {
                resp = await fetch(graphQLEndpoint, {
                    method: "POST",
                    headers: requestHeaders,
                    body: JSON.stringify({
                        query: request.text, // <-- The GraphQL document composed by Relay
                        variables
                    })
                });
            } catch (error) {
                if (error instanceof TypeError) {
                    error.message = TgsNetworkErrorPrefix + error.message;
                }

                throw error;
            }

            return await resp.json();
        }, "Relay Request");
    };

    // We only want to setup subscriptions if we are on the client.
    const subscriptionsClient = createClient({
        url: graphQLEndpoint,
        headers: (): Record<string, string> => {
            const [authHeader] = createAuthHeader();
            if (authHeader) {
                return {
                    Api: `Tgstation.Server.Api/${Pkg.tgs_graphql_api_version}`,
                    Authorization: authHeader
                };
            }

            return {
                Api: `Tgstation.Server.Api/${Pkg.tgs_graphql_api_version}`
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

    return {
        relayEnviroment: new Environment({
            network: Network.create(fetchFn, subscribeFn),
            store: new Store(new RecordSource())
        }),
        setCredentials: (credentials, temporary) => {
            if (temporary) {
                if (temporaryCredentials)
                    throw new Error("Temporary credentials set multiple times without use!");
                temporaryCredentials = credentials;
            } else {
                currentCredentials = credentials;
            }
        }
    };
};

export default CreateRelayEnvironment;
