import { FormattedMessage } from "react-intl";
import { useLazyLoadQuery } from "react-relay";

import { HomeCardPermissionsQuery } from "./graphql/__generated__/HomeCardPermissionsQuery.graphql";
import HomeCardPermissions from "./graphql/HomeCardPermissions";
import HomeCard from "./HomeCard/HomeCard";
import HomeRoutes from "./HomeRoutes";

import { Alert, AlertDescription } from "@/components/ui/alert";
import useSession from "@/context/session/useSession";

const Home = () => {
    const session = useSession();
    const usingDefaultCredentials =
        !!session.currentSession?.originalCredentials.defaultCredentials;

    const data = useLazyLoadQuery<HomeCardPermissionsQuery>(HomeCardPermissions, {
        userID: session.currentSession!.userId
    });

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
                {HomeRoutes.map(route => (
                    <div className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                        <HomeCard key={route.localeNameId} {...route} queryData={data} />
                    </div>
                ))}
            </div>
        </>
    );
};

export default Home;
