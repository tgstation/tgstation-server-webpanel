import * as React from "react";
import { IntlProvider } from "react-intl";
import { RingLoader } from "react-spinners";

import { Provider } from "react-redux";
import { createStore, Store } from "redux";

import IAppProps from "./IAppProps";

import IRootState from "./store/IRootState";
import MainReducer from "./store/MainReducer";

import HttpClient from "./clients/HttpClient";
import IHttpClient from "./clients/IHttpClient";
import IServerClient from "./clients/IServerClient";
import ServerClient from "./clients/ServerClient";

import ITranslation from "./translations/ITranslation";
import ITranslationFactory from "./translations/ITranslationFactory";
import TranslationFactory from "./translations/TranslationFactory";

import Root from "./components/Root";

import "./App.css";

interface IAppState {
  translation?: ITranslation;
  store: Store<IRootState>;
}

class App extends React.Component<IAppProps, IAppState> {
  private readonly httpClient: IHttpClient;
  private readonly serverClient: IServerClient;
  private readonly translationFactory: ITranslationFactory;

  constructor(props: IAppProps) {
    super(props);

    this.httpClient = this.props.httpClient || new HttpClient(this.props.serverAddress);
    this.serverClient = this.props.serverClient || new ServerClient(this.httpClient);
    this.translationFactory = this.props.translationFactory || new TranslationFactory(this.httpClient);

    this.state = {
      store: createStore(MainReducer, {
        credentials: {
          password: "",
          username: ""
        },
        loggedIn: false,
        refreshingToken: false
      })
    };
  }

  public async componentDidMount() {
    const translation = await this.loadTranslation();
    this.setState((prevState: Readonly<IAppState>) => {
      return {
        store: prevState.store,
        translation
      };
    });
  }

  public render(): React.ReactNode {
    return (
      <div className="App">
        {this.renderInnards()}
      </div>
    );
  }

  private renderInnards(): React.ReactNode {
    if (this.state.translation == null)
      return this.renderLoading();

    return (
      <div className="App-main">
        <Provider store={this.state.store}>
          <IntlProvider
            locale={this.state.translation.locale}
            messages={this.state.translation.messages}
          >
            <Root serverClient={this.serverClient} />
          </IntlProvider>
        </Provider>
      </div>
    );
  }

  private loadTranslation(): Promise<ITranslation> {
    return this.translationFactory.loadTranslation(this.props.locale);
  }

  private renderLoading(): React.ReactNode {
    return (
      <div className="App-loading">
        <RingLoader loading={true} color="#E3EFFC" size={500} />
      </div>
    );
  }
}

export default App;
