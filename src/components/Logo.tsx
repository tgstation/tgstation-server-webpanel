import React from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { FormattedMessage } from "react-intl";

import logo from "../images/logo.svg";

type IProps = object;

type IState = object;

export default class Logo extends React.Component<IProps, IState> {
    public render(): React.ReactNode {
        let memeSelector = 4;
        return (
            <OverlayTrigger
                placement="left"
                onToggle={showing => {
                    if (showing) {
                        memeSelector = Math.round(Math.random() * 100) % 26;
                    }
                }}
                overlay={props => (
                    <Tooltip id="report-issue-tooltip" {...props}>
                        <FormattedMessage id={`view.meme_${memeSelector}`} />
                    </Tooltip>
                )}>
                <img className="nowrap corner-logo" width={50} height={50} src={logo} />
            </OverlayTrigger>
        );
    }
}
