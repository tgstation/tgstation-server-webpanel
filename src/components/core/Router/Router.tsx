import { lazy } from "react";
import { useRelayEnvironment } from "react-relay";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import HomeRoutes from "../../routed/Home/HomeRoutes";

import ProtectedRoute from "./ProtectedRoute/ProtectedRoute";
import RethrowRouteError from "./RethrowRouteError/RethrowRouteError";

import HomeRouteLoader from "@/components/routed/Home/HomeRouteLoader";
import devDelay from "@/lib/devDelay";

const Layout = lazy(
    async () =>
        await devDelay(() => import("@/components/core/Layout/Layout"), "Component Load: Layout")
);

const Login = lazy(
    async () =>
        await devDelay(() => import("@/components/routed/Login/Login"), "Component Load: Login")
);

const NotFound = lazy(
    async () =>
        await devDelay(
            () => import("@/components/core/NotFound/NotFound"),
            "Component Load: NotFound"
        )
);

const Router = () => {
    const relayEnviroment = useRelayEnvironment();
    const homeRoutes = HomeRoutes(relayEnviroment);
    const router = createBrowserRouter([
        {
            path: "/",
            element: <Layout />,
            errorElement: <RethrowRouteError />,
            children: [
                {
                    path: "login",
                    element: <Login />
                },
                ...homeRoutes.filter(route => route.unprotected),
                {
                    element: <ProtectedRoute />,
                    children: [
                        HomeRouteLoader(relayEnviroment, {
                            path: ""
                        }),
                        ...homeRoutes.filter(route => !route.unprotected),
                        {
                            path: "*",
                            element: <NotFound />
                        }
                    ]
                }
            ]
        }
    ]);

    return <RouterProvider router={router}></RouterProvider>;
};

export default Router;
