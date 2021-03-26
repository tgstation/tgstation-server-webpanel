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
import { Loading, WIPNotice } from "../../../utils";

interface IProps {
    instance: Components.Schemas.InstanceResponse;
    selfPermissionSet?: Components.Schemas.PermissionSet;
    selfInstancePermissionSet?: Components.Schemas.InstancePermissionSetResponse;
}

interface IState {
    errors: Array<InternalError<ErrorCode> | undefined>;
    loading: boolean;
}

export default class Chatbot extends React.Component<IProps, IState> {
    public constructor(props: IProps) {
        super(props);

        this.state = {
            errors: [],
            loading: true
        };
    }

    public componentDidMount(): void {
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

        return (
            <Card>
                <Card.Header>Information</Card.Header>
                <WIPNotice />
            </Card>
        );
    }
}
