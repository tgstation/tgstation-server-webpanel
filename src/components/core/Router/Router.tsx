import Loading from "@/components/utils/Loading/Loading";
import { ICredentials } from "@/lib/Credentials";
import devDelay from "@/lib/devDelay";
import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RethrowRouteError from "./RethrowRouteError/RethrowRouteError";

const Configuration = lazy(
    async () =>
        await devDelay(
            () => import("@/components/routed/Configuration/Configuration"),
            "Component Load: Configuration"
        )
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
                    path: "config",
                    element: <Configuration />
                },
                {
                    path: "login",
                    element: <Login setTemporaryCredentials={props.setTemporaryCredentials} />
                },
                {
                    path: "*",
                    element: <NotFound />
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
