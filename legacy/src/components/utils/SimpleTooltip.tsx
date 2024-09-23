import React from "react";
import { OverlayTrigger } from "react-bootstrap";
import Tooltip from "react-bootstrap/Tooltip";
import { FormattedMessage } from "react-intl";

type IProps = {
    tooltipid: string;
    children: JSX.Element;
    show: boolean | undefined;
};

export default function SimpleToolTip(props: IProps): JSX.Element {
    return (
        <OverlayTrigger
            show={props.show}
            overlay={
                <Tooltip id={props.tooltipid}>
                    <FormattedMessage id={props.tooltipid} />
                </Tooltip>
            }>
            {props.children}
        </OverlayTrigger>
    );
}
