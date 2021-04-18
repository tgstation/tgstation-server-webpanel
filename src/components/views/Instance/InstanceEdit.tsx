import React from "react";
import Card from "react-bootstrap/Card";
import Nav from "react-bootstrap/Nav";
import Tab from "react-bootstrap/Tab";
import { FormattedMessage } from "react-intl";
import { RouteComponentProps, withRouter } from "react-router";

import InstanceClient from "../../../ApiClient/InstanceClient";
import InternalError from "../../../ApiClient/models/InternalComms/InternalError";
import { StatusCode } from "../../../ApiClient/models/InternalComms/InternalStatus";
import { GeneralContext } from "../../../contexts/GeneralContext";
import {
    InstanceEditContext,
    UnsafeInstanceEditContext
} from "../../../contexts/InstanceEditContext";
import { AppRoutes, RouteData } from "../../../utils/routes";
import Loading from "../../utils/Loading";

type IProps = RouteComponentProps<{ id: string; tab?: string }>;
type IState = Omit<UnsafeInstanceEditContext, "user" | "serverInfo"> & {
    tab: string;
};

class InstanceEdit extends React.Component<IProps, IState> {
    public declare context: GeneralContext;
    public static tabs = ["info", "catboys"];

    public constructor(props: IProps) {
        super(props);

        this.reloadInstance = this.reloadInstance.bind(this);
        this.deleteContextError = this.deleteContextError.bind(this);

        this.state = {
            tab: props.match.params.tab || InstanceEdit.tabs[0],
            errors: new Set(),
            instance: null,
            reloadInstance: this.reloadInstance,
            deleteError: this.deleteContextError
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
        const response = await InstanceClient.getInstance(parseInt(this.props.match.params.id));
        if (response.code === StatusCode.OK) {
            this.setState({
                instance: response.payload
            });
        } else {
            this.setState(prev => {
                const newSet = new Set(prev.errors);
                newSet.add(response.error);
                return {
                    errors: newSet
                };
            });
        }
    }

    public render(): React.ReactNode {
        if (!this.state.instance) {
            return <Loading text="loading.instance" />;
        }

        return (
            <InstanceEditContext.Provider
                value={
                    Object.assign(
                        { user: this.context.user, serverInfo: this.context.serverInfo },
                        this.state
                    ) as InstanceEditContext
                }>
                <Card>
                    <Card.Header>
                        <h3 className="text-center mb-2">
                            <FormattedMessage
                                id="view.instanceedit.title"
                                values={{
                                    instanceid: this.props.match.params.id,
                                    instancename: this.state.instance.name
                                }}
                            />
                        </h3>
                    </Card.Header>
                    <Tab.Container
                        defaultActiveKey={InstanceEdit.tabs[0]}
                        onSelect={eventKey => {
                            eventKey = eventKey || InstanceEdit.tabs[0];
                            RouteData.selectedinstanceedittab = eventKey;
                            this.props.history.push(
                                AppRoutes.instanceedit.link || AppRoutes.instanceedit.route
                            );
                            this.setState({ tab: eventKey || InstanceEdit.tabs[0] });
                        }}
                        mountOnEnter
                        unmountOnExit
                        id="instanceedit">
                        <Card.Body>
                            <Nav fill variant="pills" activeKey={this.state.tab}>
                                {InstanceEdit.tabs.map(tabKey => {
                                    return (
                                        <Nav.Item key={tabKey}>
                                            <Nav.Link
                                                eventKey={tabKey}
                                                bsPrefix="nav-link instanceedittab">
                                                <FormattedMessage
                                                    id={`view.instanceedit.tabs.${tabKey}`}
                                                />
                                            </Nav.Link>
                                        </Nav.Item>
                                    );
                                })}
                            </Nav>
                        </Card.Body>
                        <Card.Body className="bg-body">
                            <Tab.Content>
                                {InstanceEdit.tabs.map(tabKey => {
                                    return (
                                        <Tab.Pane eventKey={tabKey} key={tabKey}>
                                            {tabKey}
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
