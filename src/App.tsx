import * as React from "react";

import IAppProps from "./IAppProps";

import { Provider } from "react-redux";
import { createStore, Store } from "redux";
import IRootState from './store/IRootState';
import MainReducer from './store/MainReducer';

import "./App.css";

import { IntlProvider } from 'react-intl';
import HttpClient from "./helpers/HttpClient";
import ITranslation from "./translations/ITranslation";
import TranslationFactory from "./translations/TranslationFactory";

import { RingLoader } from 'react-spinners';

import Login from './components/Login';

interface IAppState {
  translation?: ITranslation;
  store: Store<IRootState>;
}

class App extends React.Component<IAppProps, IAppState> {
  constructor(props: IAppProps) {
    super(props);
    this.state = {
      store: createStore(MainReducer, {
        serverAddress: this.props.serverAddress
      })
    };
  }

  public async componentDidMount() {
    const translation = await this.loadTranslation();
    this.setState((prevState: Readonly<IAppState>) => {
      return {
        store: prevState.store,
        translation
      }
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
          <IntlProvider locale={this.state.translation.locale} messages={this.state.translation.messages}>
            <Login />
          </IntlProvider>
        </Provider>
      </div>
    );
  }

  private async loadTranslation(): Promise<ITranslation> {
    let translationFactory = this.props.translationFactory;
    if (translationFactory == null) {
      const httpClient = this.props.httpClient || new HttpClient();
      translationFactory = new TranslationFactory(httpClient);
    }
    return await translationFactory.loadTranslation(
      this.props.locale
    );
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
