import { createContext } from "react";

import { ICredentials } from "@/lib/Credentials";

interface ISetCredentialsContext {
    setCredentials: (credentials: ICredentials, temporary: boolean) => void;
    clearCredentials: () => void;
}

const SetCredentialsContext = createContext<ISetCredentialsContext>({
    setCredentials: () => {},
    clearCredentials: () => {}
});

export default SetCredentialsContext;
