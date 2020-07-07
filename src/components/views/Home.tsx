import * as React from 'react';
import { Link } from 'react-router-dom';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { AppRoutes, NormalRoute } from '../../utils/routes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FormattedMessage } from 'react-intl';
import RouteController from '../../utils/RouteController';

interface IProps {}
interface IState {
    routes: Array<NormalRoute>;
}

export default class Home extends React.Component<IProps, IState> {
    public static readonly Route: string = '/';

    public constructor(props: IProps) {
        super(props);
        this.setRoutes = this.setRoutes.bind(this);

        this.state = {
            routes: []
        };
    }

    private setRoutes(routes: NormalRoute[]) {
        this.setState({ routes });
    }

    public async componentDidMount() {
        this.setState({
            routes: await RouteController.getVisibleRoutes(true, false)
        });
        RouteController.on('refreshAllVisible', this.setRoutes);
    }

    public componentWillUnmount() {
        RouteController.removeListener('refreshAllVisible', this.setRoutes);
    }

    public render(): React.ReactNode {
        return (
            <Row xs={1} sm={2} md={3} lg={4} className="justify-content-center">
                {this.state.routes.map(val => {
                    if (val === AppRoutes.home) return;
                    return (
                        <Col key={val.route} className="mb-1">
                            <Card
                                as={val.cachedAuth ? Link : 'div'}
                                to={val.route}
                                className={`text-decoration-none m-1 h-75 ${
                                    val.cachedAuth
                                        ? 'text-secondary'
                                        : 'text-danger d-sm-flex d-none'
                                }`}>
                                <Card.Body>
                                    <FontAwesomeIcon
                                        fixedWidth={true}
                                        icon={val.icon}
                                        className="d-block w-100 h-100 m-auto"
                                    />
                                </Card.Body>
                                <Card.Footer className="text-center font-weight-bold">
                                    <FormattedMessage id={val.name} />
                                </Card.Footer>
                            </Card>
                        </Col>
                    );
                })}
            </Row>
        );
    }
}
