import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { Alert, Col, Form, InputGroup, Tab, Tabs } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { FormattedMessage } from "react-intl";
import { RouteComponentProps, withRouter } from "react-router-dom";

import {
    AdministrationRights,
    ByondRights,
    ChatBotRights,
    ConfigurationRights,
    DreamDaemonRights,
    DreamMakerRights,
    InstanceManagerRights,
    InstancePermissionSetResponse,
    InstancePermissionSetRights,
    InstanceResponse,
    RepositoryRights,
    UserGroup,
    UserResponse
} from "../../../../ApiClient/generatedcode/generated";
import InstanceClient from "../../../../ApiClient/InstanceClient";
import InstancePermissionSetClient from "../../../../ApiClient/InstancePermissionSetClient";
import InternalError, { ErrorCode } from "../../../../ApiClient/models/InternalComms/InternalError";
import { StatusCode } from "../../../../ApiClient/models/InternalComms/InternalStatus";
import UserClient from "../../../../ApiClient/UserClient";
import UserGroupClient from "../../../../ApiClient/UserGroupClient";
import { InstanceEditContext } from "../../../../contexts/InstanceEditContext";
import {
    hasAdminRight,
    hasInstanceManagerRight,
    hasInstancePermRight,
    resolvePermissionSet
} from "../../../../utils/misc";
import { AppRoutes, RouteData } from "../../../../utils/routes";
import ErrorAlert from "../../../utils/ErrorAlert";
import InputField, { AnyEnum, FieldType } from "../../../utils/InputField";
import { DebugJsonViewer } from "../../../utils/JsonViewer";
import Loading from "../../../utils/Loading";

interface IProps extends RouteComponentProps {}

interface Permission {
    readonly bitflag: number;
    readonly currentVal: boolean;
}

interface IState {
    errors: Array<InternalError<ErrorCode> | undefined>;
    loading: boolean;
    loadingPerms: boolean;
    instanceNeedsReload: boolean;
    tab: string;
    users?: UserResponse[] | null;
    groups?: UserGroup[] | null;
    instancePermissionSets?: InstancePermissionSetResponse[];
    selectedPermissionSetId: number;
    userPermissions: InstancePermissionSetResponse;
    currentPermissions?: InstancePermissionSetResponse | null;
    permsinstancepermissionset: { [key: string]: Permission };
    permsrepository: { [key: string]: Permission };
    permsbyond: { [key: string]: Permission };
    permsdreammaker: { [key: string]: Permission };
    permsdreamdaemon: { [key: string]: Permission };
    permschatbots: { [key: string]: Permission };
    permsconfiguration: { [key: string]: Permission };
}

class InstancePermissions extends React.Component<IProps, IState> {
    public declare context: InstanceEditContext;

    public constructor(props: IProps) {
        super(props);

        this.loadCurrentPermissions = this.loadCurrentPermissions.bind(this);
        this.createPermissionSetForCurrent = this.createPermissionSetForCurrent.bind(this);
        this.grantPermissions = this.grantPermissions.bind(this);

        this.state = {
            errors: [],
            loading: true,
            loadingPerms: true,
            instanceNeedsReload: false,
            tab: "instancepermissionsetperms",
            userPermissions: {
                permissionSetId: 0,
                instancePermissionSetRights: 0,
                repositoryRights: 0,
                byondRights: 0,
                dreamMakerRights: 0,
                dreamDaemonRights: 0,
                chatBotRights: 0,
                configurationRights: 0
            }, // updated correctly in DidMount using context
            selectedPermissionSetId: 0,
            permsinstancepermissionset: {},
            permsrepository: {},
            permsbyond: {},
            permsdreammaker: {},
            permsdreamdaemon: {},
            permschatbots: {},
            permsconfiguration: {}
        };
    }

    private loadEnums(newPermissionSet: InstancePermissionSetResponse): void {
        this.setState({
            currentPermissions: newPermissionSet
        });

        const loadEnum = <
            T extends Record<string, string | number>,
            U extends keyof typeof newPermissionSet,
            V extends keyof typeof this.state
        >(
            permEnum: T,
            permSourceField: U,
            permTargetField: V
        ) => {
            Object.entries(permEnum).forEach(([k, v]) => {
                /* enums are objects that are reverse mapped, for example, an enum with a = 1 and b = 2 would look like this:
                 * {
                 *   "a": 1,
                 *   "b": 2,
                 *   1: "a",
                 *   2: "b"
                 * }
                 * so we need to drop everything that doesnt resolve to a string because otherwise we end up with twice the values
                 */
                if (!isNaN(parseInt(k))) return;

                const key = k.toLowerCase();
                const val = v as number;

                //we dont care about nothing
                if (key == "none") return;

                const currentVal = !!(newPermissionSet[permSourceField] & val);
                this.setState(
                    prevState =>
                        (({
                            [permTargetField]: {
                                ...(prevState[permTargetField] as Record<string, Permission>),
                                [key]: {
                                    currentVal: currentVal,
                                    bitflag: val
                                }
                            }
                        } as unknown) as IState)
                );
            });
        };

        loadEnum(
            InstancePermissionSetRights,
            "instancePermissionSetRights",
            "permsinstancepermissionset"
        );
        loadEnum(RepositoryRights, "repositoryRights", "permsrepository");
        loadEnum(ByondRights, "byondRights", "permsbyond");
        loadEnum(DreamMakerRights, "dreamMakerRights", "permsdreammaker");
        loadEnum(DreamDaemonRights, "dreamDaemonRights", "permsdreamdaemon");
        loadEnum(ChatBotRights, "chatBotRights", "permschatbots");
        loadEnum(ConfigurationRights, "configurationRights", "permsconfiguration");
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

    private async loadCurrentPermissions(selectedPermissionSetId: number) {
        this.setState({
            loadingPerms: true
        });

        if (selectedPermissionSetId === resolvePermissionSet(this.context.user).id) {
            // This can hit the cache and seem "too" fast.
            // slow it down a little
            const sanicSpeedLimit = new Promise(r => setTimeout(r, 200));
            const response = await InstancePermissionSetClient.getCurrentInstancePermissionSet(
                this.context.instance.id,
                true
            );
            await sanicSpeedLimit;
            if (response.code === StatusCode.OK) {
                this.setState({
                    userPermissions: response.payload
                });

                this.loadEnums(response.payload);
            } else {
                this.addError(response.error);
            }
        } else if (
            hasInstancePermRight(
                this.context.instancePermissionSet,
                InstancePermissionSetRights.Read
            )
        ) {
            const response = await InstancePermissionSetClient.getByPermissionSetId(
                this.context.instance.id,
                selectedPermissionSetId
            );
            if (response.code === StatusCode.OK) {
                this.loadEnums(response.payload);
            } else if (response.error.code != ErrorCode.NO_DB_ENTITY) {
                this.addError(response.error);
            } else {
                // null it out, meaning it can be created
                this.setState({
                    currentPermissions: null
                });
            }
        }

        this.setState({
            loadingPerms: false
        });
    }

    private async loadUsersAndGroups(): Promise<void> {
        const permissionSet = resolvePermissionSet(this.context.user);

        if (!hasAdminRight(permissionSet, AdministrationRights.ReadUsers)) {
            // leave as null so we know to use local data to parse
            this.setState({
                groups: null,
                users: null
            });
            return;
        }

        let loadedFromRemote = false;

        // load all users
        const usersResponsePromise = UserClient.listUsers({
            page: 1,
            pageSize: 100
        });
        const groupsResponse = await UserGroupClient.listGroups({
            page: 1,
            pageSize: 100
        });

        loadedFromRemote = true;
        if (groupsResponse.code === StatusCode.OK) {
            this.setState({
                groups: groupsResponse.payload.content
            });
        } else {
            this.addError(groupsResponse.error);
            loadedFromRemote = false;
        }

        // only add in users whose permission sets aren't covered by groups
        const usersResponse = await usersResponsePromise;
        if (usersResponse.code === StatusCode.OK) {
            this.setState({
                users: usersResponse.payload.content.filter(userResponse => !userResponse.group)
            });
        } else {
            this.addError(usersResponse.error);
            loadedFromRemote = false;
        }

        if (!loadedFromRemote) {
            if (this.context.user.group) {
                // best we can do
                this.setState({
                    groups: [this.context.user.group],
                    users: []
                });
            } else {
                this.setState({
                    groups: [],
                    users: [this.context.user]
                });
            }
        }
    }

    private async loadAllPermissionSets(): Promise<void> {
        let loadedPermissionSets = false;
        if (
            hasInstancePermRight(
                this.context.instancePermissionSet,
                InstancePermissionSetRights.Read
            )
        ) {
            const response = await InstancePermissionSetClient.listInstancePermissionSets(
                this.context.instance.id,
                {
                    page: 1,
                    pageSize: 100
                }
            );
            if (response.code === StatusCode.OK) {
                this.setState({
                    instancePermissionSets: response.payload.content
                });
                loadedPermissionSets = true;
            } else {
                this.addError(response.error);
            }
        }

        if (!loadedPermissionSets) {
            this.setState({
                instancePermissionSets: [this.context.instancePermissionSet]
            });
        }
    }

    private async createPermissionSetForCurrent(): Promise<void> {
        const response = await InstancePermissionSetClient.createInstancePermissionSet(
            this.context.instance.id,
            {
                permissionSetId: this.state.selectedPermissionSetId
            }
        );

        if (response.code != StatusCode.OK) {
            this.addError(response.error);
        } else {
            this.setState({
                currentPermissions: response.payload
            });
        }
    }

    private async grantPermissions(): Promise<void> {
        // permissions checked on input
        const instanceedit = await InstanceClient.grantPermissions(({
            id: this.context.instance.id
        } as unknown) as InstanceResponse);

        if (instanceedit.code != StatusCode.OK) {
            this.addError(instanceedit.error);
        } else {
            await this.loadCurrentPermissions(this.state.selectedPermissionSetId);
        }
    }

    private async deletePermissionSet(): Promise<void> {
        if (
            !confirm(
                "Are you sure you want to delete this permission set? The selected user/group will lose access to the instance."
            )
        ) {
            return;
        }

        const response = await InstancePermissionSetClient.deleteInstancePermissionSet(
            this.context.instance.id,
            this.state.selectedPermissionSetId
        );

        // no entity is good enough for us
        if (response.code != StatusCode.OK && response.error.code != ErrorCode.NO_DB_ENTITY) {
            this.addError(response.error);
        } else if (
            this.state.selectedPermissionSetId === resolvePermissionSet(this.context.user).id
        ) {
            // kick 'em out
            RouteData.selectedinstanceid = undefined;
            this.props.history.push(AppRoutes.instancelist.link ?? AppRoutes.instancelist.route);
        } else {
            this.setState({
                currentPermissions: null
            });
        }
    }

    public async componentDidMount(): Promise<void> {
        const currentPermissionSetId = resolvePermissionSet(this.context.user).id!;
        this.setState({
            selectedPermissionSetId: currentPermissionSetId,
            userPermissions: this.context.instancePermissionSet
        });

        const prom = this.loadCurrentPermissions(currentPermissionSetId);
        const prom2 = this.loadAllPermissionSets();
        await this.loadUsersAndGroups();
        await prom;
        await prom2;

        this.setState({
            loading: false
        });
    }

    public async componentWillUnmount(): Promise<void> {
        if (this.state.instanceNeedsReload) {
            await this.context.reloadInstance();
        }
    }

    public render(): React.ReactNode {
        if (this.state.loading) {
            return <Loading text="loading.instance" />;
        }

        const ownersMap = new Map<string, number>();
        const ownersList: AnyEnum = {};

        if (this.state.users && this.state.groups) {
            this.state.users?.forEach(user => {
                const key = `User: ${user.name}${user.id === this.context.user.id ? " (You)" : ""}`;
                ownersMap.set(key, user.permissionSet!.id!);
                ownersList[key] = user.permissionSet!.id!;
            });
            this.state.groups?.forEach(group => {
                const key = `Group: ${group.name}${
                    group.id === this.context.user.group?.id ? " (Your Group)" : ""
                }`;
                ownersMap.set(key, group.permissionSet.id!);
                ownersList[key] = group.permissionSet.id!;
            });
        } else {
            if (this.context.user.group) {
                const key = `Group: ${this.context.user.group.name} (Your Group)`;
                ownersMap.set(key, this.context.user.group.permissionSet.id!);
                ownersList[key] = this.context.user.group.permissionSet.id!;
            } else {
                const key = `User: ${this.context.user.name} (You)`;
                ownersMap.set(key, this.context.user.permissionSet!.id!);
                ownersList[key] = this.context.user.permissionSet!.id!;
            }

            this.state.instancePermissionSets?.forEach(instancePermissionSet => {
                if (
                    instancePermissionSet.permissionSetId ===
                    resolvePermissionSet(this.context.user).id
                ) {
                    return;
                }

                const key = `Permission Set ${instancePermissionSet.permissionSetId}`;
                ownersMap.set(key, instancePermissionSet.permissionSetId);
                ownersList[key] = instancePermissionSet.permissionSetId;
            });
        }

        return (
            <div className="text-center">
                <h1>
                    <FormattedMessage id="view.instance.perms" />
                </h1>
                <DebugJsonViewer obj={this.state} />
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
                <InputField
                    name="fields.instance.perms.owner"
                    type={FieldType.Enum}
                    enum={ownersList}
                    noLocalize
                    defaultValue={this.state.selectedPermissionSetId}
                    disabled={
                        this.context.instancePermissionSet.instancePermissionSetRights ===
                        InstancePermissionSetRights.None
                    }
                    onChange={newPermissionSetId => {
                        this.setState({
                            selectedPermissionSetId: newPermissionSetId
                        });
                        void this.loadCurrentPermissions(newPermissionSetId);
                    }}
                />
                <hr />
                {this.renderPermissionEditor()}
            </div>
        );
    }

    private renderPermissionEditor(): React.ReactNode {
        if (this.state.loadingPerms) {
            return <Loading text="loading.perms" />;
        }

        let canGrant = false;
        let post = <React.Fragment />;
        const currentPermissionSet = resolvePermissionSet(this.context.user);
        if (
            currentPermissionSet.id === this.state.selectedPermissionSetId &&
            hasInstanceManagerRight(currentPermissionSet, InstanceManagerRights.GrantPermissions) &&
            (!this.state.currentPermissions ||
                !hasInstancePermRight(
                    this.state.currentPermissions,
                    InstancePermissionSetRights.Write
                ))
        ) {
            canGrant = true;
            post = (
                <React.Fragment>
                    <hr />
                    <h5>
                        <FormattedMessage id="view.instance.perms.grant.desc" />
                    </h5>
                    <Button variant="success" onClick={() => void this.grantPermissions()}>
                        <FormattedMessage id="view.instance.perms.grant" />
                    </Button>
                </React.Fragment>
            );
        }

        if (!this.state.currentPermissions) {
            const canCreate = hasInstancePermRight(
                this.state.userPermissions,
                InstancePermissionSetRights.Create
            );

            return (
                <div className="text-center mt-2">
                    <h3>
                        <FormattedMessage id="view.instance.perms.missing" />
                    </h3>
                    {canGrant ? (
                        <React.Fragment /> // Realistically, this should never trigger
                    ) : (
                        <React.Fragment>
                            <br />
                            <OverlayTrigger
                                placement="top"
                                overlay={props => (
                                    <Tooltip id="create-ips-tooltop" {...props}>
                                        <FormattedMessage id="view.instance.perms.create" />
                                    </Tooltip>
                                )}>
                                <Button
                                    variant="success"
                                    disabled={!canCreate}
                                    onClick={() => void this.createPermissionSetForCurrent()}>
                                    <FormattedMessage id="view.instance.perms.create" />
                                </Button>
                            </OverlayTrigger>
                        </React.Fragment>
                    )}
                </div>
            );
        }

        return (
            <React.Fragment>
                {this.renderEditorTabs()}
                {post}
            </React.Fragment>
        );
    }

    private renderEditorTabs(): React.ReactNode {
        const canEdit = hasInstancePermRight(
            this.state.userPermissions,
            InstancePermissionSetRights.Write
        );

        return (
            <React.Fragment>
                {canEdit ? (
                    <React.Fragment />
                ) : (
                    <Alert className="clearfix" variant="error">
                        <FormattedMessage id="perms.instancepermissionset.cantedit" />
                    </Alert>
                )}
                <Tabs
                    activeKey={this.state.tab}
                    onSelect={newkey => {
                        if (newkey) {
                            this.setState({
                                tab: newkey
                            });
                        }
                    }}
                    id="permission-tabs"
                    className="justify-content-center mb-3 mt-4 flex-column flex-md-row">
                    <Tab
                        eventKey="instancepermissionsetperms"
                        title={<FormattedMessage id="perms.instancepermissionset" />}>
                        {this.renderPerms(
                            "permsinstancepermissionset",
                            "instancepermissionset",
                            canEdit
                        )}
                    </Tab>
                    <Tab
                        eventKey="repositoryperms"
                        title={<FormattedMessage id="perms.repository" />}>
                        {this.renderPerms("permsrepository", "repository", canEdit)}
                    </Tab>
                    <Tab eventKey="byondperms" title={<FormattedMessage id="perms.byond" />}>
                        {this.renderPerms("permsbyond", "byond", canEdit)}
                    </Tab>
                    <Tab
                        eventKey="dreammakerperms"
                        title={<FormattedMessage id="perms.dreammaker" />}>
                        {this.renderPerms("permsdreammaker", "dreammaker", canEdit)}
                    </Tab>
                    <Tab
                        eventKey="dreamdaemonperms"
                        title={<FormattedMessage id="perms.dreamdaemon" />}>
                        {this.renderPerms("permsdreamdaemon", "dreamdaemon", canEdit)}
                    </Tab>
                    <Tab eventKey="chatbotsperms" title={<FormattedMessage id="perms.chatbots" />}>
                        {this.renderPerms("permschatbots", "chatbots", canEdit)}
                    </Tab>
                    <Tab
                        eventKey="configurationperms"
                        title={<FormattedMessage id="perms.configuration" />}>
                        {this.renderPerms("permsconfiguration", "configuration", canEdit)}
                    </Tab>
                </Tabs>
                {this.state.tab === "instancepermissionsetperms" ? (
                    <React.Fragment>
                        <br />
                        <Button variant="danger" onClick={() => void this.deletePermissionSet()}>
                            <FormattedMessage id="view.instance.perms.delete" />
                        </Button>
                    </React.Fragment>
                ) : (
                    <React.Fragment />
                )}
            </React.Fragment>
        );
    }

    private renderPerms(
        enumname:
            | "permsinstancepermissionset"
            | "permsrepository"
            | "permsbyond"
            | "permsdreammaker"
            | "permsdreamdaemon"
            | "permschatbots"
            | "permsconfiguration",
        permprefix: string,
        canEdit: boolean
    ): React.ReactNode {
        const inputs: Record<
            string,
            { input: React.RefObject<HTMLInputElement>; field: React.RefObject<HTMLDivElement> }
        > = {};
        const setBold = (
            inputRef: React.RefObject<HTMLInputElement>,
            fieldRef: React.RefObject<HTMLDivElement>,
            defaultVal: boolean
        ) => {
            if (!inputRef.current || !fieldRef.current) return;
            if (inputRef.current.checked !== defaultVal) {
                fieldRef.current.classList.add("font-weight-bold");
            } else {
                fieldRef.current.classList.remove("font-weight-bold");
            }
        };
        const setAll = (val: boolean): (() => void) => {
            return () => {
                for (const [permname, refs] of Object.entries(inputs)) {
                    if (!refs.input.current) return;

                    refs.input.current.checked = val;
                    setBold(refs.input, refs.field, this.state[enumname][permname].currentVal);
                }
            };
        };
        const resetAll = () => {
            for (const [permname, refs] of Object.entries(inputs)) {
                if (!refs.input.current) continue;

                refs.input.current.checked = this.state[enumname][permname].currentVal;
                setBold(refs.input, refs.field, this.state[enumname][permname].currentVal);
            }
        };
        const save = async () => {
            this.setState({
                loadingPerms: true
            });

            let bitflag = 0;

            for (const [permname, refs] of Object.entries(inputs)) {
                if (!refs.input.current) continue;

                bitflag += refs.input.current.checked ? this.state[enumname][permname].bitflag : 0;
            }

            if (!this.state.currentPermissions) {
                this.addError(
                    new InternalError(ErrorCode.APP_FAIL, {
                        jsError: Error("this.state.user is null in user edit save")
                    })
                );
                return;
            }

            let rightsType: string;
            switch (enumname) {
                case "permsinstancepermissionset":
                    rightsType = "InstancePermissionSetRights";
                    break;
                case "permsrepository":
                    rightsType = "RepositoryRights";
                    break;
                case "permsbyond":
                    rightsType = "ByondRights";
                    break;
                case "permsdreammaker":
                    rightsType = "DreamMakerRights";
                    break;
                case "permsdreamdaemon":
                    rightsType = "DreamDaemonRights";
                    break;
                case "permschatbots":
                    rightsType = "ChatBotRights";
                    break;
                case "permsconfiguration":
                    rightsType = "ConfigurationRights";
                    break;
            }

            const newset = Object.assign(Object.assign({}, this.state.currentPermissions), {
                [rightsType]: bitflag
            } as { InstancePermissionSetRights: InstancePermissionSetRights } | { RepositoryRights: RepositoryRights } | { ByondRights: ByondRights } | { DreamMakerRights: DreamMakerRights } | { DreamDaemonRights: DreamDaemonRights } | { ChatBotRights: ChatBotRights } | { ConfigurationRights: ConfigurationRights });

            const response = await InstancePermissionSetClient.updateInstancePermissionSet(
                this.context.instance.id,
                newset
            );

            if (response.code == StatusCode.OK) {
                if (newset.permissionSetId === this.state.userPermissions?.permissionSetId) {
                    this.setState({
                        userPermissions: response.payload,
                        instanceNeedsReload: true
                    });
                }

                this.loadEnums(response.payload);
            } else {
                this.addError(response.error);
            }

            this.setState({
                loadingPerms: false
            });
        };

        return (
            <React.Fragment>
                {canEdit ? (
                    <React.Fragment>
                        <h5>
                            <FormattedMessage id="generic.setall" />
                        </h5>
                        <Button onClick={setAll(true)}>
                            <FormattedMessage id="generic.true" />
                        </Button>{" "}
                        <Button onClick={setAll(false)}>
                            <FormattedMessage id="generic.false" />
                        </Button>{" "}
                        <Button onClick={resetAll}>
                            <FormattedMessage id="generic.reset" />
                        </Button>
                    </React.Fragment>
                ) : (
                    ""
                )}
                <Col md={8} lg={7} xl={6} className="mx-auto">
                    <hr />
                    {Object.entries(this.state[enumname]).map(([perm, value]) => {
                        const inputRef = React.createRef<HTMLInputElement>();
                        const fieldRef = React.createRef<HTMLDivElement>();
                        inputs[perm] = { input: inputRef, field: fieldRef };
                        return (
                            <InputGroup key={perm} as="label" htmlFor={perm} className="mb-0">
                                <InputGroup.Prepend className="flex-grow-1 overflow-auto">
                                    <OverlayTrigger
                                        overlay={
                                            <Tooltip id={`perms.${permprefix}.${perm}.desc`}>
                                                <FormattedMessage
                                                    id={`perms.${permprefix}.${perm}.desc`}
                                                />
                                            </Tooltip>
                                        }>
                                        {({ ref, ...triggerHandler }) => (
                                            <InputGroup.Text className="flex-fill" ref={fieldRef}>
                                                <div {...triggerHandler}>
                                                    <FormattedMessage
                                                        id={`perms.${permprefix}.${perm}`}
                                                    />
                                                </div>
                                                <div className="ml-auto d-flex align-items-center">
                                                    <Form.Check
                                                        inline
                                                        type="switch"
                                                        custom
                                                        id={perm}
                                                        className="d-flex justify-content-center align-content-center mx-2"
                                                        label=""
                                                        ref={inputRef}
                                                        disabled={!canEdit}
                                                        defaultChecked={value.currentVal}
                                                        onChange={() => {
                                                            setBold(
                                                                inputRef,
                                                                fieldRef,
                                                                value.currentVal
                                                            );
                                                        }}
                                                    />
                                                    <div
                                                        {...triggerHandler}
                                                        ref={ref as React.Ref<HTMLDivElement>}>
                                                        <FontAwesomeIcon fixedWidth icon="info" />
                                                    </div>
                                                </div>
                                            </InputGroup.Text>
                                        )}
                                    </OverlayTrigger>
                                </InputGroup.Prepend>
                            </InputGroup>
                        );
                    })}
                    <hr />
                </Col>
                {canEdit ? (
                    <Button onClick={save}>
                        <FormattedMessage id="generic.savepage" />
                    </Button>
                ) : (
                    ""
                )}
            </React.Fragment>
        );
    }
}

InstancePermissions.contextType = InstanceEditContext;
export default withRouter(InstancePermissions);
