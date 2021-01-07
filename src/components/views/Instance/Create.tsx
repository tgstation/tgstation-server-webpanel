import React from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/esm/Col";
import Form from "react-bootstrap/esm/Form";
import InputGroup from "react-bootstrap/esm/InputGroup";
import OverlayTrigger from "react-bootstrap/esm/OverlayTrigger";
import Tooltip from "react-bootstrap/esm/Tooltip";
import { FormattedMessage } from "react-intl";
import { RouteComponentProps, withRouter } from "react-router-dom";

import { Components } from "../../../ApiClient/generatedcode/_generated";
import InstanceClient from "../../../ApiClient/InstanceClient";
import InternalError, { ErrorCode } from "../../../ApiClient/models/InternalComms/InternalError";
import { StatusCode } from "../../../ApiClient/models/InternalComms/InternalStatus";
import ServerClient from "../../../ApiClient/ServerClient";
import { AppRoutes, RouteData } from "../../../utils/routes";
import ErrorAlert from "../../utils/ErrorAlert";
import Loading from "../../utils/Loading";

interface IState {
    loading: boolean;
    validated: boolean;
    error?: InternalError<ErrorCode>;
    instanceName?: string;
    instancePath?: string;
    serverInformation?: Components.Schemas.ServerInformation;
    validPathIndex?: number;
}

interface IProps extends RouteComponentProps {}

export default withRouter(
    class InstanceCreate extends React.Component<IProps, IState> {
        public constructor(props: IProps) {
            super(props);
            this.state = {
                loading: true,
                validated: false
            };

            this.submit = this.submit.bind(this);
        }

        public async componentDidMount() {
            const serverInformationStatus = await ServerClient.getServerInfo();
            if (serverInformationStatus.code !== StatusCode.OK)
                this.setState({
                    loading: false,
                    error: serverInformationStatus.error
                });
            else {
                const serverInformation = serverInformationStatus.payload!;
                this.setState({
                    loading: false,
                    serverInformation,
                    validPathIndex: serverInformation.validInstancePaths != null ? 0 : undefined,
                    validated: this.validatePath()
                });
            }
        }

        public render(): React.ReactNode {
            if (this.state.loading) {
                return <Loading text="view.instance.create.loading" />;
            }

            const validInstancePaths = this.state.serverInformation?.validInstancePaths;
            let validPathIndex = 0;
            return (
                <div className="text-center">
                    <h3>
                        <FormattedMessage id="view.instance.create.title" />
                    </h3>
                    <Form onSubmit={this.submit}>
                        <Col className="mx-auto" lg={5} md={8}>
                            <ErrorAlert
                                error={this.state.error}
                                onClose={() => this.setState({ error: undefined })}
                            />
                            <Form.Group controlId="username">
                                <Form.Label>
                                    <h5>
                                        <FormattedMessage id="view.instance.create.name" />
                                    </h5>
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    onChange={event => {
                                        const instanceName = event.target.value;
                                        this.setState({
                                            instanceName
                                        });
                                    }}
                                    value={this.state.instanceName}
                                    required
                                />
                            </Form.Group>
                            <Form.Group controlId="password">
                                <Form.Label>
                                    <h5>
                                        <FormattedMessage id="view.instance.create.path" />
                                    </h5>
                                </Form.Label>
                                <InputGroup className="w-75 mb-1">
                                    {validInstancePaths != null ? (
                                        <InputGroup.Prepend>
                                            <InputGroup.Text>
                                                <span>
                                                    <FormattedMessage id="view.instance.create.path.prefix" />
                                                </span>
                                            </InputGroup.Text>
                                            <Form.Control
                                                className="flex-grow-1 flex-md-grow-0 w-50 w-md-auto"
                                                as="select"
                                                custom
                                                readOnly
                                                onChange={event => {
                                                    this.setState({
                                                        validPathIndex: parseInt(event.target.value)
                                                    });
                                                }}>
                                                {validInstancePaths.map(validPath => {
                                                    const currentPathIndex = validPathIndex++;
                                                    return (
                                                        <option
                                                            key={`validpath-${currentPathIndex}`}
                                                            value={currentPathIndex}
                                                            selected={
                                                                this.state.validPathIndex ==
                                                                currentPathIndex
                                                            }>
                                                            {validPath}/
                                                        </option>
                                                    );
                                                })}
                                            </Form.Control>
                                        </InputGroup.Prepend>
                                    ) : null}
                                    <Form.Control
                                        type="text"
                                        onChange={event => {
                                            const instancePath = event.target.value;
                                            this.setState({
                                                instancePath,
                                                validated: this.validatePath(instancePath)
                                            });
                                        }}
                                        value={this.state.instancePath}
                                    />
                                </InputGroup>
                            </Form.Group>
                            <OverlayTrigger
                                overlay={
                                    <Tooltip id="create-instance-path-tooltip">
                                        <FormattedMessage
                                            id={
                                                this.validatePath()
                                                    ? "view.instance.create.submit.invalid.name"
                                                    : "view.instance.create.submit.invalid.path"
                                            }
                                        />
                                    </Tooltip>
                                }
                                show={this.state.validated ? false : undefined}>
                                {({ ref, ...triggerHandler }) => (
                                    <Button
                                        type="submit"
                                        variant="success"
                                        disabled={!this.state.validated}
                                        ref={ref}
                                        {...triggerHandler}>
                                        <FormattedMessage id="view.instance.create.submit" />
                                    </Button>
                                )}
                            </OverlayTrigger>
                        </Col>
                    </Form>
                </div>
            );
        }

        private validatePath(instancePathParam?: string): boolean {
            let instancePath = instancePathParam || this.state.instancePath || "";
            if (this.state.validPathIndex != null) {
                instancePath =
                    this.state.serverInformation!.validInstancePaths![this.state.validPathIndex] +
                    "/" +
                    instancePath;
            }

            const validInstancePaths = this.state.serverInformation?.validInstancePaths;
            const isWindows = this.state.serverInformation?.windowsHost || true; // who knows?
            const isGenerallyValidPath = !isWindows
                ? instancePath.startsWith("/") && !instancePath.includes("//")
                : /^[a-zA-Z]:[\\\/]/.test(instancePath) &&
                  [
                      "//",
                      "\\\\",
                      "/\\",
                      "\\/",
                      '"',
                      "<",
                      ">",
                      "|",
                      "?",
                      "*",
                      ":"
                  ].some(invalidSequence => instancePath.includes(invalidSequence));
            return (
                isGenerallyValidPath &&
                // if there are no valid paths or our path starts with one of them followed by nothing or a path separator
                (!validInstancePaths ||
                    validInstancePaths.some(
                        validPath =>
                            instancePath.startsWith(validPath) &&
                            (instancePath.length == validPath.length ||
                                instancePath.charAt(validPath.length) === "/" ||
                                (isWindows && instancePath.charAt(validPath.length) === "\\"))
                    ))
            );
        }

        private async submit() {
            let instancePath = this.state.instancePath!;
            if (this.state.validPathIndex != null) {
                instancePath =
                    this.state.serverInformation!.validInstancePaths![this.state.validPathIndex] +
                    "/" +
                    instancePath;
            }

            this.setState({
                loading: true
            });

            const result = await InstanceClient.createInstance({
                name: this.state.instanceName!,
                path: instancePath,
                id: 0
            });

            if (result.code === StatusCode.ERROR) {
                this.setState({
                    loading: false,
                    error: result.error
                });

                return;
            }

            RouteData.instanceid = result.payload!.id.toString();

            this.props.history.push(AppRoutes.instancelist.link || AppRoutes.instancelist.route);
        }
    }
);
