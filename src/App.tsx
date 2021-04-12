import "./App.css";

import * as React from "react";
import Container from "react-bootstrap/Container";
import { IntlProvider } from "react-intl";
import { BrowserRouter } from "react-router-dom";

import { CredentialsType } from "./ApiClient/models/ICredentials";
import InternalError, { ErrorCode } from "./ApiClient/models/InternalComms/InternalError";
import { StatusCode } from "./ApiClient/models/InternalComms/InternalStatus";
import ServerClient from "./ApiClient/ServerClient";
import UserClient from "./ApiClient/UserClient";
import CredentialsProvider from "./ApiClient/util/CredentialsProvider";
import LoginHooks from "./ApiClient/util/LoginHooks";
import AppNavbar from "./components/AppNavbar";
import ErrorAlert from "./components/utils/ErrorAlert";
import ErrorBoundary from "./components/utils/ErrorBoundary";
import JobsList from "./components/utils/JobsList";
import Loading from "./components/utils/Loading";
import { GeneralContext } from "./contexts/GeneralContext";
import { DEFAULT_BASEPATH } from "./definitions/constants";
import Router from "./Router";
import ITranslation from "./translations/ITranslation";
import ITranslationFactory from "./translations/ITranslationFactory";
import TranslationFactory from "./translations/TranslationFactory";

interface IState {
    translation?: ITranslation;
    translationError?: string;
    loggedIn: boolean;
    loading: boolean;
    GeneralContextInfo: GeneralContext;
}

interface IProps {
    readonly locale: string;
    readonly translationFactory?: ITranslationFactory;
}

interface InnerProps {
    loading: boolean;
    loggedIn: boolean;
}

interface InnerState {
    passdownCat?: { name: string; key: string };
}

class InnerApp extends React.Component<InnerProps, InnerState> {
    public declare context: GeneralContext;

    public constructor(props: InnerProps) {
        super(props);

        this.state = {};
    }

    public componentDidMount() {
        //I can't be assed to remember the default admin password
        document.addEventListener("keydown", function (event) {
            if (event.key == "L" && event.ctrlKey && event.shiftKey) {
                //alert("ISolemlySwearToDeleteTheDataDirectory");
                void ServerClient.login({
                    type: CredentialsType.Password,
                    userName: "admin",
                    password: "ISolemlySwearToDeleteTheDataDirectory"
                });
            }
        });
    }

    public render(): React.ReactNode {
        return (
            <BrowserRouter basename={DEFAULT_BASEPATH}>
                <ErrorBoundary>
                    <AppNavbar category={this.state.passdownCat} />
                    {this.props.loading ? (
                        <Container className="mt-5 mb-5">
                            <Loading text="loading.app" />
                        </Container>
                    ) : (
                        <React.Fragment>
                            <Container className="mt-5">
                                {[...this.context.errors.values()].map((value, idx) => {
                                    return (
                                        <ErrorAlert
                                            error={value}
                                            key={idx}
                                            onClose={() => this.context.deleteError(value)}
                                        />
                                    );
                                })}
                            </Container>
                            <Router
                                loggedIn={this.props.loggedIn}
                                selectCategory={cat => {
                                    this.setState({
                                        passdownCat: {
                                            name: cat,
                                            key: Math.random().toString()
                                        }
                                    });
                                }}
                            />
                        </React.Fragment>
                    )}
                    <JobsList />
                </ErrorBoundary>
            </BrowserRouter>
        );
    }
}
InnerApp.contextType = GeneralContext;

class App extends React.Component<IProps, IState> {
    private readonly translationFactory: ITranslationFactory;

    public constructor(props: IProps) {
        super(props);

        this.finishLogin = this.finishLogin.bind(this);
        this.finishLogout = this.finishLogout.bind(this);
        this.updateContextUser = this.updateContextUser.bind(this);
        this.updateContextServer = this.updateContextServer.bind(this);
        this.deleteGeneralContextError = this.deleteGeneralContextError.bind(this);

        this.translationFactory = this.props.translationFactory || new TranslationFactory();

        this.state = {
            loggedIn: !!CredentialsProvider.isTokenValid(),
            loading: true,
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

    private async updateContextServer() {
        const response = await ServerClient.getServerInfo();
        if (response.code === StatusCode.OK) {
            this.setState(prev => {
                return {
                    GeneralContextInfo: {
                        errors: prev.GeneralContextInfo.errors,
                        user: prev.GeneralContextInfo.user,
                        serverInfo: response.payload,
                        deleteError: prev.GeneralContextInfo.deleteError
                    }
                };
            });
        } else {
            this.setState(prev => {
                const newSet = new Set(prev.GeneralContextInfo.errors);
                newSet.add(response.error);
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

        void UserClient.getCurrentUser(); //preload the user, we dont particularly care about the content, just that its preloaded
        void this.updateContextUser();
        this.setState({
            loggedIn: true,
            loading: false
        });
    }

    private finishLogout() {
        this.setState({
            loggedIn: false
        });

        void this.updateContextUser();
    }
    public async componentDidMount(): Promise<void> {
        LoginHooks.on("loginSuccess", this.finishLogin);
        ServerClient.on("logout", this.finishLogout);
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        ServerClient.on("purgeCache", this.updateContextServer);
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        ServerClient.on("purgeCache", this.updateContextUser);

        await this.loadTranslation();
        await ServerClient.initApi();
        await this.updateContextServer();

        this.setState({
            loading: false
        });
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
        if (this.state.translationError != null)
            return <p className="App-error">{this.state.translationError}</p>;

        if (this.state.translation == null) return <Loading>Loading translations...</Loading>;
        return (
            <IntlProvider
                locale={this.state.translation.locale}
                messages={this.state.translation.messages}>
                <GeneralContext.Provider value={this.state.GeneralContextInfo}>
                    <InnerApp loading={this.state.loading} loggedIn={this.state.loggedIn} />
                </GeneralContext.Provider>
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
                translationError: JSON.stringify(error) || "An unknown error occurred"
            });

            return;
        }
        console.timeEnd("LoadTranslations");
    }
}

export default App;
