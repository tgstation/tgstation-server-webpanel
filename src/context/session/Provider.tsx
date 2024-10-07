import { ReactNode, useState } from "react";

import SessionContext from "./Context";
import ISession from "./Session";

import { BearerCredentials, ICredentials } from "@/lib/Credentials";

interface IProps {
    children: ReactNode;
    setCredentials: (credentials: ICredentials) => void;
}

const SessionProvider = (props: IProps) => {
    const [session, setSession] = useState<ISession | null>(null);
    const sessionContext = {
        currentSession: session,
        setSession: (session: ISession) => {
            props.setCredentials(new BearerCredentials(session.bearer));
            setSession(session);
        }
    };

    return (
        <SessionContext.Provider value={sessionContext}>{props.children}</SessionContext.Provider>
    );
};

export default SessionProvider;
