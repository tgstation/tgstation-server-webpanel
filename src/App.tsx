import * as React from "react";
import { IntlProvider } from "react-intl";
import { RingLoader } from "react-spinners";

import IAppProps from "./IAppProps";

import HttpClient from "./clients/HttpClient";
import IHttpClient from "./clients/IHttpClient";
import IServerClient from "./clients/IServerClient";
import ServerClient from "./clients/ServerClient";

import ITranslation from "./translations/ITranslation";
import ITranslationFactory from "./translations/ITranslationFactory";
import TranslationFactory from "./translations/TranslationFactory";

import Root from "./components/Root";

import "./App.css";

interface IState {
  translation?: ITranslation;
}

class App extends React.Component<IAppProps, IState> {
  private readonly httpClient: IHttpClient;
  private readonly serverClient: IServerClient;
  private readonly translationFactory: ITranslationFactory;

  constructor(props: IAppProps) {
    super(props);

    this.httpClient = this.props.httpClient || new HttpClient(this.props.serverAddress);
    this.serverClient = this.props.serverClient || new ServerClient(this.httpClient);
    this.translationFactory = this.props.translationFactory || new TranslationFactory(this.httpClient);

    this.state = {};
  }

  public async componentDidMount(): Promise<void> {
    const translation = await this.loadTranslation();
    this.setState((prevState: Readonly<IState>) => {
      return {
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
        <IntlProvider
          locale={this.state.translation.locale}
          messages={this.state.translation.messages}
        >
          <Root serverClient={this.serverClient} />
        </IntlProvider>
      </div>
    );
  }

  private async loadTranslation(): Promise<ITranslation> {
    const translation = await this.translationFactory.loadTranslation(this.props.locale);
    this.serverClient.setTranslation(translation);
    return translation;
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
