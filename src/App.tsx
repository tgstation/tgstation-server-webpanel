import * as React from "react";

import IAppProps from "./IAppProps";

import "./App.css";
import HttpClient from "./helpers/HttpClient";
import ITranslation from "./translations/ITranslation";
import TranslationFactory from "./translations/TranslationFactory";

interface IAppState {
  translation?: ITranslation;
}

class App extends React.Component<IAppProps, IAppState> {
  constructor(props: IAppProps) {
    super(props);
    this.state = {};
  }

  public async componentDidMount(){
    const translation = await this.loadTranslation();
    const newState: IAppState = {translation};
    this.setState(newState);
  }

  public render(): React.ReactNode {
    if (this.state.translation == null) return this.renderLoading();

    return (
      <div className="App" />
    );
  }

  private async loadTranslation(): Promise<ITranslation>{
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
      <div className="App" />
    );
  }
}

export default App;
