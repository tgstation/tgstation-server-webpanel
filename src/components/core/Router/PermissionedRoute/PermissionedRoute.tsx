import { FormattedMessage } from "react-intl";
import { useFragment } from "react-relay";
import { KeyType } from "react-relay/relay-hooks/helpers";

import IPermissionedRouteProps from "./PermissionedRouteProps";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";

const PermissionedRoute = <TFragmentKey extends KeyType>(
    props: IPermissionedRouteProps<TFragmentKey>
) => {
    const data = useFragment<TFragmentKey>(props.fragmentNode, props.fragmentKey);
    const permissioned = props.permissionEvaluator(data);
    if (permissioned) {
        return props.children;
    }

    return (
        <Card className="bg-warning text-warning-foreground mb-4 text-center">
            <CardHeader>
                <CardTitle>
                    <FormattedMessage id="error.routemissingpermissions" />
                </CardTitle>
            </CardHeader>
        </Card>
    );
};

export default PermissionedRoute;
