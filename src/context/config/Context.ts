import CreateConfig from "./CreateConfig";
import { createContext } from "react";

const ConfigContext = createContext(CreateConfig(true));
export default ConfigContext;
