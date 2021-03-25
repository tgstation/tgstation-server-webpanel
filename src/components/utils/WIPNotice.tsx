import React, { ReactNode } from "react";
import Card from "react-bootstrap/Card";
import { FormattedMessage } from "react-intl";

import { MODE, VERSION } from "../../definitions/constants";

export default class WIPNotice extends React.Component {
    public render(): ReactNode {
        return (
            <Card className="bg-transparent" border="info">
                <Card.Header className="bg-info text-dark font-weight-bold">
                    <FormattedMessage id="generic.wip" />
                </Card.Header>
                <Card.Body>
                    <Card.Title>
                        <FormattedMessage id="generic.wip.desc" />
                        <a href="https://github.com/tgstation/Tgstation.Server.ControlPanel/releases/latest">
                            https://github.com/tgstation/Tgstation.Server.ControlPanel/releases/latest
                        </a>
                    </Card.Title>
                    <Card.Text className="bg-transparent text-info">
                        <code>{`Version: ${VERSION}`}</code>
                        <code>{`Webpanel Mode: ${MODE}`}</code>
                        <br />
                        <code>{`Current route: ${window.location.toString()}`}</code>
                        <br />
                    </Card.Text>
                </Card.Body>
            </Card>
        );
    }
}
