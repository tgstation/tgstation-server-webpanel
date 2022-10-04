import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { FormattedMessage } from "react-intl";

interface IProps {}

interface IState {}

export default class ReportIssue extends React.Component<IProps, IState> {
    public render(): React.ReactNode {
        return (
            <OverlayTrigger
                placement="top"
                overlay={props => (
                    <Tooltip id="report-issue-tooltip" {...props}>
                        <FormattedMessage id="view.report" />
                    </Tooltip>
                )}>
                <Button
                    className="nowrap report-issue"
                    onClick={() =>
                        window.open(
                            "https://github.com/tgstation/tgstation-server-webpanel/issues/new"
                        )
                    }>
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                </Button>
            </OverlayTrigger>
        );
    }
}
