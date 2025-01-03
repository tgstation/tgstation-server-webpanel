import { Navigate, Outlet, useLocation } from "react-router";

import ILocationState from "@/components/routed/Login/LocationState";
import useSession from "@/contexts/session/useSession";

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
