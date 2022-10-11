import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { ComponentType } from "react";
import Card from "react-bootstrap/Card";
import Nav from "react-bootstrap/Nav";
import Tab from "react-bootstrap/Tab";
import { FormattedMessage } from "react-intl";
import { RouteComponentProps, withRouter } from "react-router";

import {
    ByondRights,
    ChatBotRights,
    ConfigurationRights,
    DreamDaemonRights,
    DreamMakerRights,
    InstancePermissionSetResponse,
    RepositoryRights
} from "../../../ApiClient/generatedcode/generated";
import InstanceClient from "../../../ApiClient/InstanceClient";
import InstancePermissionSetClient from "../../../ApiClient/InstancePermissionSetClient";
import InternalError from "../../../ApiClient/models/InternalComms/InternalError";
import { StatusCode } from "../../../ApiClient/models/InternalComms/InternalStatus";
import configOptions, { InstanceEditSidebar } from "../../../ApiClient/util/config";
import { GeneralContext } from "../../../contexts/GeneralContext";
import {
    InstanceEditContext,
    UnsafeInstanceEditContext
} from "../../../contexts/InstanceEditContext";
import { AppRoutes, RouteData } from "../../../utils/routes";
import AccessDenied from "../../utils/AccessDenied";
import Loading from "../../utils/Loading";
import WIPNotice from "../../utils/WIPNotice";
import Byond from "./Edit/Byond";
import ChatBots from "./Edit/ChatBots";
import Config from "./Edit/Config";
import { Deployment } from "./Edit/Deployment";
import Files from "./Edit/Files";
import InstancePermissions from "./Edit/InstancePermissions";
import JobHistory from "./Edit/JobHistory";
import Repository from "./Edit/Repository";
import Server from "./Edit/Server";

type IProps = RouteComponentProps<{ id: string; tab?: string }>;
type IState = Omit<UnsafeInstanceEditContext, "user" | "serverInfo"> & {
    tab: string;
    instanceid: number;
};

const minimumByondPerms =
    ByondRights.ReadActive |
    ByondRights.ListInstalled |
    ByondRights.InstallOfficialOrChangeActiveVersion |
    ByondRights.InstallCustomVersion;

const minimumServerPerms =
    DreamDaemonRights.SetPort |
    DreamDaemonRights.SetAutoStart |
    DreamDaemonRights.SetSecurity |
    DreamDaemonRights.ReadMetadata |
    DreamDaemonRights.SetWebClient |
    DreamDaemonRights.SoftRestart |
    DreamDaemonRights.SoftShutdown |
    DreamDaemonRights.Restart |
    DreamDaemonRights.Shutdown |
    DreamDaemonRights.Start |
    DreamDaemonRights.SetStartupTimeout |
    DreamDaemonRights.SetHeartbeatInterval |
    DreamDaemonRights.CreateDump |
    DreamDaemonRights.SetTopicTimeout |
    DreamDaemonRights.SetAdditionalParameters |
    DreamDaemonRights.SetVisibility;

const minimumRepoPerms =
    RepositoryRights.SetOrigin |
    RepositoryRights.SetSha |
    RepositoryRights.MergePullRequest |
    RepositoryRights.UpdateBranch |
    RepositoryRights.ChangeCommitter |
    RepositoryRights.ChangeTestMergeCommits |
    RepositoryRights.ChangeCredentials |
    RepositoryRights.SetReference |
    RepositoryRights.Read |
    RepositoryRights.ChangeAutoUpdateSettings |
    RepositoryRights.Delete |
    RepositoryRights.ChangeSubmoduleUpdate;

const minimumDeployPerms =
    DreamMakerRights.Read |
    DreamMakerRights.Compile |
    DreamMakerRights.SetApiValidationPort |
    DreamMakerRights.SetDme |
    DreamMakerRights.SetApiValidationRequirement |
    DreamMakerRights.SetTimeout |
    DreamMakerRights.SetSecurityLevel;

const minimumChatPerms = ChatBotRights.Read | ChatBotRights.Create;

const minimumFilePerms =
    ConfigurationRights.Read | ConfigurationRights.List | ConfigurationRights.Write;

class InstanceEdit extends React.Component<IProps, IState> {
    public static tabs: [
        string,
        IconProp,
        (
            instancePermissionSet: InstancePermissionSetResponse,
            generalContext: GeneralContext
        ) => boolean,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ComponentType<any>?
    ][] = [
        ["info", "info", () => true, Config],
        [
            "repository",
            "code-branch",
            instancePermissionSet => !!(instancePermissionSet.repositoryRights & minimumRepoPerms),
            Repository
        ],
        [
            "deployment",
            "hammer",
            instancePermissionSet =>
                !!(instancePermissionSet.dreamMakerRights & minimumDeployPerms),
            Deployment
        ],
        [
            "dd",
            "server",
            instancePermissionSet =>
                !!(instancePermissionSet.dreamDaemonRights & minimumServerPerms),
            Server
        ],
        [
            "byond",
            "list-ul",
            instancePermissionSet => !!(instancePermissionSet.byondRights & minimumByondPerms),
            Byond
        ],
        [
            "chatbots",
            "comments",
            instancePermissionSet => !!(instancePermissionSet.chatBotRights & minimumChatPerms),
            ChatBots
        ],
        [
            "files",
            "folder-open",
            instancePermissionSet =>
                !!(instancePermissionSet.configurationRights & minimumFilePerms),
            Files
        ],
        ["users", "users", () => true, InstancePermissions],
        ["jobs", "stream", () => true, JobHistory]
    ];
    public declare context: GeneralContext;

    public constructor(props: IProps) {
        super(props);

        this.reloadInstance = this.reloadInstance.bind(this);
        this.deleteContextError = this.deleteContextError.bind(this);

        RouteData.selectedinstanceid = parseInt(this.props.match.params.id);

        this.state = {
            tab: props.match.params.tab ?? InstanceEdit.tabs[0][0],
            errors: new Set(),
            instance: null,
            instancePermissionSet: null,
            reloadInstance: this.reloadInstance,
            deleteError: this.deleteContextError,
            instanceid: parseInt(this.props.match.params.id)
        };
    }

    public deleteContextError(error: InternalError): void {
        this.setState(prev => {
            const newSet = new Set(prev.errors);
            newSet.delete(error);
            return {
                errors: newSet
            };
        });
    }

    public async componentDidMount(): Promise<void> {
        await this.reloadInstance();
    }

    public componentDidUpdate(prevProps: Readonly<IProps>) {
        if (
            this.props.match.params.tab &&
            prevProps.match.params.tab != this.props.match.params.tab
        ) {
            this.setState({
                tab: this.props.match.params.tab
            });
        }
    }

    public async reloadInstance(): Promise<void> {
        this.setState({
            instance: null,
            instancePermissionSet: null
        });
        const response = await InstanceClient.getInstance(this.state.instanceid);
        if (response.code === StatusCode.OK) {
            this.setState({
                instance: response.payload
            });

            const response2 = await InstancePermissionSetClient.getCurrentInstancePermissionSet(
                this.state.instanceid,
                true
            );
            if (response2.code === StatusCode.OK) {
                this.setState({
                    instancePermissionSet: response2.payload
                });
            } else {
                this.setState(prev => {
                    const newSet = new Set(prev.errors);
                    newSet.add(response2.error);
                    return {
                        instancePermissionSet: null,
                        errors: newSet
                    };
                });
            }
        } else {
            this.setState(prev => {
                const newSet = new Set(prev.errors);
                newSet.add(response.error);
                return {
                    instance: null,
                    errors: newSet
                };
            });
        }
    }

    public render(): React.ReactNode {
        if (!this.state.instance || !this.state.instancePermissionSet) {
            return <Loading text="loading.instance" />;
        }

        const nav = () => {
            return (
                <Nav
                    defaultActiveKey={this.state.tab}
                    onSelect={eventKey => {
                        eventKey = eventKey ?? InstanceEdit.tabs[0][0];
                        RouteData.selectedinstanceedittab = eventKey;
                        this.props.history.push(
                            AppRoutes.instanceedit.link ?? AppRoutes.instanceedit.route
                        );
                        this.setState({ tab: eventKey ?? InstanceEdit.tabs[0][0] });
                    }}
                    fill
                    variant="pills"
                    activeKey={this.state.tab}
                    className={
                        "flex-nowrap text-nowrap flex-column hover-bar sticky-top " +
                        (configOptions.instanceeditsidebar.value === InstanceEditSidebar.COLLAPSE
                            ? "pin-close"
                            : configOptions.instanceeditsidebar.value === InstanceEditSidebar.EXPAND
                            ? "pin-open"
                            : "")
                    }
                    style={{ top: "8em" }}>
                    {InstanceEdit.tabs.map(([tabKey, icon, accessCb, component]) => {
                        if (!this.state.instancePermissionSet) {
                            throw Error(
                                "this.state.instancePermissionSet is null in instanceedit nav map"
                            );
                        }
                        const wip = !component;
                        const accessDenied = !accessCb(
                            this.state.instancePermissionSet,
                            this.context
                        );

                        return (
                            <Nav.Item key={tabKey}>
                                <Nav.Link
                                    eventKey={tabKey}
                                    bsPrefix="nav-link instanceedittab"
                                    className={
                                        (wip ? "no-access text-white" : "") +
                                        (accessDenied ? "no-access text-white font-italic" : "") +
                                        " text-left"
                                    }>
                                    <React.Fragment>
                                        <FontAwesomeIcon
                                            icon={accessDenied ? "lock" : icon}
                                            fixedWidth
                                        />
                                        <div
                                            className={
                                                "tab-text d-inline-block " +
                                                (accessDenied ? "font-weight-lighter" : "")
                                            }>
                                            <span className="pl-1">
                                                <FormattedMessage
                                                    id={`view.instanceedit.tabs.${tabKey}`}
                                                />
                                            </span>
                                        </div>
                                    </React.Fragment>
                                </Nav.Link>
                            </Nav.Item>
                        );
                    })}
                </Nav>
            );
        };

        return (
            <InstanceEditContext.Provider
                value={
                    Object.assign(
                        { user: this.context.user, serverInfo: this.context.serverInfo },
                        this.state
                    ) as InstanceEditContext
                }>
                <Card className="behind-nav">
                    <Card.Header className="text-center mb-2 sticky-top">
                        <h3>
                            <FormattedMessage
                                id="view.instanceedit.title"
                                values={{
                                    instanceid: this.props.match.params.id,
                                    instancename: this.state.instance.name
                                }}
                            />
                        </h3>
                        <h5 className="text-white-50">
                            <FormattedMessage id={`view.instanceedit.tabs.${this.state.tab}`} />
                        </h5>
                    </Card.Header>
                    <Tab.Container
                        mountOnEnter
                        unmountOnExit
                        id="instanceedit"
                        activeKey={this.state.tab}>
                        <div className="d-flex flex-row z-front">
                            <Card.Body className="flex-grow-0">{nav()}</Card.Body>
                            <Card.Body className="bg-body">
                                <Tab.Content>
                                    {InstanceEdit.tabs.map(([tabKey, , accessCb, Comp]) => {
                                        if (!this.state.instancePermissionSet) {
                                            throw Error(
                                                "this.state.instancePermissionSet is null in render card map"
                                            );
                                        }
                                        return (
                                            <Tab.Pane eventKey={tabKey} key={tabKey}>
                                                {Comp ? (
                                                    !accessCb(
                                                        this.state.instancePermissionSet,
                                                        this.context
                                                    ) ? (
                                                        <AccessDenied />
                                                    ) : (
                                                        <Comp />
                                                    )
                                                ) : (
                                                    <WIPNotice />
                                                )}
                                            </Tab.Pane>
                                        );
                                    })}
                                </Tab.Content>
                            </Card.Body>
                        </div>
                    </Tab.Container>
                </Card>
            </InstanceEditContext.Provider>
        );
    }
}

InstanceEdit.contextType = GeneralContext;
export default withRouter(InstanceEdit);
