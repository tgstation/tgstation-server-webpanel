import ILocationState from "@/components/routed/Login/LocationState";
import useSession from "@/context/session/useSession";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const ProtectedRoute = () => {
    const session = useSession();
    const location = useLocation();
    if (session.currentSession == null) {
        const state: ILocationState = { from: location };
        return <Navigate to="/login" state={state} />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
