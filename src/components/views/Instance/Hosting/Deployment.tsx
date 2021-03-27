import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { ChangeEvent } from "react";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import CardColumns from "react-bootstrap/CardColumns";
import Table from "react-bootstrap/esm/Table";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { FormattedMessage } from "react-intl";

import DreamMakerClient from "../../../../ApiClient/DreamMakerClient";
import {
    ErrorCode as TGSErrorCode,
    RemoteGitProvider,
    RepositoryRights
} from "../../../../ApiClient/generatedcode/_enums";
import { Components } from "../../../../ApiClient/generatedcode/_generated";
import InstancePermissionSetClient from "../../../../ApiClient/InstancePermissionSetClient";
import InternalError, { ErrorCode } from "../../../../ApiClient/models/InternalComms/InternalError";
import InternalStatus, {
    StatusCode
} from "../../../../ApiClient/models/InternalComms/InternalStatus";
import RepositoryClient from "../../../../ApiClient/RepositoryClient";
import JobsController from "../../../../ApiClient/util/JobsController";
import GitHubClient, { CommitData, PRData } from "../../../../utils/GithubClient";
import { Loading, WIPNotice } from "../../../utils";

interface IProps {
    instance: Components.Schemas.InstanceResponse;
    selfPermissionSet?: Components.Schemas.PermissionSet;
    selfInstancePermissionSet: Components.Schemas.InstancePermissionSetResponse;
}

interface IState {
    loading: boolean;
    errors: Array<InternalError<ErrorCode> | undefined>;

    modifiedValues: { [key: string]: string | number | boolean };
}

export default class Deployment extends React.Component<IProps, IState> {
    public constructor(props: IProps) {
        super(props);

        this.state = {
            errors: [],
            loading: false,
            modifiedValues: {}
        };
    }

    // public async componentDidMount(): Promise<void> {
    //     this.setState({
    //         loading: true
    //     });
    //     await this.refresh();

    //     this.setState({
    //         loading: false
    //     });
    // }

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

        return (
            <CardColumns className={"card-colum-cfg"}>
                {/* TM */}
                <Card>
                    <Card.Header>Builds</Card.Header>
                    <Card.Body>
                        <WIPNotice />
                    </Card.Body>
                </Card>
                {/* Creds */}
                <Card>
                    <Card.Header>Deployment</Card.Header>
                    <Card.Body>
                        <WIPNotice />
                    </Card.Body>
                </Card>
                {/* Config */}
                <Card>
                    <Card.Header>Repository Settings</Card.Header>
                    <Card.Body>
                        <WIPNotice />
                    </Card.Body>
                </Card>
            </CardColumns>
        );
    }
}
