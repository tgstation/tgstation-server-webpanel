import { useContext, useEffect, useMemo } from "react";
import { useIntl } from "react-intl";
import { RelayEnvironmentProvider } from "react-relay";

import Layout from "../Layout/Layout";

import Pkg from "@/../package.json";
import ConfigContext from "@/context/config/Context";
import ErrorsProvider from "@/context/errors/Provider";
import SessionProvider from "@/context/session/Provider";
import CreateRelayEnvironment from "@/lib/CreateRelayEnvironment";

const RelayEnvironment = () => {
    const version = Pkg.version;

    const intl = useIntl();

    useEffect(() => {
        document.title = intl.formatMessage({ id: "title" }, { version });
    });

    const config = useContext(ConfigContext);

    const { relayEnviroment, setCredentials } = useMemo(
        () => CreateRelayEnvironment(config.ApiPath.value),
        [config.ApiPath.value]
    );

    return (
        <RelayEnvironmentProvider environment={relayEnviroment}>
            <SessionProvider setCredentials={credentials => setCredentials(credentials, false)}>
                <ErrorsProvider>
                    <Layout
                        setTemporaryCredentials={credentials => setCredentials(credentials, true)}
                    />
                </ErrorsProvider>
            </SessionProvider>
        </RelayEnvironmentProvider>
    );
};

export default RelayEnvironment;
