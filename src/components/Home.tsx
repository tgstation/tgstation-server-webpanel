import * as React from 'react';
import { Route, Link } from 'react-router-dom';

import UserManager from './userManager/UserManager';
import InstanceList from './instance/InstanceList';

import LargeButton from './utils/LargeButton';

import './Home.css';

export default class Home extends React.Component {
    public static readonly Route: string = '/';

    public render(): React.ReactNode {
        return (
            <Route exact path={Home.Route}>
                <div className="Home">
                    <div className="Home-instances">
                        <Link to={InstanceList.Route}>
                            <LargeButton
                                fontSize="195px"
                                glyph="hdd"
                                messageId="home.instances"
                            />
                        </Link>
                    </div>
                    <div className="Home-user">
                        <Link to={UserManager.Route}>
                            <LargeButton
                                fontSize="195px"
                                glyph="user"
                                messageId="home.users"
                            />
                        </Link>
                    </div>
                </div>
            </Route>
        );
    }
}
