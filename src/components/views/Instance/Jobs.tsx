import React, { ReactNode } from "react";
import { FormattedMessage } from "react-intl";

import JobsList from "../../utils/JobsList";

type IProps = object;
type IState = object;

export default class Jobs extends React.Component<IProps, IState> {
    public render(): ReactNode {
        return (
            <div className="mx-auto" style={{ maxWidth: "max-content" }}>
                <h3 className="text-center">
                    <FormattedMessage id="view.instance.jobs.title" />
                </h3>
                <JobsList width={"unset"} widget={false} />
            </div>
        );
    }
}
