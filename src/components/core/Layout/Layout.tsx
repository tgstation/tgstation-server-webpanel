import Logo from "../Logo/Logo";
import Navbar from "../Navbar/Navbar";
import ReportIssue from "../ReportIssue/ReportIssue";
import Router from "../Router/Router";

import "./Layout.css";

interface IProps {
    setBearer: (newBearer: string | null) => void;
}

const Layout = (props: IProps) => {
    return (
        <div className="core-Layout">
            <Navbar />
            <Router {...props} />
            <ReportIssue />
            <Logo />
        </div>
    );
};

export default Layout;
