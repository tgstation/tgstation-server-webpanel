import { useContext } from "react";
import SessionContext from "./SessionContext";

const useSession = () => useContext(SessionContext);
export default useSession;
