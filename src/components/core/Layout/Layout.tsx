import Logo from "../Logo/Logo";
import Navbar from "../Navbar/Navbar";
import ReportIssue from "../ReportIssue/ReportIssue";
import Router from "../Router/Router";

import "./Layout.css";

interface IProps {
    setTemporaryHeader: (headerValue: string) => void;
}

const Layout = (props: IProps) => {
    return (
        <div className="core-Layout">
            <Navbar />
            <Router setTemporaryHeader={props.setTemporaryHeader} />
            <ReportIssue />
            <Logo />
        </div>
    );
};

export default Layout;
