import { hot } from 'react-hot-loader/root';
import * as React from 'react';
import { IntlProvider } from 'react-intl';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Container from 'react-bootstrap/Container';

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
import AppNavbar from './components/AppNavbar';
import AuthenticatedRoute from './components/utils/AuthenticatedRoute';

import './App.css';
import loadable from '@loadable/component';
import { AppRoutes } from './utils/routes';

interface IState {
    translation?: ITranslation;
    translationError?: string;
    serverInformation?: ServerInformation;
}

const Load = <h3>Loading...</h3>;
const UserManager = loadable(
    () => import('./components/userManager/UserManager'),
    { fallback: Load }
);
const Home = loadable(() => import('./components/Home'), { fallback: Load });

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
                        <AuthenticatedRoute serverClient={this.serverClient}>
                            <div className="Root">
                                <div className="Root-nav">
                                    <AppNavbar
                                        serverClient={this.serverClient}
                                    />
                                </div>
                                <Container>
                                    <Route path={AppRoutes.userManager}>
                                        <UserManager
                                            userClient={this.serverClient.users}
                                            serverInformationCallback={
                                                this.getServerInformation
                                            }
                                        />
                                    </Route>
                                    <Route path={AppRoutes.home}>
                                        <Home />
                                    </Route>
                                </Container>
                            </div>
                        </AuthenticatedRoute>
                    </Switch>
                </BrowserRouter>
            </IntlProvider>
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

export default hot(App);
