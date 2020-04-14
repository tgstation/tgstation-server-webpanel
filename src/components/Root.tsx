import * as React from "react";

import IServerClient from "../clients/IServerClient";

import Home from "./Home";
import Login from "./Login";
import Navbar from "./Navbar";
import UserManager from './UserManager';

import { PageType } from '../models/PageType';

import './Root.css'

interface IProps {
  serverClient: IServerClient;
}

interface IState {
  pageType: PageType,
}

export default class Root extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      pageType: PageType.Home
    };

    this.postLogin = this.postLogin.bind(this);
    this.navigateToPage = this.navigateToPage.bind(this);
    this.checkLoggedIn = this.checkLoggedIn.bind(this);
  }

  public render(): React.ReactNode {
    if (!this.props.serverClient.loggedIn())
      return <Login serverClient={this.props.serverClient} onSuccessfulLogin={this.postLogin} />;

    const currentPage = this.state.pageType;
    if (currentPage == null)
      throw new Error("state.pageType should be set here!");

    return (
      <div className="Root">
        <div className="Root-nav">
          <Navbar checkLoggedIn={this.checkLoggedIn} navigateToPage={this.navigateToPage} currentPage={currentPage} userClient={this.props.serverClient.user} />
        </div>
        <div className="Root-content">
          {this.renderPage()}
        </div>
      </div>
    );
  }

  private renderPage(): React.ReactNode {
    switch (this.state.pageType) {
      case PageType.Home:
        return <Home navigateToPage={this.navigateToPage} />;
      case PageType.UserManager:
        return <UserManager userClient={this.props.serverClient.user} />
      default:
        throw new Error("Invalid PageType!");
    }
  }

  private checkLoggedIn(): void {
    this.setState(prevState => {
      return {
        pageType: prevState.pageType
      }
    })
  }

  private navigateToPage(pageType: PageType): void {
    this.setState({
      pageType
    });
  }

  private postLogin(): void {
    this.navigateToPage(PageType.Home);
  }
}
