import { createContext } from "react";

import ISession from "./Session";

interface ISessionContext {
    session: ISession | null;
    setSession: (credentials: ISession) => void;
}

const SessionContext = createContext<ISessionContext>({
    session: null,
    setSession: () => {}
});
export default SessionContext;
