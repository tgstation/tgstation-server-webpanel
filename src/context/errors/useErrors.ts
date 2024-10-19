import { useContext } from "react";
import ErrorsContext from "./ErrorsContext";

const useErrors = () => useContext(ErrorsContext);
export default useErrors;
