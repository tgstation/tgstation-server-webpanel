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
import delay from "./delay";

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
    state: "open" | "closed" | "merged" | "draft";
    link: string;
    head: string;
    tail: string;
    testmergelabel: boolean;
    antitestmergelabel: boolean;
    mergeable: boolean | null;
}

type ExtractArrayType<A> = A extends Array<infer ArrayType> ? ArrayType : never;
export type ListedGithubPullRequest = ExtractArrayType<
    RestEndpointMethodTypes["pulls"]["list"]["response"]["data"]
>;
export type GithubPullRequest = RestEndpointMethodTypes["pulls"]["get"]["response"]["data"];

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

    private transformFullPR(pr: GithubPullRequest): PullRequest {
        return {
            number: pr.number,
            title: pr.title,
            author: pr.user?.login ?? "ghost",
            state: pr.merged_at
                ? "merged"
                : pr.state == "closed"
                  ? "closed"
                  : pr.draft
                    ? "draft"
                    : "open",
            link: pr.html_url,
            head: pr.head.sha,
            tail: pr.base.sha,
            testmergelabel: pr.labels.some(
                label =>
                    label.name?.toLowerCase().includes("testmerge") ||
                    label.name?.toLowerCase().includes("test merge")
            ),
            antitestmergelabel: pr.labels.some(
                label =>
                    label.name?.toLowerCase().includes("do not testmerge") ||
                    label.name?.toLowerCase().includes("do not test merge")
            ),
            mergeable: pr.mergeable
        };
    }

    private transformBasicPR(pr: ListedGithubPullRequest): PullRequest {
        return {
            number: pr.number,
            title: pr.title,
            author: pr.user?.login ?? "ghost",
            state: pr.merged_at
                ? "merged"
                : pr.state == "closed"
                  ? "closed"
                  : pr.draft
                    ? "draft"
                    : "open",
            link: pr.html_url,
            head: pr.head.sha,
            tail: pr.base.sha,
            testmergelabel: pr.labels.some(
                label =>
                    label.name?.toLowerCase().includes("testmerge") ||
                    label.name?.toLowerCase().includes("test merge")
            ),
            antitestmergelabel: pr.labels.some(
                label =>
                    label.name?.toLowerCase().includes("do not testmerge") ||
                    label.name?.toLowerCase().includes("do not test merge")
            ),
            mergeable: null
        };
    }

    private async getPR({
        owner,
        repo,
        wantedPR
    }: {
        owner: string;
        repo: string;
        wantedPR: number;
    }) {
        const pr = await this.apiClient.pulls.get({
            owner,
            repo,
            pull_number: wantedPR
        });

        return this.transformFullPR(pr.data);
    }

    private async getPRUntilMergeable({
        owner,
        repo,
        wantedPR,
        pollTimer = configOptions.mergeabilitypolltimer.value as number
    }: {
        owner: string;
        repo: string;
        wantedPR: number;
        pollTimer?: number;
    }) {
        //Retry three times to get the mergeable status
        for (let i = 0; i < 2; i++) {
            const pr = await this.getPR({ owner, repo, wantedPR });

            if (pr.mergeable !== null) {
                return pr;
            }

            await delay(pollTimer);
        }

        return this.getPR({ owner, repo, wantedPR });
    }

    public async getPRs({
        owner,
        repo,
        wantedPRs = []
    }: {
        owner: string;
        repo: string;
        wantedPRs?: number[];
    }): Promise<InternalStatus<PullRequest[], ErrorCode.GITHUB_FAIL>> {
        let payload: PullRequest[];
        try {
            const basicPRInfo = await this.apiClient.paginate(this.apiClient.pulls.list, {
                owner,
                repo,
                state: "open",
                per_page: 100
            });

            payload = basicPRInfo.map(this.transformBasicPR);

            //Test merged PRs that got closed aren't in the open list. Don't poll these,
            //getPRMergeability does that later
            const missingPRs = wantedPRs.filter(
                wantedPR => !payload.some(pr => pr.number === wantedPR)
            );
            payload.push(
                ...(await Promise.all(
                    missingPRs.map(wantedPR => this.getPR({ owner, repo, wantedPR }))
                ))
            );
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

    //The list endpoint has no mergeability, so this costs a request (or three) per PR.
    //Token only, unauthenticated users would speedrun burning their 60 requests per hour
    public async getPRMergeability({
        owner,
        repo,
        prs
    }: {
        owner: string;
        repo: string;
        prs: PullRequest[];
    }): Promise<PullRequest[]> {
        if (!configOptions.githubtoken.value) return prs;

        return Promise.all(
            prs.map(pr => {
                //github always says null for merged PRs, don't bother
                if (pr.mergeable !== null || pr.state === "merged") {
                    return pr;
                }
                return this.getPRUntilMergeable({ owner, repo, wantedPR: pr.number }).catch(e => {
                    console.error(e);
                    return pr;
                });
            })
        );
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
