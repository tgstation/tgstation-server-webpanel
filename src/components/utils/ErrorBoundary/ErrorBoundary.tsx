import { Component, ErrorInfo, ReactNode } from "react";

import ErrorCard from "../ErrorCard/ErrorCard";

interface IProps {
    children: ReactNode;
    locationKey?: string;
}

interface IState {
    error?: Error;
    errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<IProps, IState> {
    public constructor(props: IProps) {
        super(props);
        this.state = {};
    }

    public componentDidUpdate(prevProps: IProps): void {
        if (this.props.locationKey !== prevProps.locationKey) {
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
                <ErrorCard
                    report={!!this.props.locationKey}
                    error={this.state.error}
                    errorInfo={this.state.errorInfo}
                />
            );
        } else {
            return this.props.children;
        }
    }
}

export default ErrorBoundary;
