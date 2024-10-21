import { useEffect, useMemo } from "react";
import { useIntl } from "react-intl";
import { RelayEnvironmentProvider } from "react-relay";

import Router from "../Router/Router";

import Pkg from "@/../package.json";
import useConfig from "@/context/config/useConfig";
import SetCredentialsContext from "@/context/credentials/SetCredentialsContext";
import ErrorsProvider from "@/context/errors/ErrorsProvider";
import SessionProvider from "@/context/session/SessionProvider";
import CreateTgsRelayEnvironment from "@/lib/CreateTgsRelayEnvironment";

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

    return (
        <RelayEnvironmentProvider environment={relayEnviroment}>
            <SetCredentialsContext.Provider value={{ setCredentials }}>
                <SessionProvider>
                    <ErrorsProvider>
                        <Router />
                    </ErrorsProvider>
                </SessionProvider>
            </SetCredentialsContext.Provider>
        </RelayEnvironmentProvider>
    );
};

export default Environment;
