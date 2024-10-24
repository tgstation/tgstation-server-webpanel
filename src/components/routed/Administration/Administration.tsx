import { PreloadedQuery, usePreloadedQuery } from "react-relay";

import { UpdateInformationQuery } from "./graphql/__generated__/UpdateInformationQuery.graphql";
import UpdateInformation from "./graphql/UpdateInformation";

interface IProps {
    queryRef: PreloadedQuery<UpdateInformationQuery>;
}

const Administration = (props: IProps) => {
    const data = usePreloadedQuery<UpdateInformationQuery>(UpdateInformation, props.queryRef);

    return (
        <>
            <h1>Canary {data.swarm.updateInformation.generatedAt}</h1>
        </>
    );
};

export default Administration;
