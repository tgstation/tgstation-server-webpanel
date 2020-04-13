import * as React from "react";

import IServerClient from "../clients/IServerClient";

import Home from "./Home";
import Login from "./Login";
import Navbar from "./Navbar";

import { PageType } from '../models/PageType';

import './Root.css'

interface IProps {
  serverClient: IServerClient;
}

interface IState {
  pageType: PageType
}

export default class Root extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      pageType: PageType.Home
    }

    this.stateRefresh = this.stateRefresh.bind(this);
  }

  public render(): React.ReactNode {
    return (
      <div className="Root">
        {this.renderInterior()}
      </div>
    );
  }

  private renderInterior(): React.ReactNode {
    if (!this.props.serverClient.loggedIn())
      return <Login serverClient={this.props.serverClient} onSuccessfulLogin={this.stateRefresh} />;

    return (
      <div className="Root-active">
        <Navbar />
        {this.renderPage()}
      </div>
    );
  }

  private renderPage(): React.ReactNode {
    switch (this.state.pageType) {
      case PageType.Home:
        return <Home />;
      default:
        throw new Error("Invalid PageType!");
    }
  }

  private stateRefresh(): void {
    this.setState(prevState => prevState);
  }
}
