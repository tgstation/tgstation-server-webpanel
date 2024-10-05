import Logo from "../Logo/Logo";
import Navbar from "../Navbar/Navbar";
import ReportIssue from "../ReportIssue/ReportIssue";
import Router from "../Router/Router";

import "./Layout.css";

const Layout = () => {
    return (
        <div className="core-Layout">
            <Navbar />
            <Router />
            <ReportIssue />
            <Logo />
        </div>
    );
};

export default Layout;
