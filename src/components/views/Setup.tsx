import { UnregisterCallback } from "history";
import React from "react";
import Button from "react-bootstrap/Button";
import { FormattedMessage, injectIntl, WrappedComponentProps } from "react-intl";
import { RouteComponentProps, withRouter } from "react-router-dom";

import { Components } from "../../ApiClient/generatedcode/_generated";
import InternalError, { ErrorCode } from "../../ApiClient/models/InternalComms/InternalError";
import { StatusCode } from "../../ApiClient/models/InternalComms/InternalStatus";
import ServerClient from "../../ApiClient/ServerClient";
import UserClient from "../../ApiClient/UserClient";
import { GlobalObjects } from "../../utils/globalObjects";
import { AppRoutes } from "../../utils/routes";
import ErrorAlert from "../utils/ErrorAlert";
import Loading from "../utils/Loading";
import Configuration from "./Configuration";
import Login from "./Login";
import Create from "./User/Create";

type ExtendedProps = RouteComponentProps<
    Record<string, string>,
    Record<string, string>,
    { setupNavBypass: boolean }
> &
    WrappedComponentProps;

interface IProps extends ExtendedProps {}
interface IState {
    errors: Array<InternalError<ErrorCode> | undefined>;
    loading: boolean;
    step: number;
    username?: string;
    adminUser?: Components.Schemas.User;
}

export default injectIntl(
    withRouter(
        class Setup extends React.Component<IProps, IState> {
            private blockNavigation = true;
            private unregisterBlockCallback?: UnregisterCallback;
            //private historyObject = createMemoryHistory<{ setupNavBypass: boolean }>();

            public constructor(props: IProps) {
                super(props);

                this.beforeUnloadHandler = this.beforeUnloadHandler.bind(this);
                this.state = {
                    loading: true,
                    step: 1,
                    errors: []
                };
                /*this.historyObject.push(AppRoutes.usercreate.link || AppRoutes.usercreate.route);
                this.historyObject.block(({ state }) => {
                    if (!state?.setupNavBypass) {
                        alert(this.props.intl.formatMessage({ id: "view.setup.navigationblock" }));
                        return false;
                    }
                    return;
                });*/
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

            public async componentDidMount(): Promise<void> {
                window.addEventListener("beforeunload", this.beforeUnloadHandler);
                this.unregisterBlockCallback = this.props.history.block(({ state }) => {
                    if (this.blockNavigation && !state?.setupNavBypass) {
                        alert(this.props.intl.formatMessage({ id: "view.setup.navigationblock" }));
                        return false;
                    }
                    return;
                });
                GlobalObjects.setupMode = true;
                UserClient.createAllUsersWithAA = true;

                ServerClient.logout();
                const response = await ServerClient.login({
                    userName: "Admin",
                    password: "ISolemlySwearToDeleteTheDataDirectory"
                });
                this.setState({
                    loading: false
                });
                if (response.code === StatusCode.ERROR) {
                    if (
                        response.error!.code === ErrorCode.LOGIN_FAIL ||
                        response.error!.code === ErrorCode.LOGIN_DISABLED
                    ) {
                        //We failed to login using the default credentials, move on
                        this.blockNavigation = false;
                        this.props.history.push(AppRoutes.home.link || AppRoutes.home.route);
                    } else {
                        this.addError(response.error!);
                    }
                }
                const userresponse = await UserClient.getCurrentUser();
                if (userresponse.code === StatusCode.OK) {
                    this.setState({
                        adminUser: userresponse.payload!
                    });
                } else {
                    this.addError(response.error!);
                }
                //debugger;
            }

            public componentWillUnmount(): void {
                UserClient.createAllUsersWithAA = false;
                window.removeEventListener("beforeunload", this.beforeUnloadHandler);
                GlobalObjects.setupMode = false;
                if (this.unregisterBlockCallback) {
                    this.unregisterBlockCallback();
                }
            }

            private beforeUnloadHandler(event: BeforeUnloadEvent) {
                if (this.blockNavigation) {
                    event.preventDefault();
                }
                return event;
            }

            public render(): React.ReactNode {
                if (this.state.loading) {
                    return <Loading text="loading.login" />;
                }
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
                        <h1>
                            <FormattedMessage id="view.setup.title" />
                        </h1>

                        <div className="align-middle">
                            {this.state.step >= 2 ? (
                                <Button
                                    variant="danger"
                                    className="mx-1"
                                    onClick={() => {
                                        if (
                                            confirm(
                                                this.props.intl.formatMessage({
                                                    id: "view.setup.quitconfirm"
                                                })
                                            )
                                        ) {
                                            this.blockNavigation = false;
                                            this.props.history.push(
                                                AppRoutes.home.link || AppRoutes.home.route
                                            );
                                        }
                                    }}>
                                    <FormattedMessage id="view.setup.quit" />
                                </Button>
                            ) : null}
                            {this.state.step === 4 ? (
                                <Button
                                    className="mx-1"
                                    onClick={() => {
                                        this.setState({
                                            step: 5
                                        });
                                    }}>
                                    <FormattedMessage id="view.setup.nextpage" />
                                </Button>
                            ) : null}
                        </div>
                        <h3>
                            <FormattedMessage id={`view.setup.step.${this.state.step}`} />
                        </h3>
                        <hr />
                        <div className="text-left">
                            {this.state.step === 4 ? (
                                <Configuration />
                            ) : this.state.step === 3 ? (
                                <div className="text-center">
                                    <Button
                                        onClick={async () => {
                                            const response = await UserClient.editUser(
                                                this.state.adminUser!.id!,
                                                {
                                                    enabled: false,
                                                    administrationRights: 0,
                                                    instanceManagerRights: 0
                                                }
                                            );
                                            if (response.code === StatusCode.ERROR) {
                                                this.addError(response.error!);
                                            } else {
                                                this.setState({
                                                    step: 4
                                                });
                                            }
                                        }}>
                                        <FormattedMessage id="view.setup.disableadmin" />
                                    </Button>
                                </div>
                            ) : this.state.step === 2 && this.state.username ? (
                                <Login
                                    prefillLogin={this.state.username}
                                    postLoginAction={() => {
                                        this.setState({
                                            step: 3
                                        });
                                    }}
                                />
                            ) : this.state.step === 1 ? (
                                <Create
                                    postCreateAction={(user: Components.Schemas.User) => {
                                        ServerClient.logout();
                                        this.setState({
                                            step: 2,
                                            username: user.name
                                        });
                                    }}
                                />
                            ) : (
                                <div className="text-center">
                                    <Button
                                        onClick={() => {
                                            this.props.history.push(
                                                AppRoutes.home.link || AppRoutes.home.route,
                                                { setupNavBypass: true }
                                            );
                                        }}>
                                        <FormattedMessage id="view.setup.quit" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                );
            }
        }
    )
);
