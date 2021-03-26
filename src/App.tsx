import * as React from "react";
import Container from "react-bootstrap/Container";
import { IntlProvider } from "react-intl";
import { BrowserRouter } from "react-router-dom";

import { CredentialsType } from "./ApiClient/models/ICredentials";
import ServerClient from "./ApiClient/ServerClient";
import UserClient from "./ApiClient/UserClient";
import CredentialsProvider from "./ApiClient/util/CredentialsProvider";
import LoginHooks from "./ApiClient/util/LoginHooks";
import AppNavbar from "./components/AppNavbar";
import { ErrorBoundary, JobsList, Loading } from "./components/utils";
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
                    )}
                    <JobsList />
                </ErrorBoundary>
            </BrowserRouter>
        );
    }
}

class App extends React.Component<IProps, IState> {
    private readonly translationFactory: ITranslationFactory;

    public constructor(props: IProps) {
        super(props);

        this.finishLogin = this.finishLogin.bind(this);
        this.finishLogout = this.finishLogout.bind(this);

        this.translationFactory = this.props.translationFactory || new TranslationFactory();

        this.state = {
            loggedIn: !!CredentialsProvider.isTokenValid(),
            loading: true
        };
    }

    private finishLogin() {
        console.log("Logging in");

        void UserClient.getCurrentUser(); //preload the user, we dont particularly care about the content, just that its preloaded
        this.setState({
            loggedIn: true,
            loading: false
        });
    }

    private finishLogout() {
        this.setState({
            loggedIn: false
        });
    }
    public async componentDidMount(): Promise<void> {
        LoginHooks.on("loginSuccess", this.finishLogin);
        ServerClient.on("logout", this.finishLogout);

        await this.loadTranslation();
        await ServerClient.initApi();
        await ServerClient.getServerInfo();

        this.setState({
            loading: false
        });
    }

    public componentWillUnmount(): void {
        LoginHooks.removeListener("loginSuccess", this.finishLogin);
        ServerClient.removeListener("logout", this.finishLogout);
    }

    public render(): React.ReactNode {
        if (this.state.translationError != null)
            return <p className="App-error">{this.state.translationError}</p>;

        if (this.state.translation == null) return <Loading>Loading translations...</Loading>;
        return (
            <IntlProvider
                locale={this.state.translation.locale}
                messages={this.state.translation.messages}>
                <InnerApp loading={this.state.loading} loggedIn={this.state.loggedIn} />
            </IntlProvider>
        );
    }

    private async loadTranslation(locale: string = this.props.locale): Promise<void> {
        console.time("LoadTranslations");
        try {
            const translation = await this.translationFactory.loadTranslation(locale);
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
