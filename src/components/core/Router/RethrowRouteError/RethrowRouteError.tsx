import { useRouteError } from "react-router";

const RethrowRouteError = () => {
    const error = useRouteError();
    throw error;
};

export default RethrowRouteError;
