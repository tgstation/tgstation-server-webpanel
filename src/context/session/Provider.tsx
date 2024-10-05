import { ReactNode, useState } from "react";

import SessionContext from "./Context";
import ISession from "./Session";

interface IProps {
    children: ReactNode;
    setBearer: (bearer: string) => void;
}

const SessionProvider = (props: IProps) => {
    const [session, setSession] = useState<ISession | null>(null);
    const sessionContext = {
        currentSession: session,
        setSession: (session: ISession) => {
            props.setBearer(session.bearer);
            setSession(session);
        }
    };

    return (
        <SessionContext.Provider value={sessionContext}>{props.children}</SessionContext.Provider>
    );
};

export default SessionProvider;
