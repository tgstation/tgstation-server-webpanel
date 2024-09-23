import React, { ReactNode } from "react";
import Card from "react-bootstrap/Card";
import { FormattedMessage } from "react-intl";

import { MODE, VERSION } from "../../definitions/constants";

export default class NotFound extends React.Component {
    public render(): ReactNode {
        return (
            <Card className="bg-transparent" border="danger">
                <Card.Header className="bg-danger">
                    <FormattedMessage id="error.somethingwentwrong" />
                </Card.Header>
                <Card.Body>
                    <Card.Title>
                        <FormattedMessage id="error.notfound" />
                    </Card.Title>
                    <Card.Text as={"pre"} className="bg-transparent text-danger">
                        <code>
                            {`Webpanel Version: ${VERSION}\nWebpanel Mode: ${MODE}\nCurrent route: ${window.location.toString()}`}
                        </code>
                    </Card.Text>
                </Card.Body>
            </Card>
        );
    }
}
