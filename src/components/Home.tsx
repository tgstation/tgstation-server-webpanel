import * as React from 'react';
import { Link } from 'react-router-dom';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { AppRoute, AppRoutes, NormalRoute } from '../utils/routes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FormattedMessage } from 'react-intl';
import App from '../App';

interface IProps {}
interface IState {
    routes: Array<NormalRoute>;
}

export default class Home extends React.Component<IProps, IState> {
    public static readonly Route: string = '/';

    public constructor(props: IProps) {
        super(props);
        this.state = {
            routes: []
        };
    }

    public componentDidMount() {
        this.refreshRoutes();
    }

    private refreshRoutes() {
        Object.values(AppRoutes).forEach(val => {
            if (val.isAuthorized) {
                val.isAuthorized().then(auth => {
                    if (val.hidden) return;
                    if (val == AppRoutes.home) return;

                    if (auth) {
                        this.setState(prevState => {
                            const newArr = Array.from(prevState.routes);
                            newArr[val.display] = val;
                            return {
                                routes: newArr
                            };
                        });
                    }
                });
            }
        });
    }

    public render(): React.ReactNode {
        return (
            <Row xs={1} md={3} lg={4} className="justify-content-center">
                {this.state.routes.map(val => {
                    if (!val) return;
                    return (
                        <Col key={val.route} className="mb-1">
                            <Card
                                as={Link}
                                to={val.route}
                                className="text-decoration-none text-secondary m-1 h-75">
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
