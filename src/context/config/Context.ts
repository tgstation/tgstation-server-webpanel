import { createContext } from "react";

import CreateConfig from "./CreateConfig";

const ConfigContext = createContext(CreateConfig(true));
export default ConfigContext;
