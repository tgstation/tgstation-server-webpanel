import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Modifier } from "@popperjs/core";
import React, { ComponentType } from "react";
import Card from "react-bootstrap/Card";
import Dropdown from "react-bootstrap/Dropdown";
import Nav from "react-bootstrap/Nav";
import Tab from "react-bootstrap/Tab";
import { FormattedMessage } from "react-intl";
import { RouteComponentProps, withRouter } from "react-router";

import InstanceClient from "../../../ApiClient/InstanceClient";
import InstancePermissionSetClient from "../../../ApiClient/InstancePermissionSetClient";
import InternalError from "../../../ApiClient/models/InternalComms/InternalError";
import { StatusCode } from "../../../ApiClient/models/InternalComms/InternalStatus";
import { GeneralContext } from "../../../contexts/GeneralContext";
import {
    InstanceEditContext,
    UnsafeInstanceEditContext
} from "../../../contexts/InstanceEditContext";
import { AppRoutes, RouteData } from "../../../utils/routes";
import Loading from "../../utils/Loading";
import WIPNotice from "../../utils/WIPNotice";
import Byond from "./Edit/Byond";
import Info from "./Edit/Info";

type IProps = RouteComponentProps<{ id: string; tab?: string }>;
type IState = Omit<UnsafeInstanceEditContext, "user" | "serverInfo"> & {
    tab: string;
    instanceid: number;
};

class InstanceEdit extends React.Component<IProps, IState> {
    public declare context: GeneralContext;
    public static tabs: [string, IconProp, ComponentType?][] = [
        ["info", "info", Info],
        ["repository", "code-branch"],
        ["deployment", "hammer"],
        ["byond", "list-ul"],
        ["chatbots", "comments"],
        ["files", "folder-open"],
        ["users", "users"],
        ["config", "cogs"]
    ];

    public constructor(props: IProps) {
        super(props);

        this.reloadInstance = this.reloadInstance.bind(this);
        this.deleteContextError = this.deleteContextError.bind(this);

        RouteData.instanceid = this.props.match.params.id;

        this.state = {
            tab: props.match.params.tab || InstanceEdit.tabs[0][0],
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

    public async reloadInstance(): Promise<void> {
        const response = await InstanceClient.getInstance(this.state.instanceid);
        if (response.code === StatusCode.OK) {
            this.setState({
                instance: response.payload
            });

            const response2 = await InstancePermissionSetClient.getCurrentInstancePermissionSet(
                this.state.instanceid
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

        const nav = (vertical: boolean) => {
            if (vertical) {
                const active = InstanceEdit.tabs.find(value => value[0] === this.state.tab);

                if (!active) throw "InstanceEdit: unable to find active tab";

                // eslint-disable-next-line @typescript-eslint/ban-types
                const bottomPlacement: Modifier<"bottomPlacement", {}> = {
                    name: "bottomPlacement",
                    enabled: true,
                    phase: "beforeMain",
                    fn: ({ state }) => {
                        if (state.placement != "bottom") {
                            state.placement = "bottom";
                            state.reset = true;
                        }
                    }
                };

                return (
                    <Dropdown
                        onSelect={eventKey => {
                            eventKey = eventKey || InstanceEdit.tabs[0][0];
                            RouteData.selectedinstanceedittab = eventKey;
                            this.props.history.push(
                                AppRoutes.instanceedit.link || AppRoutes.instanceedit.route
                            );
                            this.setState({ tab: eventKey || InstanceEdit.tabs[0][0] });
                        }}>
                        <Dropdown.Toggle
                            variant="secondary"
                            id="tabselect"
                            className="d-block mx-auto w-75 text-center">
                            <FontAwesomeIcon icon={active[1]} className="mr-1" />
                            <FormattedMessage id={`view.instanceedit.tabs.${active[0]}`} />
                        </Dropdown.Toggle>
                        <Dropdown.Menu
                            popperConfig={{ modifiers: [bottomPlacement] }}
                            className="d-block mx-auto w-75 text-center">
                            {InstanceEdit.tabs.map(value => {
                                if (value === active) return;
                                if (value[2] === undefined) return;

                                return (
                                    <Dropdown.Item key={value[0]} eventKey={value[0]}>
                                        <FontAwesomeIcon icon={value[1]} className="mr-1" />
                                        <FormattedMessage
                                            id={`view.instanceedit.tabs.${value[0]}`}
                                        />
                                    </Dropdown.Item>
                                );
                            })}
                        </Dropdown.Menu>
                    </Dropdown>
                );
            }

            return (
                <Nav
                    defaultActiveKey={this.state.tab}
                    onSelect={eventKey => {
                        eventKey = eventKey || InstanceEdit.tabs[0][0];
                        RouteData.selectedinstanceedittab = eventKey;
                        this.props.history.push(
                            AppRoutes.instanceedit.link || AppRoutes.instanceedit.route
                        );
                        this.setState({ tab: eventKey || InstanceEdit.tabs[0][0] });
                    }}
                    fill
                    variant="pills"
                    activeKey={this.state.tab}
                    className="flex-nowrap text-nowrap overflow-auto ">
                    {InstanceEdit.tabs.map(([tabKey, icon, component]) => {
                        return (
                            <Nav.Item key={tabKey}>
                                <Nav.Link
                                    eventKey={tabKey}
                                    bsPrefix="nav-link instanceedittab "
                                    className={!component ? "wip text-white" : ""}>
                                    <React.Fragment>
                                        <FontAwesomeIcon icon={icon} className="mr-1" />
                                        <FormattedMessage id={`view.instanceedit.tabs.${tabKey}`} />
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
                <Card>
                    <Card.Header className="text-center mb-2">
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
                        <Card.Body>
                            <div className="d-block d-xl-none">{nav(true)}</div>
                            <div className="d-none d-xl-block">{nav(false)}</div>
                        </Card.Body>
                        <Card.Body className="bg-body">
                            <Tab.Content>
                                {InstanceEdit.tabs.map(([tabKey, , Comp]) => {
                                    return (
                                        <Tab.Pane eventKey={tabKey} key={tabKey}>
                                            {Comp ? <Comp /> : <WIPNotice />}
                                        </Tab.Pane>
                                    );
                                })}
                            </Tab.Content>
                        </Card.Body>
                    </Tab.Container>
                </Card>
            </InstanceEditContext.Provider>
        );
    }
}
InstanceEdit.contextType = GeneralContext;
export default withRouter(InstanceEdit);
