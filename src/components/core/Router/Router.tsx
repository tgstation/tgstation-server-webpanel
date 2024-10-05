import { useContext } from "react";

import Login from "@/components/routed/Login/Login";
import SessionContext from "@/context/session/Context";

const Router = () => {
    const session = useContext(SessionContext);

    if (!session.currentSession) {
        return <Login />;
    }

    return <></>;
};

export default Router;
