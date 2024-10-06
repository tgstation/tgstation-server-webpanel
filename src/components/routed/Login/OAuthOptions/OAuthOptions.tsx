import { FormattedMessage } from "react-intl";
import { useLazyLoadQuery } from "react-relay";

import GetOAuthProviders from "./graphql/GetOAuthProviders";
import { GetOAuthProvidersQuery } from "./graphql/__generated__/GetOAuthProvidersQuery.graphql";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const OAuthOptions = () => {
    const query = useLazyLoadQuery<GetOAuthProvidersQuery>(GetOAuthProviders, {});
    const data = query.swarm.currentNode.gateway.information.oAuthProviderInfos;

    if (data.length == 0) {
        return null;
    }

    console.log(JSON.stringify(data));

    return (
        <>
            <hr className="my-4" />
            <Card>
                <CardHeader>
                    <CardTitle>
                        <FormattedMessage id="login.type.oauth" />
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {data.map(kvp => {
                        return <div key={kvp.key} />;
                    })}
                </CardContent>
            </Card>
        </>
    );
};

export default OAuthOptions;
