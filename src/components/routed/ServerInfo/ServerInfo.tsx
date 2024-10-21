import { faLinux, faWindows } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FormattedMessage } from "react-intl";
import { PreloadedQuery, usePreloadedQuery } from "react-relay";

import { ServerInformationQuery } from "./graphql/__generated__/ServerInformationQuery.graphql";
import ServerInformation from "./graphql/ServerInformation";

import Pkg from "@/../package.json";
import capitalizeFirstLetter from "@/lib/capitalizeFirstLetter";

interface IProps {
    queryRef: PreloadedQuery<ServerInformationQuery> | null;
}

const ServerInfo = (props: IProps) => {
    if (!props.queryRef) {
        throw new Error("ServerInformationQuery ref was null");
    }

    const data = usePreloadedQuery<ServerInformationQuery>(ServerInformation, props.queryRef);
    const gatewayInfo = data.swarm.currentNode.gateway.information;
    const activeOAuthProviders = Object.keys(gatewayInfo.oAuthProviderInfos ?? {}).filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        key => !!(gatewayInfo.oAuthProviderInfos as any)[key]
    );

    return (
        <div className="text-center text-lg">
            <h3>
                <FormattedMessage id="view.info.client" />
            </h3>
            <div className="text-primary">
                <h4>
                    <FormattedMessage id="view.info.version" />
                    {`${Pkg.version} (${import.meta.env.MODE.toLocaleUpperCase()})`}
                </h4>
            </div>

            <hr />

            <h3>
                <FormattedMessage id="view.info.server" />
            </h3>
            <div className="text-primary">
                <table className="mx-auto text-left">
                    <tbody>
                        <tr>
                            <td>
                                <h4 className="mr-3">
                                    <FormattedMessage id="view.admin.hostos" />
                                </h4>
                            </td>
                            <td>
                                <h4>
                                    <FontAwesomeIcon
                                        fixedWidth
                                        icon={gatewayInfo.windowsHost ? faWindows : faLinux}
                                    />
                                </h4>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <h4 className="mr-3">
                                    <FormattedMessage id="view.info.version" />
                                </h4>
                            </td>
                            <td>
                                <h4>{gatewayInfo.version}</h4>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <h4 className="mr-3">
                                    <FormattedMessage id="view.info.gqlapiversion" />
                                </h4>
                            </td>
                            <td>
                                <h4>{gatewayInfo.apiVersion}</h4>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <h4 className="mr-3">
                                    <FormattedMessage id="view.info.dmapiversion" />
                                </h4>
                            </td>
                            <td>
                                <h4>{gatewayInfo.dmApiVersion}</h4>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <h4 className="mr-3">
                                    <FormattedMessage id="view.info.swarmversion" />
                                </h4>
                            </td>
                            <td>
                                <h4>{gatewayInfo.swarmProtocolVersion}</h4>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <h4 className="mr-3">
                                    <FormattedMessage id="view.info.minpassword" />
                                </h4>
                            </td>
                            <td>
                                <h4>{gatewayInfo.minimumPasswordLength}</h4>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <h4 className="mr-3">
                                    <FormattedMessage id="view.info.instancelimit" />
                                </h4>
                            </td>
                            <td>
                                <h4>{gatewayInfo.instanceLimit}</h4>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <h4 className="mr-3">
                                    <FormattedMessage id="view.info.userlimit" />
                                </h4>
                            </td>
                            <td>
                                <h4>{gatewayInfo.userLimit}</h4>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <h4 className="mr-3">
                                    <FormattedMessage id="view.info.grouplimit" />
                                </h4>
                            </td>
                            <td>
                                <h4>{gatewayInfo.userGroupLimit}</h4>
                            </td>
                        </tr>
                        {activeOAuthProviders.length > 0 ? (
                            <tr>
                                <td>
                                    <h4 className="mr-3">
                                        <FormattedMessage id="view.info.oauth" />
                                    </h4>
                                </td>
                                <td>
                                    <h4>
                                        {activeOAuthProviders.map(capitalizeFirstLetter).join(", ")}
                                    </h4>
                                </td>
                            </tr>
                        ) : null}
                    </tbody>
                </table>
            </div>
            {data.swarm.nodes?.length ? (
                <>
                    <hr />

                    <FormattedMessage id="view.info.swarm" tagName="h3" />

                    {data.swarm.nodes.map(server => {
                        return (
                            <h4
                                key={server.identifier}
                                className={
                                    server.controller
                                        ? "font-weight-bold text-primary"
                                        : "text-primary"
                                }>
                                {server.identifier} ({server.address}){" "}
                                {server.controller ? (
                                    <FormattedMessage id="view.info.controller" />
                                ) : null}
                            </h4>
                        );
                    })}
                </>
            ) : null}
        </div>
    );
};

export default ServerInfo;
