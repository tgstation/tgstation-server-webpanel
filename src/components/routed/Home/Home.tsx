import { FormattedMessage } from "react-intl";

import { Alert, AlertDescription } from "@/components/ui/alert";
import useSession from "@/context/session/useSession";

const Home = () => {
    const session = useSession();
    const usingDefaultCredentials =
        !!session.currentSession?.originalCredentials.defaultCredentials;

    return (
        <>
            {usingDefaultCredentials ? (
                <Alert className="clearfix bg-warning">
                    <AlertDescription className="font-bold text-warning-foreground">
                        <FormattedMessage id="error.app.default_creds" />
                    </AlertDescription>
                </Alert>
            ) : null}
        </>
    );
};

export default Home;
