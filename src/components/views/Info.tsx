import { faLinux } from "@fortawesome/free-brands-svg-icons/faLinux";
import { faWindows } from "@fortawesome/free-brands-svg-icons/faWindows";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { FormattedMessage } from "react-intl";

import { Components } from "../../ApiClient/generatedcode/_generated";
import InternalError, { ErrorCode } from "../../ApiClient/models/InternalComms/InternalError";
import { StatusCode } from "../../ApiClient/models/InternalComms/InternalStatus";
import ServerClient from "../../ApiClient/ServerClient";
import { MODE, VERSION } from "../../definitions/constants";
import ErrorAlert from "../utils/ErrorAlert";
import Loading from "../utils/Loading";

interface IProps {}
interface IState {
    serverInfo?: Components.Schemas.ServerInformation;
    error?: InternalError<ErrorCode>;
}

export default class Info extends React.Component<IProps, IState> {
    public constructor(props: IProps) {
        super(props);

        this.state = {};
    }

    public async componentDidMount(): Promise<void> {
        const response = await ServerClient.getServerInfo();
        if (response.code === StatusCode.OK) {
            this.setState({
                serverInfo: response.payload
            });
        } else {
            this.setState({
                error: response.error
            });
        }
    }

    public render(): React.ReactNode {
        return (
            <div className="text-center">
                <ErrorAlert
                    error={this.state.error}
                    onClose={() => this.setState({ error: undefined })}
                />

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

                {!this.state.error ? (
                    !this.state.serverInfo ? (
                        <Loading text="loading.info" />
                    ) : (
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
                                                        this.state.serverInfo.windowsHost
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
                                            <h4>{this.state.serverInfo.version}</h4>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <h4 className="mr-3">
                                                <FormattedMessage id="view.info.httpapiversion" />
                                            </h4>
                                        </td>
                                        <td>
                                            <h4>{this.state.serverInfo.apiVersion}</h4>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <h4 className="mr-3">
                                                <FormattedMessage id="view.info.dmapiversion" />
                                            </h4>
                                        </td>
                                        <td>
                                            <h4>{this.state.serverInfo.dmApiVersion}</h4>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <h4 className="mr-3">
                                                <FormattedMessage id="view.info.minpassword" />
                                            </h4>
                                        </td>
                                        <td>
                                            <h4>{this.state.serverInfo.minimumPasswordLength}</h4>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <h4 className="mr-3">
                                                <FormattedMessage id="view.info.instancelimit" />
                                            </h4>
                                        </td>
                                        <td>
                                            <h4>{this.state.serverInfo.instanceLimit}</h4>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <h4 className="mr-3">
                                                <FormattedMessage id="view.info.userlimit" />
                                            </h4>
                                        </td>
                                        <td>
                                            <h4>{this.state.serverInfo.userLimit}</h4>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <h4 className="mr-3">
                                                <FormattedMessage id="view.info.grouplimit" />
                                            </h4>
                                        </td>
                                        <td>
                                            <h4>{this.state.serverInfo.userGroupLimit}</h4>
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
                                                    this.state.serverInfo.oAuthProviderInfos || {}
                                                ).join(", ")}
                                            </h4>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )
                ) : null}
            </div>
        );
    }
}
