import { createContext } from "react";

import ISession from "./Session";

interface ISessionContext {
    currentSession: ISession | null;
    setSession: (session: ISession) => void;
}

const SessionContext = createContext<ISessionContext>({
    currentSession: null,
    setSession: () => {}
});
export default SessionContext;
