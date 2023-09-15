/* eslint-disable import/no-unresolved */
import { retry } from "@octokit/plugin-retry";
import { throttling } from "@octokit/plugin-throttling";
import { RequestError } from "@octokit/request-error";
import { Octokit, RestEndpointMethodTypes } from "@octokit/rest";
import { EndpointDefaults } from "@octokit/types";
/* eslint-enable import/no-unresolved */
import { TypedEmitter } from "tiny-typed-emitter/lib";

import InternalError, { ErrorCode } from "../ApiClient/models/InternalComms/InternalError";
import InternalStatus, { StatusCode } from "../ApiClient/models/InternalComms/InternalStatus";
import configOptions from "../ApiClient/util/config";
import { VERSION } from "../definitions/constants";

export interface TGSVersion {
    version: string;
    body: string;
    current: boolean;
    old: boolean;
}

export interface Commit {
    name: string;
    sha: string;
    url: string;
}

export interface PullRequest {
    number: number;
    title: string;
    author: string;
    state: "open" | "closed" | "merged";
    link: string;
    head: string;
    tail: string;
    testmergelabel: boolean;
    conflictlabel: boolean;
}

type ExtractArrayType<A> = A extends Array<infer ArrayType> ? ArrayType : never;
export type GithubPullRequest = ExtractArrayType<
    RestEndpointMethodTypes["pulls"]["list"]["response"]["data"]
>;
export type FullGithubPullRequest = RestEndpointMethodTypes["pulls"]["get"]["response"]["data"];

export interface DirectoryItem {
    path: string;
    isDirectory: boolean;
}

type IEvents = object;

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

const e = new (class GithubClient extends TypedEmitter<IEvents> {
    private readonly apiClient: Octokit;

    public constructor() {
        super();

        const octo = Octokit.plugin(retry, throttling);

        this.apiClient = new octo({
            authStrategy,
            userAgent: "tgstation-server-control-panel/" + VERSION,
            baseUrl: "https://api.github.com",
            throttle: {
                onRateLimit: (retryAfter: number, options: Required<EndpointDefaults>) => {
                    console.warn(
                        `Request quota exhausted for request ${options.method} ${options.url}`
                    );

                    if (options.request.retryCount === 0) {
                        // only retries once
                        console.log(`Retrying after ${retryAfter} seconds!`);
                        return true;
                    }
                    return false;
                },
                onSecondaryRateLimit: (_: number, options: Required<EndpointDefaults>) => {
                    // does not retry, only logs a warning
                    console.warn(`Abuse detected for request ${options.method} ${options.url}`);
                }
            }
        });
    }

    public async getLatestDefaultCommit(
        owner: string,
        repo: string
    ): Promise<InternalStatus<string, ErrorCode.GITHUB_FAIL>> {
        try {
            const repoData = await this.apiClient.repos.get({
                owner,
                repo
            });

            const branch = await this.apiClient.repos.getBranch({
                owner,
                repo,
                branch: repoData.data.default_branch
            });

            return new InternalStatus({
                code: StatusCode.OK,
                payload: branch.data.commit.sha
            });
        } catch (e) {
            return new InternalStatus<string, ErrorCode.GITHUB_FAIL>({
                code: StatusCode.ERROR,
                error: new InternalError(ErrorCode.GITHUB_FAIL, {
                    jsError: e as RequestError
                })
            });
        }
    }

    public async getVersions({
        owner,
        repo,
        current,
        all
    }: {
        owner: string;
        repo: string;
        current: string;
        all?: boolean;
    }): Promise<InternalStatus<TGSVersion[], ErrorCode.GITHUB_FAIL>> {
        let payload: TGSVersion[];
        let oldversions = 0;
        try {
            payload = await this.apiClient.paginate(
                this.apiClient.repos.listReleases,
                { owner, repo },
                (response, done) => {
                    return response.data.reduce((result, release) => {
                        const match = /tgstation-server-v([\d.]+)/.exec(release.name ?? "");
                        if (!match) return result;

                        const majorVersion = parseInt(match[1][0]);
                        if (majorVersion < 4) return result;

                        const version = match[1];
                        let old = false;

                        //show 3 outdated versions(2 if you count the current one)
                        if (version <= current) {
                            if (oldversions >= 3 && !all) {
                                (done as () => void)();
                                return result;
                            }
                            oldversions++;
                            old = true;
                        }

                        result.push({
                            version,
                            body: release.body ?? "",
                            current: version === current,
                            old
                        });
                        return result;
                    }, [] as TGSVersion[]);
                }
            );
        } catch (e) {
            return new InternalStatus<TGSVersion[], ErrorCode.GITHUB_FAIL>({
                code: StatusCode.ERROR,
                error: new InternalError(ErrorCode.GITHUB_FAIL, {
                    jsError: e as RequestError
                })
            });
        }
        return new InternalStatus({
            code: StatusCode.OK,
            payload
        });
    }

    private transformPR(pr: FullGithubPullRequest | GithubPullRequest): PullRequest {
        return {
            number: pr.number,
            title: pr.title,
            author: pr.user?.login ?? "ghost",
            state: pr.merged_at ? "merged" : (pr.state as "open" | "closed"),
            link: pr.html_url,
            head: pr.head.sha,
            tail: pr.base.sha,
            testmergelabel: pr.labels.some(
                label =>
                    label.name?.toLowerCase().includes("testmerge") ||
                    label.name?.toLowerCase().includes("test merge")
            ),
            conflictlabel: pr.labels.some(label => label.name?.toLowerCase().includes("conflict"))
        };
    }

    public async getPRs({
        owner,
        repo,
        wantedPRs
    }: {
        owner: string;
        repo: string;
        wantedPRs?: number[];
    }): Promise<InternalStatus<PullRequest[], ErrorCode.GITHUB_FAIL>> {
        let payload: PullRequest[] = [];
        try {
            payload = (
                await this.apiClient.paginate(this.apiClient.pulls.list, {
                    owner,
                    repo,
                    state: "open"
                })
            ).map(this.transformPR);

            for (const wantedPR of wantedPRs ?? []) {
                if (!payload.find(pr => pr.number == wantedPR)) {
                    const pr = (
                        await this.apiClient.pulls.get({
                            owner,
                            repo,
                            pull_number: wantedPR
                        })
                    ).data;
                    payload.push(this.transformPR(pr));
                }
            }
        } catch (e) {
            console.error(e);
            return new InternalStatus<PullRequest[], ErrorCode.GITHUB_FAIL>({
                code: StatusCode.ERROR,
                error: new InternalError(ErrorCode.GITHUB_FAIL, {
                    jsError: e as RequestError
                })
            });
        }
        return new InternalStatus({
            code: StatusCode.OK,
            payload
        });
    }

    public async getPRCommits({
        owner,
        repo,
        pr,
        wantedCommit
    }: {
        owner: string;
        repo: string;
        pr: PullRequest;
        wantedCommit?: string;
    }): Promise<InternalStatus<[commits: Commit[], extraCommit?: Commit], ErrorCode.GITHUB_FAIL>> {
        let payload: Commit[] = [];
        let extraCommit: Commit | undefined = undefined;
        try {
            payload = await this.apiClient.paginate(
                this.apiClient.pulls.listCommits,
                {
                    owner,
                    repo,
                    pull_number: pr.number,
                    per_page: 100
                },
                ({ data }) =>
                    data.map(commit => ({
                        name: commit.commit.message.split("\n")[0],
                        sha: commit.sha,
                        url: commit.html_url
                    }))
            );

            //Newest at the top
            payload.reverse();

            if (wantedCommit && !payload.find(commit => commit.sha === wantedCommit)) {
                const _extraCommit = (
                    await this.apiClient.repos.getCommit({
                        owner,
                        repo,
                        ref: wantedCommit
                    })
                ).data;
                extraCommit = {
                    name: _extraCommit.commit.message.split("\n")[0],
                    sha: _extraCommit.sha,
                    url: _extraCommit.html_url
                };
            }
        } catch (e) {
            console.error(e);
            return new InternalStatus<
                [commits: Commit[], extraCommit?: Commit],
                ErrorCode.GITHUB_FAIL
            >({
                code: StatusCode.ERROR,
                error: new InternalError(ErrorCode.GITHUB_FAIL, {
                    jsError: e as RequestError
                })
            });
        }
        return new InternalStatus({
            code: StatusCode.OK,
            payload: [payload, extraCommit]
        });
    }

    public async getFile(
        owner: string,
        repo: string,
        path: string,
        ref?: string
    ): Promise<InternalStatus<string, ErrorCode.GITHUB_FAIL>> {
        try {
            const { data } = await this.apiClient.repos.getContent({
                mediaType: {
                    format: "base64"
                },
                owner,
                repo,
                path,
                ref
            });

            // ignore directory responses
            if (Array.isArray(data)) {
                return new InternalStatus<string, ErrorCode.GITHUB_FAIL>({
                    code: StatusCode.ERROR,
                    error: new InternalError(ErrorCode.GITHUB_FAIL, {
                        jsError: new Error(`${path} was a directory!`)
                    })
                });
            }

            if (data.type !== "file") {
                return new InternalStatus<string, ErrorCode.GITHUB_FAIL>({
                    code: StatusCode.ERROR,
                    error: new InternalError(ErrorCode.GITHUB_FAIL, {
                        jsError: new Error(`${path} has type ${data.type}!`)
                    })
                });
            }

            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
            const raw = (data as any).content as string;

            return new InternalStatus({
                code: StatusCode.OK,
                payload: raw
            });
        } catch (e) {
            console.error(e);
            return new InternalStatus<string, ErrorCode.GITHUB_FAIL>({
                code: StatusCode.ERROR,
                error: new InternalError(ErrorCode.GITHUB_FAIL, {
                    jsError: e as RequestError
                })
            });
        }
    }

    public async getDirectoryContents(
        owner: string,
        repo: string,
        path: string,
        ref?: string
    ): Promise<InternalStatus<DirectoryItem[], ErrorCode.GITHUB_FAIL>> {
        try {
            const { data } = await this.apiClient.repos.getContent({
                owner,
                repo,
                path,
                ref
            });

            // ignore non-directory responses
            if (!Array.isArray(data)) {
                return new InternalStatus<DirectoryItem[], ErrorCode.GITHUB_FAIL>({
                    code: StatusCode.ERROR,
                    error: new InternalError(ErrorCode.GITHUB_FAIL, {
                        jsError: new Error(`${path} was not a directory!`)
                    })
                });
            }

            const result: DirectoryItem[] = [];
            data.forEach(element =>
                result.push({
                    path: element.path,
                    isDirectory: element.type == "dir"
                })
            );

            return new InternalStatus({
                code: StatusCode.OK,
                payload: result
            });
        } catch (e) {
            console.error(e);
            return new InternalStatus<DirectoryItem[], ErrorCode.GITHUB_FAIL>({
                code: StatusCode.ERROR,
                error: new InternalError(ErrorCode.GITHUB_FAIL, {
                    jsError: e as RequestError
                })
            });
        }
    }
})();
export default e;
