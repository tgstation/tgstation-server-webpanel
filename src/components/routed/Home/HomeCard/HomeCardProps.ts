import { IconProp } from "@fortawesome/fontawesome-svg-core";

import { HomeCardPermissionsQuery$data } from "../graphql/__generated__/HomeCardPermissionsQuery.graphql";

export default interface IHomeCardProps {
    icon: IconProp;
    localeNameId: string;
    path: string;
    calculateEnabled?: (data: HomeCardPermissionsQuery$data) => boolean | undefined;
    queryData: HomeCardPermissionsQuery$data;
}
