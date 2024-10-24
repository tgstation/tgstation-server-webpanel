import { GraphQLTaggedNode } from "react-relay";
import { KeyType, KeyTypeData } from "react-relay/relay-hooks/helpers";

export default interface IPermissionedRouteInfo<TFragmentKey extends KeyType> {
    fragmentNode: GraphQLTaggedNode;
    permissionEvaluator: (permissions: KeyTypeData<TFragmentKey>) => boolean;
}
