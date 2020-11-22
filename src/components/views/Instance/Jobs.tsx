import React, { ReactNode } from "react";
import { FormattedMessage } from "react-intl";
import { RouteComponentProps, withRouter } from "react-router-dom";

import { RouteData } from "../../../utils/routes";
import JobsList from "../../utils/JobsList";

interface IProps extends RouteComponentProps<{ id: string }> {}
interface IState {}

export default withRouter(
    class Jobs extends React.Component<IProps, IState> {
        public constructor(props: IProps) {
            super(props);

            RouteData.instanceid = props.match.params.id;
        }

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
);
