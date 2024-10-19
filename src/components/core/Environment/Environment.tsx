import { useEffect, useMemo } from "react";
import { useIntl } from "react-intl";
import { RelayEnvironmentProvider } from "react-relay";

import Pkg from "@/../package.json";
import useConfig from "@/context/config/useConfig";
import ErrorsProvider from "@/context/errors/Provider";
import SessionProvider from "@/context/session/Provider";
import CreateRelayEnvironment from "@/lib/CreateRelayEnvironment";
import Router from "../Router/Router";

const Environment = () => {
    const version = Pkg.version;

    const intl = useIntl();

    useEffect(() => {
        document.title = intl.formatMessage({ id: "title" }, { version });
    });

    const config = useConfig();

    const { relayEnviroment, setCredentials } = useMemo(
        () => CreateRelayEnvironment(config.ApiPath.value),
        [config.ApiPath.value]
    );

    return (
        <RelayEnvironmentProvider environment={relayEnviroment}>
            <SessionProvider setCredentials={credentials => setCredentials(credentials, false)}>
                <ErrorsProvider>
                    <Router
                        setTemporaryCredentials={credentials => setCredentials(credentials, true)}
                    />
                </ErrorsProvider>
            </SessionProvider>
        </RelayEnvironmentProvider>
    );
};

export default Environment;
