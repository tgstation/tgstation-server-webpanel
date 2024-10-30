import { ReactNode } from "react";
import { FormattedMessage } from "react-intl";
import { RelayEnvironmentProvider } from "react-relay";

import ErrorBoundary from "../ErrorBoundary/ErrorBoundary";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import useGitHubRelay from "@/contexts/github-relay/useGitHubRelay";

interface IProps {
    children: ReactNode;
    fallback?: ReactNode;
}

const GitHubRelayContext = (props: IProps) => {
    const gitHubRelayEnvironment = useGitHubRelay();

    if (gitHubRelayEnvironment)
        return (
            <RelayEnvironmentProvider environment={gitHubRelayEnvironment}>
                <ErrorBoundary>{props.children}</ErrorBoundary>
            </RelayEnvironmentProvider>
        );

    return (
        <>
            <Card className="bg-warning text-warning-foreground mb-4 text-center">
                <CardHeader>
                    <CardTitle>
                        <FormattedMessage id="error.githubtokenmissing" />
                    </CardTitle>
                </CardHeader>
            </Card>
            {props.fallback}
        </>
    );
};

export default GitHubRelayContext;
