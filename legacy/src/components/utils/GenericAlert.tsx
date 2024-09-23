import React from "react";
import Alert from "react-bootstrap/Alert";
import { FormattedMessage } from "react-intl";

interface IProps {
    title: string;
    body?: string;
    children?: JSX.Element;
}

export default function GenericAlert(props: IProps): JSX.Element {
    return (
        <Alert className="clearfix" variant="error">
            <FormattedMessage id={props.title} />
            {props.body ? (
                <React.Fragment>
                    <hr />
                    <FormattedMessage id={props.body} />
                </React.Fragment>
            ) : props.children ? (
                <React.Fragment>
                    <hr />
                    {props.children}
                </React.Fragment>
            ) : null}
        </Alert>
    );
}
