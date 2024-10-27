import { useEffect, useMemo } from "react";
import { useIntl } from "react-intl";
import { RelayEnvironmentProvider } from "react-relay";

import Router from "../Router/Router";
import SessionSubscriptions from "../SessionSubscriptions/SessionSubscriptions";

import Pkg from "@/../package.json";
import useConfig from "@/contexts/config/useConfig";
import SetCredentialsContext from "@/contexts/credentials/SetCredentialsContext";
import ErrorsProvider from "@/contexts/errors/ErrorsProvider";
import GitHubRelayContext from "@/contexts/github-relay/GitHubRelayContext";
import SessionProvider from "@/contexts/session/SessionProvider";
import CreateGitHubRelayEnvironment from "@/lib/CreateGitHubRelayEnvironment";
import CreateTgsRelayEnvironment from "@/lib/CreateTgsRelayEnvironment";
import { BearerCredentials } from "@/lib/Credentials";

const Environment = () => {
    const version = Pkg.version;

    const intl = useIntl();

    useEffect(() => {
        document.title = intl.formatMessage({ id: "title" }, { version });
    });

    const config = useConfig();

    const { relayEnviroment, setCredentials, blockRequests } = useMemo(
        () => CreateTgsRelayEnvironment(config.ApiPath.value),
        [config.ApiPath.value]
    );

    const gitHubRelayEnvironment = useMemo(() => {
        if (config.GitHubToken.value && config.GitHubToken.value.length > 0) {
            return CreateGitHubRelayEnvironment(new BearerCredentials(config.GitHubToken.value));
        }
        return null;
    }, [config.GitHubToken.value]);

    return (
        <GitHubRelayContext.Provider value={gitHubRelayEnvironment}>
            <RelayEnvironmentProvider environment={relayEnviroment}>
                <SetCredentialsContext.Provider
                    value={{ setCredentials, clearCredentials: () => setCredentials(null, false) }}>
                    <SessionProvider
                        renderOnSession={<SessionSubscriptions blockRequests={blockRequests} />}>
                        <ErrorsProvider>
                            <Router />
                        </ErrorsProvider>
                    </SessionProvider>
                </SetCredentialsContext.Provider>
            </RelayEnvironmentProvider>
        </GitHubRelayContext.Provider>
    );
};

export default Environment;
