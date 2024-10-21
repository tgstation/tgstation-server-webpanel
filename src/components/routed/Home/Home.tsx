import { FormattedMessage } from "react-intl";
import { PreloadedQuery, usePreloadedQuery, useRelayEnvironment } from "react-relay";

import { HomeCardPermissionsQuery } from "./graphql/__generated__/HomeCardPermissionsQuery.graphql";
import HomeCardPermissions from "./graphql/HomeCardPermissions";
import HomeCard from "./HomeCard/HomeCard";
import HomeRoutes from "./HomeRoutes";

import { Alert, AlertDescription } from "@/components/ui/alert";
import useSession from "@/context/session/useSession";

interface IProps {
    queryRef?: PreloadedQuery<HomeCardPermissionsQuery> | null;
}

const Home = (props: IProps) => {
    const session = useSession();
    const relayEnvironment = useRelayEnvironment();
    const usingDefaultCredentials =
        !!session.currentSession?.originalCredentials.defaultCredentials;

    if (!props.queryRef) {
        throw new Error("HomeCardPermissionsQuery ref was null");
    }

    const data = usePreloadedQuery<HomeCardPermissionsQuery>(HomeCardPermissions, props.queryRef);

    return (
        <>
            {usingDefaultCredentials ? (
                <Alert className="clearfix bg-warning mb-4">
                    <AlertDescription className="font-bold text-warning-foreground text-lg text-center">
                        <FormattedMessage id="error.app.default_creds" />
                    </AlertDescription>
                </Alert>
            ) : null}
            <div className="flex flex-row flex-wrap justify-center">
                {HomeRoutes(relayEnvironment).map(route => (
                    <div
                        key={route.localeNameId}
                        className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                        <HomeCard {...route} queryData={data} />
                    </div>
                ))}
            </div>
        </>
    );
};

export default Home;
