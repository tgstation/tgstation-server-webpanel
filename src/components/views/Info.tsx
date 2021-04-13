import { faLinux } from "@fortawesome/free-brands-svg-icons/faLinux";
import { faWindows } from "@fortawesome/free-brands-svg-icons/faWindows";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { FormattedMessage } from "react-intl";

import { GeneralContext, UnsafeGeneralContext } from "../../contexts/GeneralContext";
import { MODE, VERSION } from "../../definitions/constants";
import { Loading } from "../utils";

interface IProps {}
interface IState {}

class Info extends React.Component<IProps, IState> {
    public declare context: UnsafeGeneralContext;
    public render(): React.ReactNode {
        return (
            <div className="text-center">
                <h3>
                    <FormattedMessage id="view.info.client" />
                </h3>
                <div className="text-secondary">
                    <h4>
                        <FormattedMessage id="view.info.version" />
                        {`${VERSION} (${MODE})`}
                    </h4>
                </div>

                <hr />

                <h3>
                    <FormattedMessage id="view.info.server" />
                </h3>

                {!this.context.serverInfo ? (
                    <Loading text="loading.info" />
                ) : (
                    <React.Fragment>
                        <div className="text-secondary">
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
                                                    icon={
                                                        this.context.serverInfo.windowsHost
                                                            ? faWindows
                                                            : faLinux
                                                    }
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
                                            <h4>{this.context.serverInfo.version}</h4>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <h4 className="mr-3">
                                                <FormattedMessage id="view.info.httpapiversion" />
                                            </h4>
                                        </td>
                                        <td>
                                            <h4>{this.context.serverInfo.apiVersion}</h4>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <h4 className="mr-3">
                                                <FormattedMessage id="view.info.dmapiversion" />
                                            </h4>
                                        </td>
                                        <td>
                                            <h4>{this.context.serverInfo.dmApiVersion}</h4>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <h4 className="mr-3">
                                                <FormattedMessage id="view.info.minpassword" />
                                            </h4>
                                        </td>
                                        <td>
                                            <h4>{this.context.serverInfo.minimumPasswordLength}</h4>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <h4 className="mr-3">
                                                <FormattedMessage id="view.info.instancelimit" />
                                            </h4>
                                        </td>
                                        <td>
                                            <h4>{this.context.serverInfo.instanceLimit}</h4>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <h4 className="mr-3">
                                                <FormattedMessage id="view.info.userlimit" />
                                            </h4>
                                        </td>
                                        <td>
                                            <h4>{this.context.serverInfo.userLimit}</h4>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <h4 className="mr-3">
                                                <FormattedMessage id="view.info.grouplimit" />
                                            </h4>
                                        </td>
                                        <td>
                                            <h4>{this.context.serverInfo.userGroupLimit}</h4>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <h4 className="mr-3">
                                                <FormattedMessage id="view.info.oauth" />
                                            </h4>
                                        </td>
                                        <td>
                                            <h4>
                                                {Object.keys(
                                                    this.context.serverInfo.oAuthProviderInfos || {}
                                                ).join(", ")}
                                            </h4>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        {this.context.serverInfo.swarmServers?.length ? (
                            <React.Fragment>
                                <hr />

                                <FormattedMessage id="view.info.swarm" tagName="h3" />

                                {this.context.serverInfo.swarmServers.map(server => {
                                    return (
                                        <h4
                                            key={server.identifier}
                                            className={
                                                server.controller
                                                    ? "font-weight-bold text-secondary"
                                                    : "text-secondary"
                                            }>
                                            {server.identifier} ({server.address}){" "}
                                            {server.controller ? (
                                                <FormattedMessage id="view.info.controller" />
                                            ) : null}
                                        </h4>
                                    );
                                })}
                            </React.Fragment>
                        ) : null}
                    </React.Fragment>
                )}
            </div>
        );
    }
}

Info.contextType = GeneralContext;
export default Info;
