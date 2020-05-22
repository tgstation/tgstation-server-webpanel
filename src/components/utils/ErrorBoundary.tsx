import React from 'react';
import Card from 'react-bootstrap/Card';
import { withRouter, RouteComponentProps } from 'react-router';

interface IProps extends RouteComponentProps {}
interface IState {
    error?: Error;
    errorInfo?: React.ErrorInfo;
}

class ErrorBoundary extends React.Component<IProps, IState> {
    public constructor(props: IProps) {
        super(props);
        this.state = {};
    }

    public componentDidUpdate(prevProps: IProps): void {
        if (this.props.location.key !== prevProps.location.key) {
            this.setState({
                error: undefined,
                errorInfo: undefined
            });
        }
    }

    public componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        this.setState({
            error,
            errorInfo
        });
    }

    public render(): React.ReactNode {
        if (this.state.error) {
            return (
                <Card className="bg-transparent" border="danger">
                    <Card.Header className="bg-danger">Uh oh.... Something went wrong!</Card.Header>
                    <Card.Body>
                        <Card.Title>
                            {this.state.error.name}: {this.state.error.message}
                        </Card.Title>
                        <Card.Text as={'pre'} className="bg-transparent text-danger">
                            <code>
                                {this.state.errorInfo
                                    ? `Control Panel Version: ${VERSION}\nControl Panel Mode: ${MODE}\nStack trace: ${this.state.errorInfo.componentStack}`
                                    : 'This error seems to come straight from hell. God help whoever has to debug this'}
                            </code>
                        </Card.Text>
                    </Card.Body>
                </Card>
            );
        } else {
            return this.props.children;
        }
    }
}

export default withRouter(ErrorBoundary);
