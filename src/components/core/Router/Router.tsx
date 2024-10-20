import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import HomeRoutes from "../../routed/Home/HomeRoutes";

import ProtectedRoute from "./ProtectedRoute/ProtectedRoute";
import RethrowRouteError from "./RethrowRouteError/RethrowRouteError";

import Loading from "@/components/utils/Loading/Loading";
import { ICredentials } from "@/lib/Credentials";
import devDelay from "@/lib/devDelay";

const Home = lazy(
    async () =>
        await devDelay(() => import("@/components/routed/Home/Home"), "Component Load: Home")
);

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

interface IProps {
    setTemporaryCredentials: (credentials: ICredentials) => void;
}

const Router = (props: IProps) => {
    const router = createBrowserRouter([
        {
            path: "/",
            element: <Layout />,
            errorElement: <RethrowRouteError />,
            children: [
                {
                    path: "login",
                    element: <Login setTemporaryCredentials={props.setTemporaryCredentials} />
                },
                ...HomeRoutes.filter(route => route.unprotected),
                {
                    element: <ProtectedRoute />,
                    children: [
                        {
                            path: "",
                            element: <Home />
                        },
                        ...HomeRoutes.filter(route => !route.unprotected),
                        {
                            path: "*",
                            element: <NotFound />
                        }
                    ]
                }
            ]
        }
    ]);

    return (
        <Suspense fallback={<Loading />}>
            <RouterProvider router={router}></RouterProvider>
        </Suspense>
    );
};

export default Router;
