import { useEffect, useMemo } from "react";
import { useIntl } from "react-intl";
import { RelayEnvironmentProvider } from "react-relay";

import Router from "../Router/Router";

import Pkg from "@/../package.json";
import useConfig from "@/context/config/useConfig";
import SetCredentialsContext from "@/context/credentials/SetCredentialsContext";
import ErrorsProvider from "@/context/errors/ErrorsProvider";
import GitHubRelayContext from "@/context/github-relay/GitHubRelayContext";
import SessionProvider from "@/context/session/SessionProvider";
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

    const { relayEnviroment, setCredentials } = useMemo(
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
        <RelayEnvironmentProvider environment={relayEnviroment}>
            <SetCredentialsContext.Provider value={{ setCredentials }}>
                <SessionProvider>
                    <GitHubRelayContext.Provider value={gitHubRelayEnvironment}>
                        <ErrorsProvider>
                            <Router />
                        </ErrorsProvider>
                    </GitHubRelayContext.Provider>
                </SessionProvider>
            </SetCredentialsContext.Provider>
        </RelayEnvironmentProvider>
    );
};

export default Environment;
