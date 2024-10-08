import { faUpload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { ChangeEvent, ReactNode } from "react";
import { Modal } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import FormControl from "react-bootstrap/FormControl";
import InputGroup from "react-bootstrap/InputGroup";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { FormattedMessage } from "react-intl";
import ReactMarkdown from "react-markdown";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { gte, lt, lte, SemVer } from "semver";
import YAML from "yaml";

import AdminClient, { UpdateErrors } from "../../../ApiClient/AdminClient";
import {
    AdministrationRights,
    ServerUpdateResponse
} from "../../../ApiClient/generatedcode/generated";
import InternalError, { ErrorCode } from "../../../ApiClient/models/InternalComms/InternalError";
import InternalStatus, { StatusCode } from "../../../ApiClient/models/InternalComms/InternalStatus";
import ServerClient from "../../../ApiClient/ServerClient";
import UserClient from "../../../ApiClient/UserClient";
import { GeneralContext } from "../../../contexts/GeneralContext";
import GithubClient, { TGSVersion } from "../../../utils/GithubClient";
import { hasAdminRight, resolvePermissionSet } from "../../../utils/misc";
import { AppRoutes } from "../../../utils/routes";
import TGSChangelog, { Changelist, TgsComponent } from "../../../utils/tgs_changelog";
import ErrorAlert from "../../utils/ErrorAlert";
import { DebugJsonViewer } from "../../utils/JsonViewer";
import Loading from "../../utils/Loading";

type IProps = RouteComponentProps<{
    all: string;
}>;
interface IState {
    versions: TGSVersion[];
    changelog: TGSChangelog | null;
    gitHubOwner: string | null;
    gitHubRepo: string | null;
    errors: Array<InternalError<ErrorCode> | undefined>;
    loading: boolean;
    //option is the numerical representation of the version
    selectedOption?: string;
    //this is the actual version
    selectedVersion?: TGSVersion;
    //timer used to delay the user on the release notes page
    timer?: number | null;
    //seconds left for the release notes page
    secondsLeft?: number | null;
    //redirect to home page
    updating?: boolean;
    warnedAboutMajorUpdates?: boolean;
}

class Update extends React.Component<IProps, IState> {
    public declare context: GeneralContext;

    public constructor(props: IProps) {
        super(props);

        this.loadNotes = this.loadNotes.bind(this);
        this.updateServer = this.updateServer.bind(this);

        this.state = {
            changelog: null,
            versions: [],
            errors: [],
            loading: true,
            gitHubOwner: null,
            gitHubRepo: null
        };
    }

    public componentDidMount(): void {
        void (async () => {
            await this.loadVersions();

            this.setState({
                loading: false
            });
        })();
    }

    public componentWillUnmount(): void {
        if (this.state.timer) {
            window.clearInterval(this.state.timer);
        }
    }

    private addError(error: InternalError<ErrorCode>): void {
        this.setState(prevState => {
            const errors = Array.from(prevState.errors);
            errors.push(error);
            return {
                errors
            };
        });
    }

    private async loadVersions(): Promise<void> {
        if (
            !hasAdminRight(
                resolvePermissionSet(this.context.user),
                AdministrationRights.ChangeVersion
            )
        ) {
            return;
        }

        const adminInfo = await AdminClient.getAdminInfo();

        switch (adminInfo.code) {
            case StatusCode.ERROR: {
                return this.addError(adminInfo.error);
            }
            case StatusCode.OK: {
                const url = adminInfo.payload.trackedRepositoryUrl;
                const matcher = /https?:\/\/(github\.com)\/(.*?)\/(.*)/;
                const results = matcher.exec(url);

                if (!results) {
                    return this.addError(
                        new InternalError(ErrorCode.APP_FAIL, {
                            jsError: Error(`Unknown repository url format: ${url}`)
                        })
                    );
                }

                if (results[1] !== "github.com") {
                    this.setState({
                        versions: [
                            {
                                body: "Updates unavailable to non github repos",
                                version: "Updates unavailable to non github repos",
                                current: true,
                                old: true
                            }
                        ]
                    });
                    return;
                }

                this.setState({
                    gitHubOwner: results[2],
                    gitHubRepo: results[3]
                });

                const loadChangelogPromise = this.loadChangelog(results[2], results[3]);

                const versionInfo = await GithubClient.getVersions({
                    owner: results[2],
                    repo: results[3],
                    current: this.context.serverInfo.version,
                    all: !!this.props.match.params.all
                });
                console.log("Version info: ", versionInfo);
                switch (versionInfo.code) {
                    case StatusCode.ERROR: {
                        return this.addError(versionInfo.error);
                    }
                    case StatusCode.OK: {
                        const changelog = await loadChangelogPromise;
                        this.setState({
                            changelog,
                            versions: versionInfo.payload
                        });
                    }
                }
            }
        }
    }

    private async loadChangelog(owner: string, repo: string): Promise<TGSChangelog | null> {
        const changelogYmlB64 = await GithubClient.getFile(
            owner,
            repo,
            "changelog.yml",
            "gh-pages"
        );
        switch (changelogYmlB64.code) {
            case StatusCode.ERROR: {
                this.addError(changelogYmlB64.error);
                break;
            }
            case StatusCode.OK: {
                try {
                    const changelogYml = window.atob(changelogYmlB64.payload);
                    return YAML.parse(changelogYml) as TGSChangelog;
                } catch {
                    this.addError(new InternalError(ErrorCode.BAD_YML, { void: true }));
                }

                break;
            }
        }

        return null;
    }

    private loadNotes(): void {
        for (const version of this.state.versions) {
            if (version.version !== this.state.selectedOption) continue;

            const timer = window.setInterval(() => {
                this.setState(prevState => {
                    if (prevState.secondsLeft === undefined || prevState.secondsLeft === null)
                        return prevState;
                    //clear the timer if we are ticking the last tick
                    if (prevState.secondsLeft === 1) {
                        window.clearInterval(prevState.timer!);
                        return {
                            timer: null,
                            secondsLeft: null
                        } as IState;
                    }

                    return {
                        secondsLeft: prevState.secondsLeft - 1
                    } as IState;
                });
            }, 1000);

            this.setState({
                selectedVersion: version,
                timer: timer,
                secondsLeft: 10
            });
            return;
        }
    }

    private async uploadVersion(): Promise<void> {
        const inputPromise = new Promise<File | null>(resolve => {
            const input = document.createElement("input");
            input.type = "file";
            input.onchange = e => {
                const files = (e.target as HTMLInputElement)?.files;
                if (files) resolve(files[0]);
                else resolve(null);
            };
            input.click();
        });

        const localFile = await inputPromise;
        if (!localFile) return;

        if (!localFile.name.toLowerCase().endsWith(".zip")) {
            alert("Invalid zipfile!");
            return;
        }

        // https://stackoverflow.com/questions/423376/how-to-get-the-file-name-from-a-full-path-using-javascript
        const fileData = await localFile.arrayBuffer();

        const targetVersionStr = prompt("Enter the TGS version semver:");
        if (!targetVersionStr) return;

        const targetVersionSemver = new SemVer(targetVersionStr);

        // reformat it for them in case they fucked up a little
        const targetVersion = `${targetVersionSemver.major}.${targetVersionSemver.minor}.${targetVersionSemver.patch}`;

        if (targetVersion != targetVersionStr) {
            alert("Invalid semver!");
            return;
        }

        if (
            !confirm(
                `JUST WHAT DO YOU THINK YOU'RE DOING!? This is your only and final warning: Uploading a TGS Version .zip that is improperly formatted or that does not match the version you just entered (${targetVersion}) can brick your installation! Think carefully before pressing OK to continue.`
            )
        ) {
            return;
        }

        await this.serverUpdated(AdminClient.uploadVersion(targetVersion, fileData));
    }

    private async updateServer(): Promise<void> {
        if (!this.state.selectedOption) {
            console.error("Attempted to update server to a no version");
            this.setState({
                selectedVersion: undefined
            });
            return;
        }

        await this.serverUpdated(AdminClient.updateServer(this.state.selectedOption));
    }

    private async serverUpdated(
        request: Promise<InternalStatus<ServerUpdateResponse, UpdateErrors>>
    ): Promise<void> {
        const response = await request;

        switch (response.code) {
            case StatusCode.ERROR: {
                this.addError(response.error);
                return;
            }
            case StatusCode.OK: {
                break;
            }
        }

        ServerClient.autoLogin = false;
        // i need that timer to be async
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        window.setInterval(async () => {
            const response = await UserClient.getCurrentUser(true);
            switch (response.code) {
                //we wait until we get an error which means either it rebooted and our creds are bullshit, or we rebooted and the api is different
                //in both cases, we should reboot
                case StatusCode.ERROR: {
                    window.location.reload();
                }
            }
        }, 2000);
        this.setState({
            updating: true
        });
    }

    private buildVersionDiffFromChangelog(targetVersion: string): string | null {
        const releaseNotes = this.state.changelog;
        if (!releaseNotes) {
            return null;
        }

        const currentVersion = this.context.serverInfo.version;

        const targetVersionSemver = new SemVer(targetVersion);
        const currentVersionSemver = new SemVer(currentVersion);

        let markdown = "";

        const targetComponentVersions = releaseNotes.Components[TgsComponent.Core].find(
            changelist => changelist.Version == targetVersion
        )!.ComponentVersions!;

        markdown += `Please refer to the [README](https://github.com/tgstation/tgstation-server#setup) for setup instructions. Full changelog can be found [here](https://raw.githubusercontent.com/tgstation/tgstation-server/gh-pages/changelog.yml).\n\n#### Component Versions\nCore: ${targetVersion}\nConfiguration: ${targetComponentVersions.Configuration}\nHTTP API: ${targetComponentVersions.HttpApi}\nDreamMaker API: ${targetComponentVersions.DreamMakerApi} (Interop: ${targetComponentVersions.InteropApi})\n[Web Control Panel](https://github.com/tgstation/tgstation-server-webpanel): ${targetComponentVersions.WebControlPanel}\nHost Watchdog: ${targetComponentVersions.HostWatchdog}\n\n`;

        let lowerVersion: string;
        let higherVersion: string;
        if (lt(targetVersionSemver, currentVersionSemver)) {
            markdown +=
                "## _The version you are switching to is below the current version._\n## _The following changes will be **un**-applied!_";
            lowerVersion = targetVersion;
            higherVersion = currentVersion;
        } else {
            lowerVersion = currentVersion;
            higherVersion = targetVersion;
        }

        const lowerVersionSemver = new SemVer(lowerVersion);
        const higherVersionSemver = new SemVer(higherVersion);

        // implemented similarly to https://github.com/tgstation/tgstation-server/blob/63815c950f18fe999c1dade7fa2773752de9f149/tools/Tgstation.Server.ReleaseNotes/Program.cs#L1392
        const coreChangelists = releaseNotes.Components[TgsComponent.Core]
            .filter(changelist => {
                const changelistVersionSemver = new SemVer(changelist.Version);
                return (
                    gte(changelistVersionSemver, lowerVersionSemver) &&
                    lte(changelistVersionSemver, higherVersionSemver)
                );
            })
            .sort((changelistA, changelistB) =>
                new SemVer(changelistA.Version).compare(changelistB.Version)
            )
            .reverse();

        const currentReleaseChangelists: Map<TgsComponent, Changelist>[] = [];

        for (let i = 0; i < coreChangelists.length - 1; ++i) {
            const currentDic = new Map<TgsComponent, Changelist>();
            currentReleaseChangelists.push(currentDic);
            const nowRelease = coreChangelists[i];
            const previousRelease = coreChangelists[i + 1];

            currentDic.set(TgsComponent.Core, nowRelease);
            Object.keys(nowRelease.ComponentVersions!).forEach(componentStr => {
                const component = componentStr as TgsComponent;
                const componentVersionStr = nowRelease.ComponentVersions![component];
                if (!componentVersionStr) return;

                const componentVersion = new SemVer(componentVersionStr);

                if (
                    component == TgsComponent.Core ||
                    component == TgsComponent.NugetClient ||
                    component == TgsComponent.NugetApi ||
                    component == TgsComponent.NugetCommon
                )
                    return;

                const takeNotesFrom = new SemVer(previousRelease.ComponentVersions![component]);
                const changesEnumerator = releaseNotes.Components[component]
                    .filter(changelist => {
                        const changelistVersion = new SemVer(changelist.Version);
                        return (
                            changelistVersion > takeNotesFrom &&
                            changelistVersion <= componentVersion
                        );
                    })
                    .flatMap(x => x.Changes!)
                    .sort((changeA, changeB) => changeA.PullRequest - changeB.PullRequest);
                const changelist: Changelist = {
                    Version: componentVersionStr,
                    Changes: changesEnumerator
                };

                if (changesEnumerator.length > 0) currentDic.set(component, changelist);
            });
        }

        currentReleaseChangelists.forEach(releaseDictionary => {
            markdown += "\n\n";
            const coreCl = releaseDictionary.get(TgsComponent.Core)!;
            const coreVersion = new SemVer(coreCl.Version);

            if (coreVersion.patch > 0) {
                markdown += `## Patch ${coreVersion.patch}`;
            } else if (coreVersion.minor > 0) {
                markdown += `# Update ${coreVersion.minor}.0`;
            } else {
                markdown += `# **Major Update ${coreVersion.major}.0.0**`;
            }

            for (const componentE in TgsComponent) {
                const component = componentE as TgsComponent;
                const changelist = releaseDictionary.get(component);
                if (
                    !changelist ||
                    (changelist.Changes?.length == 0 && component != TgsComponent.Configuration)
                ) {
                    continue;
                }

                markdown += "\n\n#### ";
                if (component == TgsComponent.Configuration) {
                    markdown += "**";
                }

                markdown += this.componentDisplayName(component);
                if (component == TgsComponent.Configuration) {
                    markdown += `\n- **The new configuration version is \`${changelist.Version}\` Please update your \`General:ConfigVersion\` setting appropriately.**`;
                }

                changelist.Changes?.forEach(change =>
                    change.Descriptions.forEach(line => {
                        markdown += `\n- ${line} ([#${change.PullRequest}](https://github.com/${this
                            .state.gitHubOwner!}/${this.state.gitHubRepo!}/pull/${
                            change.PullRequest
                        })) [@${change.Author}](https://github.com/${change.Author})`;
                    })
                );
            }
        });

        return markdown;
    }

    private componentDisplayName(componentS: string): string {
        const component = componentS as TgsComponent;
        switch (component) {
            case TgsComponent.HttpApi:
                return "HTTP API";
            case TgsComponent.InteropApi:
                return "Interop API";
            case TgsComponent.Configuration:
                return "**Configuration**";
            case TgsComponent.DreamMakerApi:
                return "DreamMaker API";
            case TgsComponent.HostWatchdog:
                return "Host Watchdog (Requires reinstall to apply)";
            case TgsComponent.Core:
                return "Core";
            case TgsComponent.WebControlPanel:
                return "Web Control Panel";
            default:
                throw new Error("Unknown component: " + component);
        }
    }

    public render(): ReactNode {
        if (this.state.updating) {
            return <Loading text="loading.updating" />;
        }
        if (this.state.loading) {
            return <Loading text="loading.version" />;
        }
        const handleChange = (changeEvent: ChangeEvent<HTMLInputElement>) => {
            this.setState({
                selectedOption: changeEvent.target.value
            });
        };

        const permissionSet = resolvePermissionSet(this.context.user);
        const canChangeVersion = hasAdminRight(permissionSet, AdministrationRights.ChangeVersion);
        const canUploadVersion = hasAdminRight(permissionSet, AdministrationRights.UploadVersion);

        const selectedVersionMarkdown = this.state.selectedVersion
            ? (
                  this.buildVersionDiffFromChangelog(this.state.selectedVersion.version) ??
                  this.state.selectedVersion.body
              )
                  .replaceAll("\r", "")
                  .replaceAll("\n", "\n\n")
            : null;

        const currentVersionSemver = new SemVer(this.context.serverInfo.version);
        const selectedVersionIsDifferentMajor =
            this.state.selectedVersion &&
            new SemVer(this.state.selectedVersion.version).major != currentVersionSemver.major;

        const closeWarningModal = () =>
            this.setState({
                warnedAboutMajorUpdates: true
            });

        const timing = typeof this.state.secondsLeft === "number";
        return (
            <React.Fragment>
                <DebugJsonViewer obj={this.state.versions} />
                <div className="text-center">
                    {this.state.errors.map((err, index) => {
                        if (!err) return;
                        return (
                            <ErrorAlert
                                key={index}
                                error={err}
                                onClose={() =>
                                    this.setState(prev => {
                                        const newarr = Array.from(prev.errors);
                                        newarr[index] = undefined;
                                        return {
                                            errors: newarr
                                        };
                                    })
                                }
                            />
                        );
                    })}
                </div>
                {this.state.selectedVersion ? (
                    <React.Fragment>
                        <Modal
                            centered
                            show={
                                selectedVersionIsDifferentMajor &&
                                !this.state.warnedAboutMajorUpdates
                            }
                            onHide={closeWarningModal}
                            size="lg">
                            <Modal.Header closeButton>
                                <Modal.Title>
                                    <FormattedMessage id="view.admin.update.major_warn.title" />
                                </Modal.Title>
                            </Modal.Header>
                            <Modal.Body className="text-danger pb-0">
                                <FormattedMessage
                                    id="view.admin.update.major_warn.body"
                                    values={{
                                        currentMajor: currentVersionSemver.major,
                                        targetMajor: new SemVer(this.state.selectedVersion.version)
                                            .major
                                    }}
                                />
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={closeWarningModal}>
                                    <FormattedMessage id="generic.close" />
                                </Button>
                            </Modal.Footer>
                        </Modal>
                        <div className="text-center">
                            <h3>
                                <FormattedMessage id="view.admin.update.releasenotes" />
                            </h3>
                            <hr />
                        </div>
                        <ReactMarkdown>{selectedVersionMarkdown!}</ReactMarkdown>
                        <div className="text-center">
                            <hr />
                            <Button
                                className="mr-3"
                                onClick={() => this.setState({ selectedVersion: undefined })}>
                                <FormattedMessage id="generic.goback" />
                            </Button>
                            <OverlayTrigger
                                overlay={
                                    <Tooltip id="timing-tooltip">
                                        <FormattedMessage id="view.admin.update.wait" />
                                    </Tooltip>
                                }
                                placement="right"
                                show={timing}>
                                <Button onClick={() => void this.updateServer()} disabled={timing}>
                                    <FormattedMessage id="generic.continue" />
                                    {timing ? ` [${this.state.secondsLeft as number}]` : ""}
                                </Button>
                            </OverlayTrigger>
                        </div>
                    </React.Fragment>
                ) : (
                    <div className="text-center">
                        <h3 className="mb-4">
                            <FormattedMessage id="view.admin.update.selectversion" />
                        </h3>
                        {canChangeVersion ? (
                            <Col xs={8} md={6} className="mx-auto">
                                {this.state.versions.map((version, index) => {
                                    return (
                                        <InputGroup className="mb-3" key={version.version}>
                                            <InputGroup.Prepend>
                                                <InputGroup.Radio
                                                    id={version.version}
                                                    name="version"
                                                    disabled={version.current}
                                                    value={version.version}
                                                    checked={
                                                        this.state.selectedOption ===
                                                        version.version
                                                    }
                                                    onChange={handleChange}
                                                />
                                            </InputGroup.Prepend>
                                            <FormControl
                                                as={"label"}
                                                htmlFor={version.version}
                                                disabled>
                                                {version.version}
                                                {version.current ? (
                                                    <FormattedMessage id="view.admin.update.current" />
                                                ) : (
                                                    ""
                                                )}
                                                {index == 0 ? (
                                                    <FormattedMessage id="view.admin.update.latest" />
                                                ) : (
                                                    ""
                                                )}
                                            </FormControl>
                                        </InputGroup>
                                    );
                                })}
                                <Button
                                    variant="link"
                                    onClick={() => {
                                        this.props.history.push(
                                            (AppRoutes.admin_update.link ??
                                                AppRoutes.admin_update.route) + "all/",
                                            {
                                                reload: true
                                            }
                                        );
                                    }}
                                    disabled={!!this.props.match.params.all}>
                                    <FormattedMessage id="view.admin.update.showall" />
                                </Button>
                                <br />
                                <Button
                                    onClick={this.loadNotes}
                                    disabled={!this.state.selectedOption}>
                                    <FormattedMessage id="generic.continue" />
                                </Button>
                            </Col>
                        ) : (
                            <h4>
                                <FormattedMessage id="view.admin.update.selectversion.deny" />
                            </h4>
                        )}
                        <br />
                        <OverlayTrigger
                            overlay={
                                <Tooltip id="create-instance-tooltip">
                                    <FormattedMessage id="view.admin.update.upload.deny" />
                                </Tooltip>
                            }
                            show={canUploadVersion ? false : undefined}>
                            {({ ref, ...triggerHandler }) => (
                                <Button
                                    ref={ref}
                                    className="mx-1"
                                    variant="success"
                                    onClick={() => void this.uploadVersion()}
                                    disabled={!canUploadVersion}
                                    {...triggerHandler}>
                                    <div>
                                        <FontAwesomeIcon className="mr-2" icon={faUpload} />
                                        <FormattedMessage id="view.admin.update.upload" />
                                    </div>
                                </Button>
                            )}
                        </OverlayTrigger>
                    </div>
                )}
            </React.Fragment>
        );
    }
}
Update.contextType = GeneralContext;
export default withRouter(Update);
