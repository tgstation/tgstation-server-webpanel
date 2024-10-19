import useSession from "@/context/session/useSession";
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface IProps {
    children: ReactNode;
}

const ProtectedRoute = (props: IProps) => {
    const session = useSession();
    if (session.currentSession == null) {
        return <Navigate to="/login" />;
    }

    return props.children;
};

export default ProtectedRoute;
