import React, { ReactNode } from "react";
import Button from "react-bootstrap/Button";
import { FormattedMessage } from "react-intl";
import { RouteComponentProps, withRouter } from "react-router";

import GenericAlert from "./GenericAlert";

type IProps = RouteComponentProps;

interface IState {
    auth: boolean;
}

class AccessDenied extends React.Component<IProps, IState> {
    public render(): ReactNode {
        const goBack = () => {
            this.props.history.goBack();
        };
        return (
            <GenericAlert title="generic.accessdenied">
                <Button variant="danger" className="float-right" onClick={goBack}>
                    <FormattedMessage id="generic.goback" />
                </Button>
            </GenericAlert>
        );
    }
}

export default withRouter(AccessDenied);
