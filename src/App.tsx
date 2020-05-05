import * as React from 'react';
import { IntlProvider } from 'react-intl';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import IAppProps from './IAppProps';

import HttpClient from './clients/HttpClient';
import IHttpClient from './clients/IHttpClient';
import IServerClient from './clients/IServerClient';
import ServerClient from './clients/ServerClient';
import { ServerInformation } from './clients/generated';

import ITranslation from './translations/ITranslation';
import ITranslationFactory from './translations/ITranslationFactory';
import TranslationFactory from './translations/TranslationFactory';

import Loading from './components/Loading';
import * as Login from './components/login/Login';
import Navbar from './components/Navbar';
import Home from './components/Home';
import UserManager from './components/userManager/UserManager';
import AuthenticatedRoute from './components/utils/AuthenticatedRoute';

import './App.css';

interface IState {
    translation?: ITranslation;
    translationError?: string;
    serverInformation?: ServerInformation;
}

class App extends React.Component<IAppProps, IState> {
    private readonly httpClient: IHttpClient;
    private readonly serverClient: IServerClient;
    private readonly translationFactory: ITranslationFactory;

    public constructor(props: IAppProps) {
        super(props);

        this.httpClient =
            this.props.httpClient ||
            new HttpClient(this.props.serverAddress, this.props.basePath);
        this.serverClient =
            this.props.serverClient || new ServerClient(this.httpClient);
        this.translationFactory =
            this.props.translationFactory ||
            new TranslationFactory(this.httpClient);
        this.getServerInformation = this.getServerInformation.bind(this);
        this.postLogin = this.postLogin.bind(this);

        this.state = {};
    }

    public async componentDidMount(): Promise<void> {
        await this.loadTranslation();
    }

    public render(): React.ReactNode {
        if (this.state.translationError != null)
            return <p className="App-error">{this.state.translationError}</p>;

        if (this.state.translation == null) return <Loading />;

        return (
            <div className="App-main">
                <IntlProvider
                    locale={this.state.translation.locale}
                    messages={this.state.translation.messages}>
                    <BrowserRouter basename={this.props.basePath}>
                        <Switch>
                            <Route path={Login.Route}>
                                <Login.Component
                                    serverClient={this.serverClient}
                                    onSuccessfulLogin={this.postLogin}
                                />
                            </Route>
                            <AuthenticatedRoute
                                serverClient={this.serverClient}>
                                <div className="Root">
                                    <div className="Root-nav">
                                        <Navbar
                                            serverClient={this.serverClient}
                                        />
                                    </div>
                                    <div className="Root-content">
                                        <UserManager
                                            userClient={this.serverClient.users}
                                            serverInformationCallback={
                                                this.getServerInformation
                                            }
                                        />
                                        <Home />
                                    </div>
                                </div>
                            </AuthenticatedRoute>
                        </Switch>
                    </BrowserRouter>
                </IntlProvider>
            </div>
        );
    }

    private async loadTranslation(): Promise<void> {
        const translationResponse = await this.translationFactory.loadTranslation(
            this.props.locale
        );

        const translation = translationResponse.model;
        if (!translation) {
            const error = await translationResponse.getError();
            this.setState({
                translationError: error || 'An unknown error occurred'
            });

            return;
        }

        this.serverClient.setTranslation(translation);
        this.setState({
            translation
        });
    }

    private getServerInformation(): ServerInformation {
        if (!this.state.serverInformation)
            throw new Error('state.serverInformation should be set here');
        return this.state.serverInformation;
    }

    private postLogin(serverInformation: ServerInformation): void {
        this.setState({
            serverInformation
        });
    }
}

export default App;
