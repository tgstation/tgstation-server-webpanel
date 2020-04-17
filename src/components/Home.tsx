import * as React from "react";
import { CSSTransition } from 'react-transition-group';

import LargeButton from './utils/LargeButton';
import { PageType } from '../models/PageType';
import TransitionsComponent from './utils/TransitionsComponent';

import './Home.css';

interface IProps {
    navigateToPage(pageType: PageType): void;
}

export default class Home extends TransitionsComponent<IProps> {
    public constructor(props: IProps) {
        super(props, 700);

        this.state = {
            transitionsIn: true
        };

        this.navigateInstances = this.navigateInstances.bind(this);
        this.navigateUsers = this.navigateUsers.bind(this);
    }

    public render(): React.ReactNode {
        return (
            <div className="Home">
                <div className="Home-instances">
                    <CSSTransition in={this.state.transitionsIn} appear={true} classNames="Home-instances" timeout={this.transitionsMaxDuration}>
                        <LargeButton fontSize="195px" glyph="hdd" messageId="home.instances" onClick={() => this.fadeThenExecuteExit(this.navigateInstances)} />
                    </CSSTransition>
                </div>
                <div className="Home-user">
                    <CSSTransition in={this.state.transitionsIn} appear={true} classNames="Home-user" timeout={this.transitionsMaxDuration}>
                        <LargeButton fontSize="195px" glyph="user" messageId="home.users" onClick={() => this.fadeThenExecuteExit(this.navigateUsers)} />
                    </CSSTransition>
                </div>
            </div>
        );
    }

    private navigateInstances(): void {
        this.props.navigateToPage(PageType.InstanceManager);
    }

    private navigateUsers(): void {
        this.props.navigateToPage(PageType.UserManager);
    }
}
