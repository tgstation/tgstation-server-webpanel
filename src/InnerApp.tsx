import React from "react";
import { Alert, Container } from "react-bootstrap";
import { FormattedMessage } from "react-intl";
import { BrowserRouter } from "react-router-dom";

import Pkg from "./../package.json";
import ServerClient from "./ApiClient/ServerClient";
import CredentialsProvider from "./ApiClient/util/CredentialsProvider";
import AppNavbar from "./components/AppNavbar";
import Logo from "./components/Logo";
import ReportIssue from "./components/ReportIssue";
import ErrorAlert from "./components/utils/ErrorAlert";
import ErrorBoundary from "./components/utils/ErrorBoundary";
import JobsList from "./components/utils/JobsList";
import Loading from "./components/utils/Loading";
import { GeneralContext, UnsafeGeneralContext } from "./contexts/GeneralContext";
import { DEFAULT_BASEPATH } from "./definitions/constants";
import Router from "./Router";

interface InnerProps {
    loading: boolean;
    loggedIn: boolean;
    loggedOut: boolean;
}

interface InnerState {
    passdownCat?: { name: string; key: string };
}

class InnerApp extends React.Component<InnerProps, InnerState> {
    public declare context: UnsafeGeneralContext;

    public constructor(props: InnerProps) {
        super(props);

        this.state = {};
    }

    public componentDidMount(): void {
        document.title = "TGS Webpanel v" + Pkg.version;
        // I can't be assed to remember the default admin password
        document.addEventListener("keydown", event => {
            if (event.key === "L" && event.ctrlKey && event.shiftKey) {
                ServerClient.logout();
                void ServerClient.login(CredentialsProvider.default);
            }
        });
    }

    public render(): React.ReactNode {
        return (
            <BrowserRouter
                basename={
                    window.publicPath
                        ? new URL(window.publicPath, window.location.href).pathname
                        : DEFAULT_BASEPATH
                }>
                <ErrorBoundary>
                    <AppNavbar category={this.state.passdownCat} loggedIn={this.props.loggedIn} />
                    {this.props.loading ? (
                        <Container className="mt-5 mb-5">
                            <Loading text="loading.app" />
                        </Container>
                    ) : (
                        <>
                            <Container className="mt-5">
                                <Alert variant="warning" className="d-block d-lg-none">
                                    <Alert.Heading>
                                        <FormattedMessage id="warning.screensize.header" />
                                    </Alert.Heading>
                                    <hr />
                                    <FormattedMessage id="warning.screensize" />
                                </Alert>
                                {Array.from(this.context.errors.values()).map((value, idx) => {
                                    return (
                                        <ErrorAlert
                                            error={value}
                                            key={idx}
                                            onClose={() => this.context.deleteError(value)}
                                        />
                                    );
                                })}
                            </Container>
                            <Router
                                loggedIn={this.props.loggedIn}
                                loggedOut={this.props.loggedOut}
                                selectCategory={cat => {
                                    this.setState({
                                        passdownCat: {
                                            name: cat,
                                            key: Math.random().toString()
                                        }
                                    });
                                }}
                            />
                        </>
                    )}
                    {this.props.loggedIn ? <JobsList /> : null}
                </ErrorBoundary>
                <ReportIssue />
                <Logo />
            </BrowserRouter>
        );
    }
}
InnerApp.contextType = GeneralContext;

export default InnerApp;
