import { Octokit } from "@octokit/rest";
import configOptions from "./config";
import { TypedEmitter } from "tiny-typed-emitter/lib";

interface IEvents {}

/* eslint-disable */

async function hook(request: any, route: any, parameters?: any): Promise<any> {
    const endpoint = request.endpoint.merge(route as string, parameters);

    if (configOptions.githubtoken.value) {
        endpoint.headers.authorization = `token ${configOptions.githubtoken.value}`;
    }

    return request(endpoint);
}

async function auth(): Promise<any> {
    if (configOptions.githubtoken.value) {
        return {
            type: "token",
            tokenType: "pat",
            token: configOptions.githubtoken.value
        };
    } else {
        return {
            type: "unauthenticated"
        };
    }
}

const authStrategy = () => {
    return Object.assign(auth.bind(null), {
        hook: hook.bind(null)
    });
};

/* eslint-enable */

export default new (class GithubClient extends TypedEmitter<IEvents> {
    private readonly apiClient: Octokit;

    public constructor() {
        super();

        this.apiClient = new Octokit({
            authStrategy,
            userAgent: "tgstation-server-control-panel/" + VERSION
        });
    }
})();

//@ts-expect-error TODO: remove this, obviously.
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
window.test = module.exports;
