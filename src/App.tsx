import "./App.css";

// polyfills
import * as React from "react";
import { Suspense } from "react";
import { IntlProvider } from "react-intl";

import InternalError, {
    ErrorCode,
    GenericErrors
} from "./ApiClient/models/InternalComms/InternalError";
import { StatusCode } from "./ApiClient/models/InternalComms/InternalStatus";
import ServerClient from "./ApiClient/ServerClient";
import UserClient from "./ApiClient/UserClient";
import LoginHooks from "./ApiClient/util/LoginHooks";
import Loading from "./components/utils/Loading";
import { GeneralContext, UnsafeGeneralContext } from "./contexts/GeneralContext";
import ITranslation from "./translations/ITranslation";
import ITranslationFactory from "./translations/ITranslationFactory";
import TranslationFactory from "./translations/TranslationFactory";

const polyfills = import("./polyfills");
const icolibrary = import("./utils/icolibrary");
const ConfigController = import("./ApiClient/util/ConfigController");
const JobsController = import("./ApiClient/util/JobsController");
const InnerApp = React.lazy(() => import("./InnerApp"));

interface IState {
    translation?: ITranslation;
    translationError?: string;
    loggedIn: boolean;
    loggedOut: boolean;
    loading: boolean;
    polyfills: boolean;
    GeneralContextInfo: UnsafeGeneralContext;
}

interface IProps {
    readonly locale: string;
    readonly translationFactory?: ITranslationFactory;
}

class App extends React.Component<IProps, IState> {
    private readonly translationFactory: ITranslationFactory;

    public constructor(props: IProps) {
        super(props);

        this.finishLogin = this.finishLogin.bind(this);
        this.finishLogout = this.finishLogout.bind(this);
        this.updateContextUser = this.updateContextUser.bind(this);
        this.updateContextServer = this.updateContextServer.bind(this);
        this.deleteGeneralContextError = this.deleteGeneralContextError.bind(this);

        this.translationFactory = this.props.translationFactory ?? new TranslationFactory();

        this.state = {
            loggedIn: false,
            loggedOut: false,
            loading: true,
            polyfills: false,
            GeneralContextInfo: {
                errors: new Set(),
                user: null,
                serverInfo: null,
                deleteError: this.deleteGeneralContextError
            }
        };
    }

    private async updateContextUser() {
        const response = await UserClient.getCurrentUser();
        if (response.code === StatusCode.OK) {
            this.setState(prev => {
                return {
                    GeneralContextInfo: {
                        errors: prev.GeneralContextInfo.errors,
                        user: response.payload,
                        serverInfo: prev.GeneralContextInfo.serverInfo,
                        deleteError: prev.GeneralContextInfo.deleteError
                    }
                };
            });
        } else {
            if (response.error.code === ErrorCode.HTTP_ACCESS_DENIED) {
                this.setState(prev => {
                    return {
                        GeneralContextInfo: {
                            user: null,
                            serverInfo: prev.GeneralContextInfo.serverInfo,
                            deleteError: prev.GeneralContextInfo.deleteError,
                            errors: prev.GeneralContextInfo.errors
                        }
                    };
                });
            } else {
                setTimeout(() => void this.updateContextUser(), 5000);
                this.setState(prev => {
                    const newSet = new Set(prev.GeneralContextInfo.errors);
                    newSet.add(response.error);
                    return {
                        GeneralContextInfo: {
                            errors: newSet,
                            deleteError: prev.GeneralContextInfo.deleteError,
                            user: null,
                            serverInfo: prev.GeneralContextInfo.serverInfo
                        }
                    };
                });
            }
        }
    }

    private async updateContextServer(lastError?: InternalError<GenericErrors>) {
        const response = await ServerClient.getServerInfo();
        if (response.code === StatusCode.OK) {
            this.setState(prev => {
                const newSet = new Set(prev.GeneralContextInfo.errors);
                if (lastError) {
                    newSet.delete(lastError);
                }
                return {
                    GeneralContextInfo: {
                        errors: newSet,
                        user: prev.GeneralContextInfo.user,
                        serverInfo: response.payload,
                        deleteError: prev.GeneralContextInfo.deleteError
                    }
                };
            });
        } else {
            setTimeout(() => void this.updateContextServer(response.error), 5000);
            this.setState(prev => {
                const newSet = new Set(prev.GeneralContextInfo.errors);
                newSet.add(response.error);
                if (lastError) {
                    newSet.delete(lastError);
                }
                return {
                    GeneralContextInfo: {
                        errors: newSet,
                        deleteError: prev.GeneralContextInfo.deleteError,
                        user: prev.GeneralContextInfo.user,
                        serverInfo: null
                    }
                };
            });
        }
    }

    public deleteGeneralContextError(error: InternalError): void {
        this.setState(prev => {
            const newSet = new Set(prev.GeneralContextInfo.errors);
            newSet.delete(error);
            return {
                GeneralContextInfo: {
                    deleteError: prev.GeneralContextInfo.deleteError,
                    user: prev.GeneralContextInfo.user,
                    serverInfo: prev.GeneralContextInfo.serverInfo,
                    errors: newSet
                }
            };
        });
    }

    private finishLogin() {
        console.log("Logging in");

        void this.updateContextUser().then(() =>
            this.setState({
                loggedIn: true,
                loading: false
            })
        );
    }

    private finishLogout() {
        this.setState({
            loggedIn: false,
            loggedOut: true
        });

        void this.updateContextUser();
    }
    public componentDidMount(): void {
        void (async () => {
            // dont lag the dom
            const initIcons = await icolibrary;
            initIcons.default();
            (await ConfigController).default.loadconfig();
            (await JobsController).default.init();

            LoginHooks.on("loginSuccess", this.finishLogin);
            ServerClient.on("logout", this.finishLogout);
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            ServerClient.on("purgeCache", this.updateContextServer);
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            ServerClient.on("purgeCache", this.updateContextUser);

            await polyfills;

            this.setState({ polyfills: true });

            await this.loadTranslation();
            const loggedInSuccessfully = await ServerClient.initApi();
            await this.updateContextServer();
            if (loggedInSuccessfully) {
                await this.updateContextUser();
            }

            this.setState({
                loading: false,
                loggedIn: loggedInSuccessfully
            });
        })();
    }

    public componentWillUnmount(): void {
        LoginHooks.removeListener("loginSuccess", this.finishLogin);
        ServerClient.removeListener("logout", this.finishLogout);
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        ServerClient.removeListener("purgeCache", this.updateContextServer);
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        ServerClient.removeListener("purgeCache", this.updateContextUser);
    }

    public render(): React.ReactNode {
        if (!this.state.polyfills) {
            return <Loading>Loading polyfills...</Loading>;
        }

        if (this.state.translationError) {
            return <p className="App-error">{this.state.translationError}</p>;
        }

        if (!this.state.translation) {
            return <Loading>Loading translations...</Loading>;
        }
        return (
            <IntlProvider
                locale={this.state.translation.locale}
                messages={this.state.translation.messages}
                defaultLocale="en">
                <Suspense fallback={<Loading text="loading.app" />}>
                    <GeneralContext.Provider
                        value={this.state.GeneralContextInfo as GeneralContext}>
                        <InnerApp
                            loading={this.state.loading}
                            loggedIn={this.state.loggedIn}
                            loggedOut={this.state.loggedOut}
                        />
                    </GeneralContext.Provider>
                </Suspense>
            </IntlProvider>
        );
    }

    private async loadTranslation(): Promise<void> {
        console.time("LoadTranslations");
        try {
            const translation = await this.translationFactory.loadTranslation(this.props.locale);
            this.setState({
                translation
            });
        } catch (error) {
            this.setState({
                translationError: JSON.stringify(error) ?? "An unknown error occurred"
            });

            return;
        }

        console.timeEnd("LoadTranslations");
    }
}

export default App;
