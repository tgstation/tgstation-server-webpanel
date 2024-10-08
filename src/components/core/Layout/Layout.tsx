import Logo from "../Logo/Logo";
import Navbar from "../Navbar/Navbar";
import ReportIssue from "../ReportIssue/ReportIssue";
import Router from "../Router/Router";

import ErrorBoundary from "@/components/utils/ErrorBoundary/ErrorBoundary";
import { ICredentials } from "@/lib/Credentials";
import "./Layout.css";

interface IProps {
    setTemporaryCredentials: (credentials: ICredentials) => void;
}

const Layout = (props: IProps) => {
    return (
        <div className="core-Layout">
            <ErrorBoundary>
                <Navbar />
                <Router setTemporaryCredentials={props.setTemporaryCredentials} />
                <ReportIssue />
                <Logo />
            </ErrorBoundary>
        </div>
    );
};

export default Layout;
