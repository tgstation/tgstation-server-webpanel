import * as React from "react";
import { FormattedMessage } from "react-intl";

import "./LargeButton.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

interface IProps {
    fontSize: string;
    textSize?: string;
    glyph: IconProp;
    messageId?: string;
    onClick?: () => void;
}

export default class LargeButton extends React.Component<IProps> {
    public render(): React.ReactNode {
        return (
            <button className="LargeButton" onClick={this.props.onClick}>
                <div className="LargeButton-inner">
                    <div style={{ fontSize: this.props.fontSize }}>
                        <FontAwesomeIcon icon={this.props.glyph} />
                    </div>
                    <div
                        className="LargeButton-text"
                        style={{ fontSize: this.props.textSize || "30px" }}>
                        {this.renderMessage()}
                    </div>
                </div>
            </button>
        );
    }

    private renderMessage(): React.ReactNode {
        return this.props.messageId ? (
            <FormattedMessage id={this.props.messageId} />
        ) : (
            <React.Fragment />
        );
    }
}
