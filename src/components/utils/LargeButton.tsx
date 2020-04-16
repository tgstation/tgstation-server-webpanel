import * as React from 'react';
import { FormattedMessage } from 'react-intl';

import Glyphicon from '@strongdm/glyphicon'

import './LargeButton.css';

interface IProps {
    glyph: string;
    messageId: string;
    onClick(): void;
}

export default class LargeButton extends React.Component<IProps>{
    public render(): React.ReactNode {
        return (
            <button className="LargeButton" onClick={this.props.onClick}>
                <div className="LargeButton-inner">
                    <Glyphicon glyph={this.props.glyph} />
                    <div className="LargeButton-text">
                        <FormattedMessage id={this.props.messageId} />
                    </div>
                </div>
            </button>
        );
    }
}
