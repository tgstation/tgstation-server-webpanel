import { Suspense } from "react";
import { Outlet } from "react-router-dom";

import ErrorViewer from "../ErrorViewer/ErrorViewer";
import Logo from "../Logo/Logo";
import Navbar from "../Navbar/Navbar";
import ReportIssue from "../ReportIssue/ReportIssue";

import Loading from "@/components/utils/Loading/Loading";
import ErrorBoundary from "@/components/utils/ErrorBoundary/ErrorBoundary";


const Layout = () => {
    return (
        <>
            <Navbar />
            <div className="mt-20 grid grid-cols-8">
                <div className="lg:col-start-2 lg:col-end-8">
                    <ErrorBoundary>
                        <ErrorViewer />
                        <Suspense fallback={<Loading />}>
                            <Outlet />
                        </Suspense>
                    </ErrorBoundary>
                </div>
            </div>
            <ReportIssue />
            <Logo />
        </>
    );
};

export default Layout;
