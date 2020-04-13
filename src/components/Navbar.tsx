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
}

interface IState {
    currentUser?: User;
    loadingError?: string;
    retryIn?: Date;
}

class Navbar extends React.Component<IProps, IState> {
    private retryTimer: NodeJS.Timeout | null;

    public constructor(props: IProps) {
        super(props);
        this.state = {};
        this.retryTimer = null;

        this.retryGetUser = this.retryGetUser.bind(this);
    }

    public async componentDidMount() {
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
                <button className={this.props.currentPage === PageType.Home ? 'active' : ''} onClick={() => this.props.navigateToPage(PageType.Home)}>
                    <FormattedMessage id="navbar.home" />
                </button>
                <button className={this.props.currentPage === PageType.Setup ? 'active' : ''} onClick={() => this.props.navigateToPage(PageType.Setup)}>
                    <FormattedMessage id="navbar.setup" />
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
                <span className="Navbar-user-name">
                    {this.state.currentUser.name}
                </span>
            );

        return (
            <div className="Navbar-user-loading">
                <SyncLoader color={"white"} />
            </div>
        );
    }

    private retryGetUser(): void {
        this.setState({});
    }
}

export default Navbar;
