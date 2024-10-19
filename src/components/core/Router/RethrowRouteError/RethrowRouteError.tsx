import { useRouteError } from "react-router-dom";

const RethrowRouteError = () => {
    const error = useRouteError();
    throw error;
};

export default RethrowRouteError;
