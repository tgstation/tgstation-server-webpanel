import { FormattedMessage } from "react-intl";
import { PreloadedQuery, usePreloadedQuery } from "react-relay";

import { UpdatePreflightQuery } from "./graphql/__generated__/UpdatePreflightQuery.graphql";
import UpdatePreflight from "./graphql/UpdatePreflight";

interface IProps {
    queryRef: PreloadedQuery<UpdatePreflightQuery>;
}

const Update = (props: IProps) => {
    const data = usePreloadedQuery<UpdatePreflightQuery>(UpdatePreflight, props.queryRef);

    return (
        <div className="text-center">
            <h1 className="text-xl font-bold mb-4">
                <FormattedMessage id="view.admin.update.selectversion" />
            </h1>
            <hr />
            {data.swarm.updateInformation.latestVersion}
        </div>
    );
};

export default Update;
