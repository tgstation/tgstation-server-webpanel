import { useContext } from "react";

import Login from "@/components/routed/Login/Login";
import SessionContext from "@/context/session/Context";
import { ICredentials } from "@/lib/Credentials";

interface IProps {
    setTemporaryCredentials: (credentials: ICredentials) => void;
}

const Router = (props: IProps) => {
    const session = useContext(SessionContext);

    if (!session.currentSession) {
        return <Login setTemporaryCredentials={props.setTemporaryCredentials} />;
    }

    return <></>;
};

export default Router;
