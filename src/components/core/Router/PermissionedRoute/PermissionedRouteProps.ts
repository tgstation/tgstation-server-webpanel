import { ReactNode } from "react";
import { KeyType } from "react-relay/relay-hooks/helpers";

import IPermissionedRouteInfo from "./PermissionedRouteInfo";

export default interface IPermissionedRouteProps<TFragmentKey extends KeyType>
    extends IPermissionedRouteInfo<TFragmentKey> {
    children: ReactNode;
    fragmentKey: TFragmentKey;
}
