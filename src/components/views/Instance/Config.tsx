import loadable from "@loadable/component";
import React from "react";
import Button from "react-bootstrap/Button";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import { FormattedMessage } from "react-intl";
import { RouteComponentProps } from "react-router";
import { Link, withRouter } from "react-router-dom";

import { Components } from "../../../ApiClient/generatedcode/_generated";
import InstanceClient from "../../../ApiClient/InstanceClient";
import InternalError, { ErrorCode } from "../../../ApiClient/models/InternalComms/InternalError";
import { StatusCode } from "../../../ApiClient/models/InternalComms/InternalStatus";
import UserClient from "../../../ApiClient/UserClient";
import { GlobalObjects } from "../../../utils/globalObjects";
import { resolvePermissionSet } from "../../../utils/misc";
import { AppRoutes, RouteData } from "../../../utils/routes";
import ErrorAlert from "../../utils/ErrorAlert";
import Loading from "../../utils/Loading";
import WIPNotice from "../../utils/WIPNotice";

interface IProps extends RouteComponentProps<{ id: string; tab?: string }> {}

interface IState {
    instance?: Components.Schemas.Instance;
    loading: boolean;
    errors: Array<InternalError<ErrorCode> | undefined>;
    tab: string;
    currentUser?: Components.Schemas.User;
}

export default withRouter(
    class InstanceConfig extends React.Component<IProps, IState> {
        public constructor(props: IProps) {
            super(props);

            this.loadInstance = this.loadInstance.bind(this);

            RouteData.instanceid = props.match.params.id;
            RouteData.selectedinstanceconfigtab = props.match.params.tab;

            this.state = {
                tab: props.match.params.tab || "settings",
                errors: [],
                loading: true
            };
        }

        public componentDidUpdate(prevProps: Readonly<IProps>) {
            if (prevProps.match.params.tab !== this.props.match.params.tab) {
                this.setState({
                    tab: this.props.match.params.tab || "settings"
                });
            }
        }

        public async componentDidMount() {
            this.setState({
                loading: true
            });

            const response = await UserClient.getCurrentUser();
            if (response.code === StatusCode.OK) {
                this.setState({
                    currentUser: response.payload
                });
            } else {
                this.addError(response.error);
            }

            await this.loadInstance();
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

        public async loadInstance() {
            this.setState({
                loading: true
            });
            const response = await InstanceClient.getInstance(parseInt(this.props.match.params.id));
            if (response.code === StatusCode.OK) {
                this.setState({
                    instance: response.payload
                });
            } else {
                this.addError(response.error);
            }
            this.setState({
                loading: false
            });
        }

        public render(): React.ReactNode {
            if (this.state.loading) {
                return <Loading text="loading.instance" />;
            }

            // noinspection DuplicatedCode
            const changetabs = (newkey: string | null) => {
                if (!newkey) return;

                RouteData.instanceid = this.props.match.params.id;
                RouteData.selectedinstanceconfigtab = newkey;
                if (!GlobalObjects.setupMode) {
                    window.history.pushState(
                        null,
                        window.document.title,
                        AppRoutes.instanceconfig.link || AppRoutes.instanceconfig.route
                    );
                }
                this.setState({
                    tab: newkey
                });
            };
            const LoadSpin = <Loading text={"loading.page"} />;

            //should always be a react component
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            const InstanceSettings = loadable(() => import(`./Config/InstanceSettings`), {
                fallback: LoadSpin
            });

            return (
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
                    {this.state.instance ? (
                        <h3>{`${this.state.instance.name} (${this.state.instance.id})`}</h3>
                    ) : (
                        <h3>
                            <FormattedMessage id="generic.assert.noinstance" />
                        </h3>
                    )}
                    <Button
                        as={Link}
                        to={AppRoutes.instancelist.link || AppRoutes.instancelist.route}>
                        <FormattedMessage id="generic.goback" />
                    </Button>
                    <Tabs
                        className="justify-content-center mb-3 mt-4 flex-column flex-md-row"
                        activeKey={this.state.tab}
                        onSelect={changetabs}>
                        <Tab
                            eventKey="settings"
                            title={<FormattedMessage id="view.instance.config.instancesettings" />}>
                            {this.state.instance && this.state.currentUser ? (
                                <InstanceSettings
                                    instance={this.state.instance}
                                    loadInstance={this.loadInstance}
                                    selfPermissionSet={resolvePermissionSet(this.state.currentUser)}
                                />
                            ) : (
                                <FormattedMessage id="generic.assert.noinstance" />
                            )}
                        </Tab>
                        <Tab
                            eventKey="users"
                            title={<FormattedMessage id="view.instance.config.instanceusers" />}>
                            <WIPNotice />
                        </Tab>
                        <Tab
                            eventKey="chatbots"
                            title={<FormattedMessage id="view.instance.config.chatbots" />}>
                            <WIPNotice />
                        </Tab>
                    </Tabs>
                </div>
            );
        }
    }
);
