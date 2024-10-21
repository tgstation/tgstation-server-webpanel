import { createContext } from "react";

import { ICredentials } from "@/lib/Credentials";

interface ISetCredentialsContext {
    setCredentials: (credentials: ICredentials, temporary: boolean) => void;
}

const SetCredentialsContext = createContext<ISetCredentialsContext>({
    setCredentials: () => {}
});

export default SetCredentialsContext;
