import { useContext, useEffect, useMemo } from "react";
import { useIntl } from "react-intl";
import { RelayEnvironmentProvider } from "react-relay";

import Layout from "../Layout/Layout";

import Pkg from "@/../package.json";
import ConfigContext from "@/context/config/Context";
import SessionProvider from "@/context/session/Provider";
import CreateRelayEnvironment from "@/lib/CreateRelayEnvironment";

const RelayEnvironment = () => {
    const version = Pkg.version;

    const intl = useIntl();

    useEffect(() => {
        document.title = intl.formatMessage({ id: "title" }, { version });
    });

    const config = useContext(ConfigContext);

    const { relayEnviroment, setAuthorizationHeader } = useMemo(
        () => CreateRelayEnvironment(config.ApiPath.value),
        [config.ApiPath.value]
    );

    return (
        <RelayEnvironmentProvider environment={relayEnviroment}>
            <SessionProvider
                setBearer={bearer => setAuthorizationHeader(`Bearer ${bearer}`, false)}>
                <Layout setTemporaryHeader={header => setAuthorizationHeader(header, true)} />
            </SessionProvider>
        </RelayEnvironmentProvider>
    );
};

export default RelayEnvironment;
