import { useContext } from "react";

import Login from "@/components/routed/Login/Login";
import SessionContext from "@/context/session/Context";

interface IProps {
    setTemporaryHeader: (headerValue: string) => void;
}

const Router = (props: IProps) => {
    const session = useContext(SessionContext);

    if (!session.currentSession) {
        return <Login setTemporaryHeader={props.setTemporaryHeader} />;
    }

    return <></>;
};

export default Router;
