import { useContext } from "react";

import ConfigContext from "./ConfigContext";

const useConfig = () => useContext(ConfigContext);
export default useConfig;
