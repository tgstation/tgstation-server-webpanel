import { ReactNode, useMemo, useState } from "react";

import useSetCredentials from "../credentials/useSetCredentials";

import ISession from "./Session";
import SessionContext from "./SessionContext";

import SessionSubscriptions from "@/components/core/SessionSubscriptions/SessionSubscriptions";
import { BearerCredentials } from "@/lib/Credentials";

interface IProps {
    children: ReactNode;
    blockRequests: (blocker: Promise<unknown>) => void;
}

const SessionProvider = (props: IProps) => {
    const [session, setSession] = useState<ISession | null>(null);
    const setCredentialsContext = useSetCredentials();
    const sessionContext = useMemo(
        () => ({
            currentSession: session,
            setSession: (session: ISession | null) => {
                if (session) {
                    setCredentialsContext.setCredentials(
                        new BearerCredentials(session.bearer),
                        false
                    );
                }
                setSession(session);
            }
        }),
        [session, setCredentialsContext]
    );

    return (
        <SessionContext.Provider value={sessionContext}>
            {props.children}
            {session && <SessionSubscriptions blockRequests={props.blockRequests} />}
        </SessionContext.Provider>
    );
};

export default SessionProvider;
