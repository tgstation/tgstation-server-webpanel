import { PreloadedQuery } from "react-relay";

import { UpdateInformationQuery } from "./graphql/__generated__/UpdateInformationQuery.graphql";

interface IProps {
    queryRef: PreloadedQuery<UpdateInformationQuery> | null;
}

const Administration = (props: IProps) => {
    if (!props.queryRef) {
        throw new Error("UpdateInformationQuery ref was null");
    }

    // const data = usePreloadedQuery<UpdateInformationQuery>(UpdateInformation, props.queryRef);

    return <></>;
};

export default Administration;
