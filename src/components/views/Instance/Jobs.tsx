import React, { ReactNode } from "react";
import { withRouter, RouteComponentProps } from "react-router-dom";
import { AppCategories } from "../../../utils/routes";
import JobsList from "../../utils/JobsList";

interface IProps extends RouteComponentProps<{ id: string }> {}
interface IState {}

export default withRouter(
    class Jobs extends React.Component<IProps, IState> {
        public constructor(props: IProps) {
            super(props);

            if (!AppCategories.instance.data) AppCategories.instance.data = {};
            AppCategories.instance.data.instanceid = props.match.params.id;
        }

        public render(): ReactNode {
            return (
                <div className="mx-auto" style={{ maxWidth: "max-content" }}>
                    <JobsList width={"unset"} corner={false} />
                </div>
            );
        }
    }
);
