import { faWindows } from "@fortawesome/free-brands-svg-icons/faWindows";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import Badge from "react-bootstrap/Badge";
import Card from "react-bootstrap/Card";
import Table from "react-bootstrap/esm/Table";
import { FormattedMessage } from "react-intl";

import ByondClient from "../../../../ApiClient/ByondClient";
import { Components } from "../../../../ApiClient/generatedcode/_generated";
import InternalError, { ErrorCode } from "../../../../ApiClient/models/InternalComms/InternalError";
import { StatusCode } from "../../../../ApiClient/models/InternalComms/InternalStatus";
import { Loading } from "../../../utils";

interface IProps {
    instance: Components.Schemas.InstanceResponse;
    selfPermissionSet?: Components.Schemas.PermissionSet;
    selfInstancePermissionSet?: Components.Schemas.InstancePermissionSetResponse;
}

interface IState {
    errors: Array<InternalError<ErrorCode> | undefined>;
    loading: boolean;
    currentByondVer: Array<string>;
}

export default class Info extends React.Component<IProps, IState> {
    public constructor(props: IProps) {
        super(props);

        this.state = {
            errors: [],
            loading: true,
            currentByondVer: ["0", "0", "0"] // major.minor.custom
        };
    }

    public async componentDidMount(): Promise<void> {
        const verRequest = await ByondClient.getActiveVersion(this.props.instance.id);
        if (verRequest.code === StatusCode.OK) {
            if (verRequest.payload.version) {
                this.setState({
                    currentByondVer: verRequest.payload.version.split(".")
                });
            }
        } else {
            this.addError(verRequest.error);
        }
        this.setState({
            loading: false
        });
    }

    private addError(error: InternalError<ErrorCode>): void {
        this.setState(prevState => {
            const errors = Array.from(prevState.errors);
            errors.push(error);
            return {
                errors
            };
        });
    }

    public render(): React.ReactNode {
        if (this.state.loading) {
            return <Loading text="loading.instance" />;
        }

        const byondVer = this.state?.currentByondVer || null;

        return (
            <Card>
                <Card.Header>Information</Card.Header>
                <Table striped hover>
                    <tbody>
                        <tr>
                            <td>ID</td>
                            <td colSpan={2}>
                                <code>{this.props.instance.id}</code>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <FormattedMessage id="generic.status" />
                            </td>
                            <td>
                                {this.props.instance.online ? (
                                    <Badge variant="success">
                                        <FormattedMessage id="generic.online" />
                                    </Badge>
                                ) : (
                                    <Badge variant="danger">
                                        <FormattedMessage id="generic.offline" />
                                    </Badge>
                                )}
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <FormattedMessage id="generic.path" />
                            </td>
                            <td>
                                <code>{this.props.instance.path}</code>
                            </td>
                        </tr>
                        <tr>
                            <td>Installed Byond Version</td>
                            <td>
                                <code>
                                    {byondVer[0] === "0" && byondVer[1] === "0"
                                        ? "Unknown"
                                        : `${byondVer[0]}.${byondVer[1]}`}
                                </code>
                                {byondVer[0] !== "0" &&
                                    byondVer[1] !== "0" &&
                                    (byondVer[2] == "0" ? (
                                        byondVer && (
                                            <>
                                                {" | "}
                                                <a
                                                    href={`https://secure.byond.com/download/build/${byondVer[0]}/${byondVer[0]}.${byondVer[1]}_byond.exe`}
                                                    target="_blank"
                                                    rel="noreferrer">
                                                    <FormattedMessage id="generic.download" />{" "}
                                                    <FontAwesomeIcon icon={faWindows} />
                                                </a>
                                            </>
                                        )
                                    ) : (
                                        <>
                                            {" | "}
                                            Custom install
                                        </>
                                    ))}
                            </td>
                        </tr>
                        <tr>
                            <td>Chat Bot Limit</td>
                            <td>
                                <code>{this.props.instance.chatBotLimit}</code>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <FormattedMessage id="generic.configmode" />
                            </td>
                            <td>
                                <code>
                                    <FormattedMessage
                                        id={`view.instance.configmode.${this.props.instance.configurationType.toString()}`}
                                    />
                                </code>
                            </td>
                        </tr>
                    </tbody>
                </Table>
            </Card>
        );
    }
}
