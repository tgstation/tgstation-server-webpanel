import { createContext } from "react";

import ISession from "./Session";

interface ISessionContext {
    currentSession: ISession | null;
    setSession: (credentials: ISession) => void;
}

const SessionContext = createContext<ISessionContext>({
    currentSession: null,
    setSession: () => {}
});
export default SessionContext;
