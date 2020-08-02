import React, { ChangeEvent, ReactNode } from "react";
import InternalError, { ErrorCode } from "../../../ApiClient/models/InternalComms/InternalError";
import ErrorAlert from "../../utils/ErrorAlert";
import AdminClient from "../../../ApiClient/AdminClient";
import { StatusCode } from "../../../ApiClient/models/InternalComms/InternalStatus";
import GithubClient, { TGSVersion } from "../../../utils/GithubClient";
import ServerClient from "../../../ApiClient/ServerClient";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import Col from "react-bootstrap/Col";
import Loading from "../../utils/Loading";
import Button from "react-bootstrap/Button";
import { FormattedMessage } from "react-intl";
import ReactMarkdown from "react-markdown";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

interface IProps {}
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

export default class Update extends React.Component<IProps, IState> {
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
        const tasks = [];
        tasks.push(this.loadVersions());

        await Promise.all(tasks);
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
        const adminInfo = await AdminClient.getAdminInfo();

        switch (adminInfo.code) {
            case StatusCode.ERROR: {
                return this.addError(adminInfo.error!);
            }
            case StatusCode.OK: {
                const url = adminInfo.payload!.trackedRepositoryUrl!;
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

                const serverInfo = await ServerClient.getServerInfo();
                switch (serverInfo.code) {
                    case StatusCode.ERROR: {
                        return this.addError(adminInfo.error!);
                    }
                    case StatusCode.OK: {
                        const versionInfo = await GithubClient.getVersions({
                            owner: results[2],
                            repo: results[3],
                            current: serverInfo.payload!.version!
                        });
                        console.log("Version info: ", versionInfo);
                        switch (versionInfo.code) {
                            case StatusCode.ERROR: {
                                return this.addError(adminInfo.error!);
                            }
                            case StatusCode.OK: {
                                this.setState({
                                    versions: versionInfo.payload!
                                });
                            }
                        }
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

    private async updateServer(): Promise<void> {
        if (!this.state.selectedOption) {
            console.error("Attempted to update server to a no version");
            this.setState({
                selectedVersion: undefined
            });
            return;
        }
        const response = await AdminClient.updateServer({ newVersion: this.state.selectedOption });

        switch (response.code) {
            case StatusCode.ERROR: {
                this.addError(response.error!);
                break;
            }
            case StatusCode.OK: {
                ServerClient.autoLogin = false;
                // i need that timer to be async
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                window.setInterval(async () => {
                    const response = await ServerClient.getServerInfo(undefined, true);
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

        const timing = typeof this.state.secondsLeft === "number";
        return (
            <React.Fragment>
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
                        <ReactMarkdown source={this.state.selectedVersion.body} />
                    </React.Fragment>
                ) : (
                    <div className="text-center">
                        <h3 className="mb-4">
                            <FormattedMessage id="view.admin.update.selectversion" />
                        </h3>
                        <Col xs={8} md={6} className="mx-auto">
                            {this.state.versions.map((version, index) => {
                                return (
                                    <InputGroup className="mb-3" key={version.version}>
                                        <InputGroup.Prepend>
                                            <InputGroup.Radio
                                                id={version.version}
                                                name="version"
                                                disabled={version.old}
                                                value={version.version}
                                                checked={
                                                    this.state.selectedOption === version.version
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
                            <Button onClick={this.loadNotes} disabled={!this.state.selectedOption}>
                                <FormattedMessage id="generic.continue" />
                            </Button>
                        </Col>
                    </div>
                )}
            </React.Fragment>
        );
    }
}
