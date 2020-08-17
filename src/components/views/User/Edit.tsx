import { RouteComponentProps, withRouter } from "react-router";
import React, { ChangeEvent } from "react";
import Loading from "../../utils/Loading";
import ErrorAlert from "../../utils/ErrorAlert";
import InternalError, { ErrorCode } from "../../../ApiClient/models/InternalComms/InternalError";
import { Components } from "../../../ApiClient/generatedcode/_generated";
import UserClient from "../../../ApiClient/UserClient";
import { StatusCode } from "../../../ApiClient/models/InternalComms/InternalStatus";
import { FormattedMessage } from "react-intl";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Badge from "react-bootstrap/Badge";
import Tooltip from "react-bootstrap/Tooltip";
import InputGroup from "react-bootstrap/InputGroup";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { timeSince } from "../../../utils/misc";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import {
    AdministrationRights,
    InstanceManagerRights
} from "../../../ApiClient/generatedcode/_enums";
import { AppRoutes } from "../../../utils/routes";

interface IProps extends RouteComponentProps<{ id: string; tab?: string }> {}

interface IState {
    errors: Array<InternalError<ErrorCode> | undefined>;
    user?: Components.Schemas.User;
    loading: boolean;
    permsadmin: { [key: string]: Permission };
    permsinstance: { [key: string]: Permission };
}

interface Permission {
    readonly bitflag: number;
    readonly currentVal: boolean;
    newVal: boolean;
}

export default withRouter(
    class UserEdit extends React.Component<IProps, IState> {
        public constructor(props: IProps) {
            super(props);

            this.state = {
                errors: [],
                loading: true,
                permsadmin: {},
                permsinstance: {}
            };
        }

        public async componentDidMount(): Promise<void> {
            const response = await UserClient.getUser(parseInt(this.props.match.params.id));
            switch (response.code) {
                case StatusCode.ERROR: {
                    this.addError(response.error!);
                    break;
                }
                case StatusCode.OK: {
                    this.setState({
                        user: response.payload!
                    });
                    this.loadEnums();
                    break;
                }
            }
            this.setState({
                loading: false
            });
        }

        private loadEnums(): void {
            // noinspection DuplicatedCode
            Object.entries(AdministrationRights).forEach(([k, v]) => {
                /* enums are objects that are reverse mapped, for example, an enum with a = 1 and b = 2 would look like this:
                 * {
                 *   "a": 1,
                 *   "b": 2,
                 *   1: "a",
                 *   2: "b"
                 * }
                 * so we need to drop everything that doesnt resolve to a string because otherwise we end up with twice the values
                 */
                if (!isNaN(parseInt(k))) return;

                const key = k.toLowerCase();
                const val = v as number;

                //we dont care about nothing
                if (key == "none") return;

                const currentVal = !!(this.state.user!.administrationRights! & val);
                this.setState(prevState => {
                    return {
                        permsadmin: {
                            ...prevState.permsadmin,
                            [key]: {
                                currentVal,
                                newVal: currentVal,
                                bitflag: val
                            }
                        }
                    };
                });
            });
            // noinspection DuplicatedCode
            Object.entries(InstanceManagerRights).forEach(([k, v]) => {
                if (!isNaN(parseInt(k))) return;

                const key = k.toLowerCase();
                const val = v as number;

                //we dont care about nothing
                if (key == "none") return;

                const currentVal = !!(this.state.user!.instanceManagerRights! & val);
                this.setState(prevState => {
                    return {
                        permsinstance: {
                            ...prevState.permsinstance,
                            [key]: {
                                currentVal,
                                newVal: currentVal,
                                bitflag: val
                            }
                        }
                    };
                });
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
                return <Loading text="loading.user" />;
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
                    {this.state.user ? (
                        <React.Fragment>
                            {this.state.user.systemIdentifier ? (
                                <Badge variant="primary">
                                    <FormattedMessage id="generic.system.short" />
                                </Badge>
                            ) : (
                                <Badge variant="primary">
                                    <FormattedMessage id="generic.tgs" />
                                </Badge>
                            )}{" "}
                            {this.state.user.enabled ? (
                                <Badge variant="success">
                                    <FormattedMessage id="generic.enabled" />
                                </Badge>
                            ) : (
                                <Badge variant="danger">
                                    <FormattedMessage id="generic.disabled" />
                                </Badge>
                            )}
                            <h3 className="text-capitalize">{this.state.user.name}</h3>
                            <Tabs
                                activeKey={this.props.match.params.tab || "info"}
                                onSelect={newkey => {
                                    if (!newkey) return;

                                    this.props.history.push(
                                        (AppRoutes.useredit.link || AppRoutes.useredit.route) +
                                            this.props.match.params.id +
                                            "/" +
                                            newkey
                                    );
                                }}
                                id="test"
                                className="justify-content-center mb-3 mt-4 flex-column flex-md-row">
                                <Tab eventKey="info" title={<FormattedMessage id="generic.info" />}>
                                    {this.props.match.params.tab === "info" ||
                                    this.props.match.params.tab === undefined ? (
                                        <Col lg={5} className="text-center text-md-left mx-auto">
                                            <Row xs={1} md={2}>
                                                <Col>
                                                    <h5 className="m-0">
                                                        <FormattedMessage id="generic.userid" />
                                                    </h5>
                                                </Col>
                                                <Col className="text-capitalize mb-2">
                                                    {this.state.user.id}
                                                </Col>
                                            </Row>
                                            {this.state.user.systemIdentifier ? (
                                                <Row xs={1} md={2}>
                                                    <Col>
                                                        <h5 className="m-0">
                                                            <FormattedMessage id="generic.systemidentifier" />
                                                        </h5>
                                                    </Col>
                                                    <Col className="mb-2 text-sm-break">
                                                        {this.state.user.systemIdentifier}
                                                    </Col>
                                                </Row>
                                            ) : (
                                                ""
                                            )}
                                            <Row xs={1} md={2}>
                                                <Col>
                                                    <h5 className="m-0">
                                                        <FormattedMessage id="generic.enabled" />
                                                    </h5>
                                                </Col>
                                                <Col className="text-capitalize mb-2">
                                                    {this.state.user.enabled!.toString()}
                                                </Col>
                                            </Row>
                                            <Row xs={1} md={2}>
                                                <Col>
                                                    <h5 className="m-0">
                                                        <FormattedMessage id="generic.created" />
                                                    </h5>
                                                </Col>
                                                <OverlayTrigger
                                                    overlay={
                                                        <Tooltip
                                                            id={`${this.state.user.name}-tooltip`}>
                                                            {new Date(
                                                                this.state.user.createdAt!
                                                            ).toLocaleString()}
                                                        </Tooltip>
                                                    }>
                                                    {({ ref, ...triggerHandler }) => (
                                                        <Col
                                                            className="text-capitalize mb-2"
                                                            {...triggerHandler}>
                                                            <span
                                                                ref={
                                                                    ref as React.Ref<
                                                                        HTMLSpanElement
                                                                    >
                                                                }>{`${timeSince(
                                                                new Date(
                                                                    this.state.user!.createdAt!
                                                                )
                                                            )} ago`}</span>
                                                        </Col>
                                                    )}
                                                </OverlayTrigger>
                                            </Row>
                                            <Row xs={1} md={2}>
                                                <Col>
                                                    <h5 className="m-0">
                                                        <FormattedMessage id="generic.createdby" />
                                                    </h5>
                                                </Col>
                                                <OverlayTrigger
                                                    overlay={
                                                        <Tooltip
                                                            id={`${this.state.user.name}-tooltip-createdby`}>
                                                            <FormattedMessage id="generic.userid" />
                                                            {this.state.user.createdBy!.id}
                                                        </Tooltip>
                                                    }>
                                                    {({ ref, ...triggerHandler }) => (
                                                        <Col
                                                            className="text-capitalize mb-2"
                                                            {...triggerHandler}>
                                                            <span
                                                                ref={
                                                                    ref as React.Ref<
                                                                        HTMLSpanElement
                                                                    >
                                                                }>
                                                                {this.state.user!.createdBy!.name}
                                                            </span>
                                                        </Col>
                                                    )}
                                                </OverlayTrigger>
                                            </Row>
                                        </Col>
                                    ) : (
                                        ""
                                    )}
                                </Tab>
                                <Tab
                                    eventKey="adminperms"
                                    title={<FormattedMessage id="perms.admin" />}>
                                    {this.props.match.params.tab === "adminperms"
                                        ? this.renderPerms("permsadmin", "admin")
                                        : ""}
                                </Tab>
                                <Tab
                                    eventKey="instanceperms"
                                    title={<FormattedMessage id="perms.instance" />}>
                                    {this.props.match.params.tab === "instanceperms"
                                        ? this.renderPerms("permsinstance", "instance")
                                        : ""}
                                </Tab>
                            </Tabs>
                        </React.Fragment>
                    ) : (
                        ""
                    )}
                </div>
            );
        }

        private renderPerms(
            enumname: "permsadmin" | "permsinstance",
            permprefix: string
        ): React.ReactNode {
            const setAll = (val: boolean): (() => void) => {
                return () => {
                    this.setState(prevState => {
                        const newobj: { [key: string]: Permission } = {};
                        for (const [key, permission] of Object.entries(prevState[enumname])) {
                            const newperm = Object.assign({}, permission);
                            newperm.newVal = val;
                            newobj[key] = newperm;
                        }

                        return {
                            ...prevState,
                            [enumname]: newobj
                        };
                    });
                };
            };
            const resetAll = () => {
                this.setState(prevState => {
                    const newobj: { [key: string]: Permission } = {};
                    for (const [key, permission] of Object.entries(prevState[enumname])) {
                        const newperm = Object.assign({}, permission);
                        newperm.newVal = newperm.currentVal;
                        newobj[key] = newperm;
                    }

                    return {
                        ...prevState,
                        [enumname]: newobj
                    };
                });
            };
            return (
                <React.Fragment>
                    <h5>
                        <FormattedMessage id="generic.setall" />
                    </h5>
                    <Button onClick={setAll(true)}>
                        <FormattedMessage id="generic.true" />
                    </Button>{" "}
                    <Button onClick={setAll(false)}>
                        <FormattedMessage id="generic.false" />
                    </Button>{" "}
                    <Button onClick={resetAll}>
                        <FormattedMessage id="generic.reset" />
                    </Button>
                    <Col md={8} lg={7} xl={6} className="mx-auto">
                        <hr />
                        {Object.entries(this.state[enumname]).map(([perm, value]) => {
                            return (
                                <InputGroup key={perm} as="label" htmlFor={perm} className="mb-0">
                                    <InputGroup.Prepend className="flex-grow-1 overflow-auto">
                                        <OverlayTrigger
                                            overlay={
                                                <Tooltip id={`perms.${permprefix}.${perm}.desc`}>
                                                    <FormattedMessage
                                                        id={`perms.${permprefix}.${perm}.desc`}
                                                    />
                                                </Tooltip>
                                            }>
                                            {({ ref, ...triggerHandler }) => (
                                                <InputGroup.Text
                                                    className={`flex-fill ${
                                                        value.currentVal !== value.newVal
                                                            ? "font-weight-bold"
                                                            : ""
                                                    }`}
                                                    {...triggerHandler}>
                                                    <FormattedMessage
                                                        id={`perms.${permprefix}.${perm}`}
                                                    />
                                                    <div className="ml-auto d-flex align-items-center">
                                                        <Form.Check
                                                            inline
                                                            type="switch"
                                                            custom
                                                            id={perm}
                                                            className="d-flex justify-content-center align-content-center mx-2"
                                                            label=""
                                                            onChange={(
                                                                event: ChangeEvent<HTMLInputElement>
                                                            ) => {
                                                                const checked =
                                                                    event.target.checked;
                                                                this.setState(prevState => {
                                                                    const permission: Permission = Object.assign(
                                                                        {},
                                                                        prevState[enumname][perm]
                                                                    );
                                                                    permission.newVal = checked;
                                                                    return {
                                                                        ...prevState,
                                                                        [enumname]: {
                                                                            ...prevState[enumname],
                                                                            [perm]: permission
                                                                        }
                                                                    };
                                                                });
                                                            }}
                                                            checked={value.newVal}
                                                        />
                                                        <div ref={ref as React.Ref<HTMLDivElement>}>
                                                            <FontAwesomeIcon
                                                                fixedWidth
                                                                icon="info"
                                                            />
                                                        </div>
                                                    </div>
                                                </InputGroup.Text>
                                            )}
                                        </OverlayTrigger>
                                    </InputGroup.Prepend>
                                </InputGroup>
                            );
                        })}
                        <hr />
                    </Col>
                    <Button
                        onClick={() => {
                            let admin = 0;
                            let instance = 0;

                            for (const perm of Object.values(this.state.permsadmin)) {
                                admin += perm.newVal ? perm.bitflag : 0;
                            }
                            for (const perm of Object.values(this.state.permsinstance)) {
                                instance += perm.newVal ? perm.bitflag : 0;
                            }
                        }}>
                        Save
                    </Button>
                </React.Fragment>
            );
        }
    }
);
