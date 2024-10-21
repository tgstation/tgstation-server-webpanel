import { useContext } from "react";

import SetCredentialsContext from "./SetCredentialsContext";

const useSetCredentials = () => useContext(SetCredentialsContext);

export default useSetCredentials;
