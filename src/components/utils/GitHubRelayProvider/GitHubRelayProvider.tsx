import { ReactNode } from "react";
import { FormattedMessage } from "react-intl";
import { RelayEnvironmentProvider } from "react-relay";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import useGitHubRelay from "@/context/github-relay/useGitHubRelay";

interface IProps {
    children: ReactNode;
}

const GitHubRelayContext = (props: IProps) => {
    const gitHubRelayEnvironment = useGitHubRelay();

    if (gitHubRelayEnvironment)
        return (
            <RelayEnvironmentProvider environment={gitHubRelayEnvironment}>
                {props.children}
            </RelayEnvironmentProvider>
        );

    return (
        <Card className="bg-warning text-warning-foreground mb-4 text-center">
            <CardHeader>
                <CardTitle>
                    <FormattedMessage id="error.githubtokenmissing" />
                </CardTitle>
            </CardHeader>
        </Card>
    );
};

export default GitHubRelayContext;
