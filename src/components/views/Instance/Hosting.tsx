import loadable from "@loadable/component";
import React from "react";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Alert from "react-bootstrap/esm/Alert";
import { FormattedMessage } from "react-intl";
import { RouteComponentProps } from "react-router";
import { Link, withRouter } from "react-router-dom";

import { Components } from "../../../ApiClient/generatedcode/_generated";
import InstanceClient from "../../../ApiClient/InstanceClient";
import InstancePermissionSetClient from "../../../ApiClient/InstancePermissionSetClient";
import InternalError, { ErrorCode } from "../../../ApiClient/models/InternalComms/InternalError";
import { StatusCode } from "../../../ApiClient/models/InternalComms/InternalStatus";
import UserClient from "../../../ApiClient/UserClient";
import { HostingTabLocation } from "../../../definitions/constants";
import { GlobalObjects } from "../../../utils/globalObjects";
import { resolvePermissionSet } from "../../../utils/misc";
import { AppRoutes, RouteData } from "../../../utils/routes";
import { ErrorAlert, Loading, WIPNotice } from "../../utils";

interface IProps extends RouteComponentProps<{ id: string; tab?: HostingTabLocation }> {}

interface IState {
    instance?: Components.Schemas.InstanceResponse;
    loading: boolean;
    instanceLoading: boolean;
    errors: Array<InternalError<ErrorCode> | undefined>;
    tab: HostingTabLocation;
    // is this instance on or off?
    online: boolean;
    currentUser?: Components.Schemas.UserResponse;
    currentInstanceUser?: Components.Schemas.InstancePermissionSetResponse;
}

export default withRouter(
    class Hosting extends React.Component<IProps, IState> {
        public constructor(props: IProps) {
            super(props);

            this.loadInstance = this.loadInstance.bind(this);

            RouteData.instanceid = props.match.params.id;
            RouteData.selectedinstancehostingtab = props.match.params.tab;

            this.state = {
                tab: props.match.params.tab || HostingTabLocation.INFO,
                errors: [],
                loading: true,
                instanceLoading: false,
                online: false
            };
        }

        public componentDidUpdate(prevProps: Readonly<IProps>) {
            if (prevProps.match.params.tab !== this.props.match.params.tab) {
                this.setState({
                    tab: this.props.match.params.tab || HostingTabLocation.INFO
                });
            }
        }

        public async componentDidMount() {
            const response = await UserClient.getCurrentUser();
            if (response.code === StatusCode.OK) {
                this.setState({
                    currentUser: response.payload
                });
            } else {
                this.addError(response.error);
            }

            await this.loadInstance();
            this.setState({
                loading: false
            });
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
                instanceLoading: true
            });
            const response = await InstanceClient.getInstance(parseInt(this.props.match.params.id));
            if (response.code === StatusCode.OK) {
                this.setState({
                    instance: response.payload
                });
                if (response.payload.online) {
                    this.setState({
                        online: true
                    });
                    // check to see if the user can even go here
                    const auth = await InstancePermissionSetClient.getCurrentInstancePermissionSet(
                        response.payload.id
                    );
                    this.setState({
                        currentInstanceUser: auth.payload
                    });
                }
            } else if (!response.payload) {
                this.addError(response.error);
            }
            this.setState({
                instanceLoading: false
            });
        }

        public render(): React.ReactNode {
            if (this.state.loading) {
                return <Loading text="loading.instance" />;
            }

            const setTab = (tablocation: HostingTabLocation = HostingTabLocation.INFO) => {
                RouteData.selectedinstancehostingtab = tablocation;
                if (!GlobalObjects.setupMode) {
                    this.setState({
                        tab: tablocation
                    });
                    // Sigh. Routes are being fucking stupid so i have to hardcode it... for now
                    if (this.state?.instance?.id && tablocation == HostingTabLocation.INFO) {
                        window.history.pushState(
                            null,
                            window.document.title,
                            `/instances/hosting/${this.state.instance.id}`
                        );
                        return;
                    }
                    window.history.pushState(
                        null,
                        window.document.title,
                        AppRoutes.instancehosting.link || AppRoutes.instancehosting.route
                    );
                    return;
                }
                // todo: do somthing here
            };

            const LoadSpin = <Loading text={"loading.page"} />;

            //should always be a react component
            const InfoPage = loadable(() => import(`./Hosting/Info`), {
                fallback: LoadSpin
            });

            const ConfigPage = loadable(() => import(`./Hosting/Config`), {
                fallback: LoadSpin
            });

            const RepositoryManager = loadable(() => import(`./Hosting/Config`), {
                fallback: LoadSpin
            });

            const Deployment = loadable(() => import(`./Hosting/Config`), {
                fallback: LoadSpin
            });

            const Chatbot = loadable(() => import(`./Hosting/Chatbot`), {
                fallback: LoadSpin
            });

            return (
                <>
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
                    {this.state.instance?.online &&
                        (!this.state.currentInstanceUser?.instancePermissionSetRights ||
                            !this.state.currentUser) && (
                            <Alert className="clearfix" variant="error">
                                You are not allowed to edit this instance!
                            </Alert>
                        )}
                    <h2>
                        {this.state.instance ? (
                            this.state.instance.name
                        ) : (
                            <FormattedMessage id="generic.assert.noinstance" />
                        )}
                    </h2>
                    <ButtonGroup className={"bttn-group-hosting"}>
                        <Button
                            onClick={() => {
                                setTab(HostingTabLocation.INFO);
                            }}
                            active={this.state.tab === HostingTabLocation.INFO}>
                            <FormattedMessage id="generic.about" />
                        </Button>
                        <Button
                            onClick={() => {
                                setTab(HostingTabLocation.CONFIG);
                            }}
                            disabled={
                                !this.state.instance?.online || !this.state.currentInstanceUser
                            }
                            active={this.state.tab === HostingTabLocation.CONFIG}
                            variant={!this.state.currentInstanceUser ? "danger" : undefined}>
                            <FormattedMessage id="routes.config" />
                        </Button>
                        <Button
                            onClick={() => {
                                setTab(HostingTabLocation.CODE);
                            }}
                            disabled={
                                !this.state.instance?.online || !this.state.currentInstanceUser
                            }
                            active={this.state.tab === HostingTabLocation.CODE}
                            variant={!this.state.currentInstanceUser ? "danger" : undefined}>
                            <FormattedMessage id="routes.instancecode" />
                        </Button>
                        <Button
                            onClick={() => {
                                setTab(HostingTabLocation.DEPLOYMENT);
                            }}
                            disabled={
                                !this.state.instance?.online || !this.state.currentInstanceUser
                            }
                            active={this.state.tab === HostingTabLocation.DEPLOYMENT}
                            variant={!this.state.currentInstanceUser ? "danger" : undefined}>
                            <FormattedMessage id="routes.deployment" />
                        </Button>
                        <Button
                            onClick={() => {
                                setTab(HostingTabLocation.USER);
                            }}
                            disabled={
                                !this.state.instance?.online || !this.state.currentInstanceUser
                            }
                            active={this.state.tab === HostingTabLocation.USER}
                            variant={!this.state.currentInstanceUser ? "danger" : undefined}>
                            <FormattedMessage id="routes.usermanager" />
                        </Button>
                        <Button
                            onClick={() => {
                                setTab(HostingTabLocation.CHATBOT);
                            }}
                            disabled={
                                !this.state.instance?.online || !this.state.currentInstanceUser
                            }
                            active={this.state.tab === HostingTabLocation.CHATBOT}
                            variant={!this.state.currentInstanceUser ? "danger" : undefined}>
                            Bots
                        </Button>
                        <Button
                            onClick={() => {
                                setTab(HostingTabLocation.FILES);
                            }}
                            disabled={
                                !this.state.instance?.online || !this.state.currentInstanceUser
                            }
                            active={this.state.tab === HostingTabLocation.FILES}
                            variant={!this.state.currentInstanceUser ? "danger" : undefined}>
                            Files
                        </Button>
                    </ButtonGroup>
                    <br />
                    <br />
                    {this.state.instance ? (
                        !this.state.currentInstanceUser || !this.state.currentUser ? (
                            this.state.tab === HostingTabLocation.INFO && (
                                <InfoPage instance={this.state.instance} />
                            )
                        ) : (
                            <>
                                {this.state.tab === HostingTabLocation.INFO && (
                                    <InfoPage
                                        instance={this.state.instance}
                                        selfPermissionSet={resolvePermissionSet(
                                            this.state.currentUser
                                        )}
                                        selfInstancePermissionSet={this.state.currentInstanceUser}
                                    />
                                )}
                                {this.state.tab === HostingTabLocation.CONFIG && (
                                    <ConfigPage
                                        instance={this.state.instance}
                                        selfPermissionSet={resolvePermissionSet(
                                            this.state.currentUser
                                        )}
                                        selfInstancePermissionSet={this.state.currentInstanceUser}
                                        loadInstance={this.loadInstance}
                                    />
                                )}
                                {this.state.tab === HostingTabLocation.CODE && (
                                    <RepositoryManager
                                        instance={this.state.instance}
                                        selfPermissionSet={resolvePermissionSet(
                                            this.state.currentUser
                                        )}
                                        selfInstancePermissionSet={this.state.currentInstanceUser}
                                    />
                                )}
                                {this.state.tab === HostingTabLocation.DEPLOYMENT && (
                                    <Deployment
                                        instance={this.state.instance}
                                        selfPermissionSet={resolvePermissionSet(
                                            this.state.currentUser
                                        )}
                                        selfInstancePermissionSet={this.state.currentInstanceUser}
                                    />
                                )}
                                {this.state.tab === HostingTabLocation.USER && <WIPNotice />}
                                {this.state.tab === HostingTabLocation.FILES && <WIPNotice />}
                                {this.state.tab === HostingTabLocation.CHATBOT && (
                                    <Chatbot
                                        instance={this.state.instance}
                                        selfPermissionSet={resolvePermissionSet(
                                            this.state.currentUser
                                        )}
                                        selfInstancePermissionSet={this.state.currentInstanceUser}
                                    />
                                )}
                            </>
                        )
                    ) : (
                        <FormattedMessage id="generic.assert.noinstance" />
                    )}
                    {/* {this.renderOld()} */}
                </>
            );
        }
    }
);
