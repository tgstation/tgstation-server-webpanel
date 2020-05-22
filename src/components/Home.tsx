import * as React from 'react';
import { Link } from 'react-router-dom';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { AppRoutes } from '../utils/routes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FormattedMessage } from 'react-intl';

export default class Home extends React.Component {
    public static readonly Route: string = '/';

    public render(): React.ReactNode {
        return (
            <Row xs={1} md={3} lg={4} className="justify-content-center">
                {Object.entries(AppRoutes).map(([id, route]) => {
                    if (route.hidden) {
                        return;
                    }
                    if (route.name == AppRoutes.home.name) {
                        return;
                    }
                    return (
                        <Col key={id} className="mb-1">
                            <Card
                                as={Link}
                                to={route.route}
                                className="text-decoration-none text-secondary m-1 h-75">
                                <Card.Body>
                                    <FontAwesomeIcon
                                        fixedWidth={true}
                                        icon={route.icon}
                                        className="d-block w-100 h-100 m-auto"
                                    />
                                </Card.Body>
                                <Card.Footer className="text-center font-weight-bold">
                                    <FormattedMessage id={route.name} />
                                </Card.Footer>
                            </Card>
                        </Col>
                    );
                    /*
                    <Nav.Item key={id}>
                            <Nav.Link
                                as={NavLink}
                                to={route.route}
                                activeClassName="active"
                                exact={route.exact}>

                            </Nav.Link>
                        </Nav.Item>
                     */
                })}
            </Row>
        );
    }
}
