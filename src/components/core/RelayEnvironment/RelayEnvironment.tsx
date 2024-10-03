import { useContext, useEffect, useMemo } from "react";
import { useIntl } from "react-intl";
import { RelayEnvironmentProvider } from "react-relay";

import Pkg from "../../../../package.json";
import Layout from "../Layout/Layout";

import ConfigContext from "@/context/config/Context";
import CreateRelayEnvironment from "@/utils/CreateRelayEnvironment";

const RelayEnvironment = () => {
    const version = Pkg.version;

    const intl = useIntl();

    useEffect(() => {
        document.title = intl.formatMessage({ id: "title" }, { version });
    });

    const config = useContext(ConfigContext);

    const { relayEnviroment, setBearer } = useMemo(
        () => CreateRelayEnvironment(config.ApiPath.value),
        [config.ApiPath]
    );

    return (
        <RelayEnvironmentProvider environment={relayEnviroment}>
            <Layout setBearer={setBearer} />
        </RelayEnvironmentProvider>
    );
};

export default RelayEnvironment;
