import * as React from "react";

import './Home.css';
import LargeButton from './LargeButton';
import { PageType } from '../models/PageType';

interface IProps {
    navigateToPage(pageType: PageType): void;
}

class Home extends React.Component<IProps> {
    public constructor(props: IProps) {
        super(props);

        this.navigateInstances = this.navigateInstances.bind(this);
        this.navigateUsers = this.navigateUsers.bind(this);
    }

    public render(): React.ReactNode {
        return (
            <div className="Home">
                <div className="Home-instances">
                    <LargeButton glyph="hdd" messageId="home.instances" onClick={this.navigateInstances} />
                </div>
                <div className="Home-user">
                    <LargeButton glyph="user" messageId="home.users" onClick={this.navigateUsers} />
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

export default Home;
