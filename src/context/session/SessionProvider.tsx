import { ReactNode, useState } from "react";

import useSetCredentials from "../credentials/useSetCredentials";

import ISession from "./Session";
import SessionContext from "./SessionContext";

import { BearerCredentials } from "@/lib/Credentials";

interface IProps {
    children: ReactNode;
}

const SessionProvider = (props: IProps) => {
    const [session, setSession] = useState<ISession | null>(null);
    const setCredentialsContext = useSetCredentials();
    const sessionContext = {
        currentSession: session,
        setSession: (session: ISession) => {
            setCredentialsContext.setCredentials(new BearerCredentials(session.bearer), false);
            setSession(session);
        }
    };

    return (
        <SessionContext.Provider value={sessionContext}>{props.children}</SessionContext.Provider>
    );
};

export default SessionProvider;
