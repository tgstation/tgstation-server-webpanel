import { Environment, FetchFunction, Network, RecordSource, Store } from "relay-runtime";

import { BearerCredentials } from "./Credentials";
import devDelay from "./devDelay";

const CreateGitHubRelayEnvironment = (credentials: BearerCredentials): Environment => {
    const graphQLEndpoint = `https://api.github.com/graphql`;

    const fetchFn: FetchFunction = async (request, variables) => {
        const requestHeaders: HeadersInit = new Headers();
        requestHeaders.set(
            "Accept",
            "application/graphql-response+json; charset=utf-8, application/json; charset=utf-8"
        );
        requestHeaders.set("Content-Type", "application/json");
        requestHeaders.set("Authorization", credentials.createAuthorizationHeader());

        return await devDelay(async () => {
            const resp = await fetch(graphQLEndpoint, {
                method: "POST",
                headers: requestHeaders,
                body: JSON.stringify({
                    query: request.text, // <-- The GraphQL document composed by Relay
                    variables
                })
            });

            return await resp.json();
        }, "GitHub Relay Request");
    };

    return new Environment({
        network: Network.create(fetchFn),
        store: new Store(new RecordSource())
    });
};

export default CreateGitHubRelayEnvironment;
