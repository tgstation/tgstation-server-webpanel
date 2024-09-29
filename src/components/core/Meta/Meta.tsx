import Loading from "@/components/utils/Loading/Loading";
import { useIntl } from "react-intl";

import Pkg from "../../../../package.json";
import { useEffect } from "react";

const Layout = () => {
    const version = Pkg.version;

    const intl = useIntl();

    useEffect(() => {
        document.title = intl.formatMessage({ id: "title" }, { version });
    });
    return (
        <>
            <Loading noIntl message="asdf" />
        </>
    );
};

export default Layout;
