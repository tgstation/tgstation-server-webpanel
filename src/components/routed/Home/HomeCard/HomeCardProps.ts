import { IconProp } from "@fortawesome/fontawesome-svg-core";

import { HomeCardPermissionsQuery$data } from "../graphql/__generated__/HomeCardPermissionsQuery.graphql";

import IRoutePermissionsChecker from "@/components/core/Router/PermissionedRoute/IRoutePermissionsChecker";

export default interface IHomeCardProps extends Partial<IRoutePermissionsChecker> {
    icon: IconProp;
    localeNameId: string;
    path: string;
    queryData: HomeCardPermissionsQuery$data;
}
