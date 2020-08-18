import React from "react";
import { Components } from "../../../ApiClient/generatedcode/_generated";
import Loading from "../../utils/Loading";
import UserClient from "../../../ApiClient/UserClient";
import { StatusCode } from "../../../ApiClient/models/InternalComms/InternalStatus";
import InternalError, { ErrorCode } from "../../../ApiClient/models/InternalComms/InternalError";
import ErrorAlert from "../../utils/ErrorAlert";
import { FormattedMessage } from "react-intl";
import Table from "react-bootstrap/Table";
import Tooltip from "react-bootstrap/Tooltip";
import Badge from "react-bootstrap/Badge";
import { timeSince } from "../../../utils/misc";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Button from "react-bootstrap/Button";
import { Link } from "react-router-dom";
import { AppRoutes } from "../../../utils/routes";

interface IProps {}

interface IState {
    errors: Array<InternalError<ErrorCode> | undefined>;
    users: Components.Schemas.User[];
    loading: boolean;
}

export default class UserList extends React.Component<IProps, IState> {
    public constructor(props: IProps) {
        super(props);

        this.state = {
            errors: [],
            users: [],
            loading: true
        };
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

    public async componentDidMount(): Promise<void> {
        const res = await UserClient.listUsers();
        switch (res.code) {
            case StatusCode.OK: {
                this.setState({
                    users: res.payload!
                });
                break;
            }
            case StatusCode.ERROR: {
                this.addError(res.error!);
            }
        }
        this.setState({
            loading: false
        });
    }

    public render(): React.ReactNode {
        if (this.state.loading) {
            return <Loading text="loading.userlist" />;
        }
        return (
            <div className="text-center">
                {this.state.errors.map((err, index) => {
                    if (!err) return;
                    return (
                        <ErrorAlert
                            key={index}
                            error={err}
                            onClose={() =>
                                this.setState(prev => {
                                    const newarr = Array.from(prev.errors);
                                    newarr[index] = undefined;
                                    return {
                                        errors: newarr
                                    };
                                })
                            }
                        />
                    );
                })}
                <Table striped bordered hover variant="dark" responsive>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>
                                <FormattedMessage id="generic.name" />
                            </th>
                            <th>
                                <FormattedMessage id="generic.details" />
                            </th>
                            <th>
                                <FormattedMessage id="generic.created" />
                            </th>
                            <th>
                                <FormattedMessage id="generic.createdby" />
                            </th>
                            <th>
                                <FormattedMessage id="generic.action" />
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.users.map(value => {
                            const createddate = new Date(value.createdAt!);
                            return (
                                <tr key={value.id!}>
                                    <td>{value.id!}</td>
                                    <td>{value.name}</td>
                                    <td>
                                        {value.systemIdentifier! ? (
                                            <Badge variant="primary">
                                                <FormattedMessage id="generic.system.short" />
                                            </Badge>
                                        ) : (
                                            <Badge variant="primary">
                                                <FormattedMessage id="generic.tgs" />
                                            </Badge>
                                        )}{" "}
                                        {value.enabled! ? (
                                            <Badge variant="success">
                                                <FormattedMessage id="generic.enabled" />
                                            </Badge>
                                        ) : (
                                            <Badge variant="danger">
                                                <FormattedMessage id="generic.disabled" />
                                            </Badge>
                                        )}
                                    </td>
                                    <OverlayTrigger
                                        overlay={
                                            <Tooltip id={`${value.name}-tooltip`}>
                                                {createddate.toLocaleString()}
                                            </Tooltip>
                                        }>
                                        {({ ref, ...triggerHandler }) => (
                                            <td {...triggerHandler}>
                                                <span
                                                    ref={
                                                        ref as React.Ref<HTMLSpanElement>
                                                    }>{`${timeSince(createddate)} ago`}</span>
                                            </td>
                                        )}
                                    </OverlayTrigger>
                                    <OverlayTrigger
                                        overlay={
                                            <Tooltip id={`${value.name}-tooltip-createdby`}>
                                                <FormattedMessage id="generic.userid" />
                                                {value.createdBy!.id}
                                            </Tooltip>
                                        }>
                                        {({ ref, ...triggerHandler }) => (
                                            <td {...triggerHandler}>
                                                <span ref={ref as React.Ref<HTMLSpanElement>}>
                                                    {value.createdBy!.name}
                                                </span>
                                            </td>
                                        )}
                                    </OverlayTrigger>
                                    <td className="align-middle p-0">
                                        <Button
                                            as={Link}
                                            to={
                                                (AppRoutes.useredit.link ||
                                                    AppRoutes.useredit.route) + value.id!.toString()
                                            }>
                                            <FormattedMessage id="generic.edit" />
                                        </Button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
            </div>
        );
    }
}
