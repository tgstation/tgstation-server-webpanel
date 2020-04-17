import * as React from "react";

import { FormattedMessage } from 'react-intl';

import Glyphicon from '@strongdm/glyphicon'

import IUserClient from '../clients/IUserClient';
import { User } from '../clients/generated';

import { PageType } from '../models/PageType';

import './Navbar.css';
import { SyncLoader } from 'react-spinners';

interface IProps {
    userClient: IUserClient;
    currentPage: PageType;
    navigateToPage(pageType: PageType): void;
    checkLoggedIn(): void;
    logoutAction(): void;
}

interface IState {
    currentUser?: User;
    loadingError?: string;
    retryIn?: Date;
    usernameHovered: boolean;
}

class Navbar extends React.Component<IProps, IState> {
    private retryTimer: NodeJS.Timeout | null;

    public constructor(props: IProps) {
        super(props);
        this.state = {
            usernameHovered: false
        };
        this.retryTimer = null;

        this.retryGetUser = this.retryGetUser.bind(this);
        this.navigateHome = this.navigateHome.bind(this);
        this.logoutClick = this.logoutClick.bind(this);
        this.onHover = this.onHover.bind(this);
        this.offHover = this.offHover.bind(this);
    }

    public async componentDidMount(): Promise<void> {
        if (this.state.retryIn != null && this.state.retryIn < new Date()) {
            this.retryTimer = setTimeout(this.retryGetUser, this.state.retryIn.getMilliseconds() - Date.now());
            return;
        }

        const user = await this.props.userClient.getCurrentCached();
        if (!user) {
            this.props.checkLoggedIn();
            return;
        }

        if (!user.model) {
            const loadingError = await user.getError();
            // retry every 10s
            const retryIn = new Date(Date.now() + 10000);

            this.setState(prevState => {
                return {
                    loadingError,
                    retryIn
                }
            });

            return;
        }

        this.setState({
            currentUser: user.model
        });
    }

    public componentWillUnmount() {
        if (this.retryTimer != null) {
            clearTimeout(this.retryTimer);
            this.retryTimer = null;
        }
    }

    public render(): React.ReactNode {
        return (
            <div className="Navbar">
                <button className={this.props.currentPage === PageType.Home ? 'active' : ''} onClick={this.navigateHome}>
                    <FormattedMessage id="navbar.home" />
                </button>
                <div className="Navbar-user">
                    {this.renderUser()}
                </div>
            </div>
        );
    }

    private renderUser(): React.ReactNode {
        if (this.state.loadingError)
            return (
                <div className="Navbar-user-error">
                    <div className="Navbar-user-error-glyph">
                        <Glyphicon glyph='exclamation-sign' />
                    </div>
                    <p className="Navbar-user-error-text">
                        <FormattedMessage id="navbar.error" />:
                        <br />
                        {this.state.loadingError}
                    </p>
                </div>
            );
        if (this.state.currentUser)
            return (
                <button className="Navbar-user-name" onClick={this.logoutClick} onMouseEnter={this.onHover} onMouseLeave={this.offHover}>
                    {this.state.usernameHovered
                        ? <FormattedMessage id="navbar.logout" />
                        : this.state.currentUser.name}
                </button>
            );

        return (
            <div className="Navbar-user-loading">
                <SyncLoader color={"white"} />
            </div>
        );
    }

    private onHover(): void {
        this.setState(prevState => {
            return {
                usernameHovered: true,
                currentUser: prevState.currentUser,
                loadingError: prevState.loadingError,
                retryIn: prevState.retryIn
            };
        })
    }

    private offHover(): void {
        this.setState(prevState => {
            return {
                usernameHovered: false,
                currentUser: prevState.currentUser,
                loadingError: prevState.loadingError,
                retryIn: prevState.retryIn
            };
        })
    }

    private logoutClick(): void {
        this.props.logoutAction();
    }

    private navigateHome(): void {
        this.props.navigateToPage(PageType.Home);
    }

    private retryGetUser(): void {
        this.setState({});
    }
}

export default Navbar;
