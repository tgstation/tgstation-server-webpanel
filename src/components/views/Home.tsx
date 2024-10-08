import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import { Alert } from "react-bootstrap";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import { FormattedMessage } from "react-intl";
import { Link } from "react-router-dom";

import ServerClient from "../../ApiClient/ServerClient";
import CredentialsProvider from "../../ApiClient/util/CredentialsProvider";
import RouteController from "../../utils/RouteController";
import { AppRoute, AppRoutes } from "../../utils/routes";

type IProps = object;
interface IState {
    routes: Array<AppRoute>;
    usingDefaultCreds: boolean;
}

export default class Home extends React.Component<IProps, IState> {
    public static readonly Route: string = "/";

    public constructor(props: IProps) {
        super(props);
        this.setRoutes = this.setRoutes.bind(this);

        this.state = {
            routes: [],
            usingDefaultCreds: false
        };
    }

    private setRoutes(routes: AppRoute[]) {
        this.setState(prevState => {
            return {
                routes: routes,
                usingDefaultCreds: prevState.usingDefaultCreds
            };
        });
    }

    public componentDidMount(): void {
        void (async () => {
            this.setState({
                routes: await RouteController.getRoutes(false)
            });
            RouteController.on("refreshAll", this.setRoutes);

            await ServerClient.wait4Token();
            const usingDefaultCreds = CredentialsProvider.defaulted || false;
            this.setState(prevState => {
                return {
                    routes: prevState.routes,
                    usingDefaultCreds: usingDefaultCreds
                };
            });
        })();
    }

    public componentWillUnmount(): void {
        RouteController.removeListener("refreshAll", this.setRoutes);
    }

    public render(): React.ReactNode {
        return (
            <React.Fragment>
                <Alert className="clearfix" variant="warning" show={this.state.usingDefaultCreds}>
                    <FormattedMessage id="error.app.default_creds" />
                </Alert>
                <Row xs={1} sm={2} md={3} lg={4} className="justify-content-center">
                    {this.state.routes.map(val => {
                        //this means it shouldnt be displayed on the home screen
                        if (!val.homeIcon) return;

                        if (val === AppRoutes.home) return;

                        return (
                            <Col key={val.link ?? val.route} className="mb-1 home">
                                <Card
                                    as={val.cachedAuth ? Link : "div"}
                                    //@ts-expect-error //dont really know how to fix this so uhhhhhhh, this will do for now
                                    to={val.link ?? val.route}
                                    className={`text-decoration-none m-1 h-75 ${
                                        val.cachedAuth
                                            ? "text-primary"
                                            : "text-danger d-sm-flex d-none"
                                    }`}>
                                    <Card.Body
                                        style={{
                                            height: "245px"
                                        }}>
                                        <FontAwesomeIcon
                                            fixedWidth={true}
                                            icon={val.homeIcon}
                                            className="d-block w-100 h-100 m-auto"
                                        />
                                    </Card.Body>
                                    <Card.Footer
                                        className={`text-center font-weight-bold ${
                                            val.cachedAuth ? "" : "text-danger font-italic"
                                        }`}>
                                        <FormattedMessage id={val.name} />
                                    </Card.Footer>
                                </Card>
                            </Col>
                        );
                    })}
                </Row>
            </React.Fragment>
        );
    }
}
