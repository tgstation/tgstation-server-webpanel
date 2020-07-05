import React, { Component, ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import { RouteComponentProps, withRouter } from 'react-router';
import { AppRoute } from '../../utils/routes';
import RouteController from '../../utils/RouteController';

interface IProps extends RouteComponentProps {
    currentRoute: AppRoute;
}

interface IState {
    auth: boolean;
}

class AccessDenied extends React.Component<IProps, IState> {
    public constructor(props: IProps) {
        super(props);
        this.updateState = this.updateState.bind(this);

        this.state = {
            auth: true //once again, pretend were ok until we get the info
        };
    }

    public componentDidMount() {
        RouteController.on('refresh', this.updateState);
        this.updateState();
    }

    public componentWillUnmount() {
        RouteController.removeListener('refresh', this.updateState);
    }

    public updateState(): void {
        this.setState({
            //if its undefined, we pretend its fine
            auth:
                this.props.currentRoute.cachedAuth !== undefined
                    ? this.props.currentRoute.cachedAuth
                    : true
        });
    }

    public render(): ReactNode {
        if (this.state.auth) return '';

        const goBack = () => {
            this.props.history.goBack();
        };
        return (
            <Alert
                className="clearfix"
                // @ts-ignore // the error is a special variant just for this
                variant="error">
                <FormattedMessage id="generic.accessdenied" />
                <hr />

                <Button variant="danger" className="float-right" onClick={goBack}>
                    <FormattedMessage id="generic.goback" />
                </Button>
            </Alert>
        );
    }
}

export default withRouter(AccessDenied);
