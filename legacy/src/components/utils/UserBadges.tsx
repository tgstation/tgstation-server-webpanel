import React from "react";
import { Badge } from "react-bootstrap";
import { FormattedMessage } from "react-intl";

import { UserResponse } from "../../ApiClient/generatedcode/generated";

interface IProps {
    user: UserResponse;
}

type IState = object;

export default class UserBadges extends React.Component<IProps, IState> {
    public render(): React.ReactNode {
        const user = this.props.user;
        return (
            <React.Fragment>
                {user.systemIdentifier ? (
                    <Badge variant="primary" className="mx-1">
                        <FormattedMessage id="generic.system.short" />
                    </Badge>
                ) : (
                    <Badge variant="primary" className="mx-1">
                        <FormattedMessage id="generic.tgs" />
                    </Badge>
                )}
                {user.enabled ? (
                    <Badge variant="success" className="mx-1">
                        <FormattedMessage id="generic.enabled" />
                    </Badge>
                ) : (
                    <Badge variant="danger" className="mx-1">
                        <FormattedMessage id="generic.disabled" />
                    </Badge>
                )}
                {user.group ? (
                    <Badge variant="warning" className="mx-1">
                        <FormattedMessage id="generic.grouped" />
                    </Badge>
                ) : null}
            </React.Fragment>
        );
    }
}
