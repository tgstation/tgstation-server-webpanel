import * as React from "react";

import { connect } from "react-redux";
import { Action, Dispatch } from "redux";

import IServerClient from "../clients/IServerClient";

import IRootState from "../store/IRootState";
import PageType from "../store/PageType";

import Home from "./Home";
import Login from "./Login";
import Navbar from "./Navbar";

interface IStateProps {
  loggedIn: boolean;
  pageType: PageType;
}

interface IOwnProps {
  serverClient: IServerClient;
}

type IProps = IStateProps & IOwnProps;

class Root extends React.Component<IProps> {
  public render(): React.ReactNode {
    return (
      <div className="Root">
        {this.renderInterior()}
      </div>
    );
  }

  private renderInterior(): React.ReactNode {
    if (!this.props.loggedIn)
      return <Login serverClient={this.props.serverClient} />;

    return (
      <div className="Root-active">
        <Navbar />
        {this.renderPage()}
      </div>
    );
  }

  private renderPage(): React.ReactNode {
    switch (this.props.pageType) {
      case PageType.Home:
        return <Home />;
      default:
        throw new Error("Invalid PageType!");
    }
  }
}

const mapStateToProps = (state: IRootState, ownProps: IOwnProps): IStateProps => ({
  loggedIn: state.loggedIn,
  pageType: state.pageType
});

const mapDispatchToProps = (dispatch: Dispatch<Action>, ownProps: IOwnProps): any => ({});

export default connect<IStateProps, {}, IOwnProps, IRootState>(mapStateToProps, mapDispatchToProps)(Root);
