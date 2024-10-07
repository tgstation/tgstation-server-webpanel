import Logo from "../Logo/Logo";
import Navbar from "../Navbar/Navbar";
import ReportIssue from "../ReportIssue/ReportIssue";
import Router from "../Router/Router";

import { ICredentials } from "@/lib/Credentials";

import "./Layout.css";

interface IProps {
    setTemporaryCredentials: (credentials: ICredentials) => void;
}

const Layout = (props: IProps) => {
    return (
        <div className="core-Layout">
            <Navbar />
            <Router setTemporaryCredentials={props.setTemporaryCredentials} />
            <ReportIssue />
            <Logo />
        </div>
    );
};

export default Layout;
