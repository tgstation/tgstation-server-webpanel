import { faUpload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { ChangeEvent, ReactNode } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import FormControl from "react-bootstrap/FormControl";
import InputGroup from "react-bootstrap/InputGroup";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { FormattedMessage } from "react-intl";
import ReactMarkdown from "react-markdown";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { SemVer } from "semver";

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
import ErrorAlert from "../../utils/ErrorAlert";
import { DebugJsonViewer } from "../../utils/JsonViewer";
import Loading from "../../utils/Loading";

interface IProps
    extends RouteComponentProps<{
        all: string;
    }> {}
interface IState {
    versions: TGSVersion[];
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
    //manual entry
}

class Update extends React.Component<IProps, IState> {
    public declare context: GeneralContext;

    public constructor(props: IProps) {
        super(props);

        this.loadNotes = this.loadNotes.bind(this);
        this.updateServer = this.updateServer.bind(this);

        this.state = {
            versions: [],
            errors: [],
            loading: true
        };
    }

    public async componentDidMount(): Promise<void> {
        await this.loadVersions();

        this.setState({
            loading: false
        });
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
                        this.setState({
                            versions: versionInfo.payload
                        });
                    }
                }
            }
        }
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

        const selectedVersionMarkdown = this.state.selectedVersion?.body
            .replaceAll("\r", "")
            .replaceAll("\n", "\n\n");

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
                        <div className="text-center">
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
                                show={timing}>
                                <Button onClick={this.updateServer} disabled={timing}>
                                    <FormattedMessage id="generic.continue" />
                                    {timing ? ` [${this.state.secondsLeft as number}]` : ""}
                                </Button>
                            </OverlayTrigger>
                            <h3>
                                <FormattedMessage id="view.admin.update.releasenotes" />
                            </h3>
                            <hr />
                        </div>
                        <ReactMarkdown>{selectedVersionMarkdown!}</ReactMarkdown>
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
