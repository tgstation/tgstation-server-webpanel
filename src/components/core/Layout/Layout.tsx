import Logo from "../Logo/Logo";
import Navbar from "../Navbar/Navbar";
import ReportIssue from "../ReportIssue/ReportIssue";
import Router from "../Router/Router";

import ErrorBoundary from "@/components/utils/ErrorBoundary/ErrorBoundary";
import { ICredentials } from "@/lib/Credentials";

interface IProps {
    setTemporaryCredentials: (credentials: ICredentials) => void;
}

const Layout = (props: IProps) => {
    return (
        <ErrorBoundary>
            <Navbar />
            <div className="mt-20">
                <Router setTemporaryCredentials={props.setTemporaryCredentials} />
            </div>
            <ReportIssue />
            <Logo />
        </ErrorBoundary>
    );
};

export default Layout;
