import React, { ReactNode } from "react";
import { Components } from "../../../ApiClient/generatedcode/_generated";
import Loading from "../../utils/Loading";
import InstanceClient from "../../../ApiClient/InstanceClient";
import { StatusCode } from "../../../ApiClient/models/InternalComms/InternalStatus";
import InternalError, { ErrorCode } from "../../../ApiClient/models/InternalComms/InternalError";
import ErrorAlert from "../../utils/ErrorAlert";
import { FormattedMessage } from "react-intl";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Table";

interface IState {
    instances: Components.Schemas.Instance[];
    loading?: boolean;
    errors: Array<InternalError<ErrorCode> | undefined>;
}
interface IProps {}

export default class InstanceList extends React.Component<IProps, IState> {
    public constructor(props: IProps) {
        super(props);

        this.state = {
            loading: true,
            instances: [],
            errors: []
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
        const instancelist = await InstanceClient.listInstances();
        if (instancelist.code == StatusCode.OK) {
            this.setState({
                instances: instancelist.payload!
            });
        } else {
            this.addError(instancelist.error!);
        }

        this.setState({
            loading: false
        });
    }

    public render(): ReactNode {
        if (this.state.loading) {
            return <Loading text="loading.instance.list" />;
        }

        return (
            <div className="text-center">
                <h3>
                    <FormattedMessage id="view.instance.list.title" />
                </h3>
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
                                <FormattedMessage id="generic.online" />
                            </th>
                            <th>
                                <FormattedMessage id="generic.path" />
                            </th>
                            <th>
                                <FormattedMessage id="generic.configmode" />
                            </th>
                            <th>
                                <FormattedMessage id="generic.action" />
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.instances.map(value => {
                            return (
                                <tr key={value.id}>
                                    <td>{value.id}</td>
                                    <td>{value.name}</td>
                                    <td>
                                        {value.online! ? (
                                            <Badge variant="success">
                                                <FormattedMessage id="generic.online" />
                                            </Badge>
                                        ) : (
                                            <Badge variant="danger">
                                                <FormattedMessage id="generic.offline" />
                                            </Badge>
                                        )}
                                    </td>
                                    <td>{value.path}</td>
                                    <td>
                                        <FormattedMessage
                                            id={`view.instance.configmode.${value.configurationType!.toString()}`}
                                        />
                                    </td>
                                    <td className="align-middle p-0">
                                        <Button
                                        /*onClick={() => {
                                            if (!AppRoutes.useredit.data)
                                                AppRoutes.useredit.data = {};
                                            AppRoutes.useredit.data.lastid = value.id!.toString();
                                            this.props.history.push(
                                                AppRoutes.useredit.link ||
                                                AppRoutes.useredit.route
                                            );
                                        }}*/
                                        >
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
