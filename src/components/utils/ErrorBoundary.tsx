import React, { Component, type ErrorInfo } from "react";
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import { FormattedMessage } from "react-intl";
import { type RouteComponentProps, withRouter } from "react-router";

import { MODE, VERSION } from "../../definitions/constants";

type Props = RouteComponentProps;

type State =
    | {
          error: undefined;
          errorInfo: undefined;
      }
    | {
          error: Error;
          errorInfo: ErrorInfo;
      };

const initialState: State = {
    error: undefined,
    errorInfo: undefined
};

/**
 * Error boundary, requires react-router context for location.
 */
class ErrorBoundary extends Component<Props, State> {
    public constructor(props: Props) {
        super(props);

        this.state = initialState;
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        this.setState({
            error,
            errorInfo
        });
    }

    public componentDidUpdate(prevProps: Props) {
        if (this.props.location.key !== prevProps.location.key) {
            this.setState(initialState);
        }
    }

    public render() {
        const { children } = this.props;
        const { error, errorInfo } = this.state;

        if (!error) {
            return children;
        }

        return (
            <Container className="mt-5 mb-5">
                <Card className="bg-transparent" border="danger">
                    <Card.Header className="bg-danger">
                        <FormattedMessage id="error.somethingwentwrong" />
                    </Card.Header>
                    <Card.Body>
                        <Card.Title>
                            {error.name}: {error.message}
                        </Card.Title>
                        <Card.Text as={"pre"} className="bg-transparent text-danger">
                            <code>
                                {`Webpanel Version: ${VERSION}\nWebpanel Mode: ${MODE}\nStack trace: ${
                                    errorInfo?.componentStack ?? "Unable to get stack info"
                                }`}
                            </code>
                        </Card.Text>
                    </Card.Body>
                </Card>
            </Container>
        );
    }
}

export default withRouter(ErrorBoundary);
