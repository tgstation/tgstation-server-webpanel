import Loading from "@/components/utils/Loading/Loading";
import { Helmet } from "react-helmet";
import { useIntl } from "react-intl";

import Pkg from "../../../../package.json";

const Layout = () => {
    const version = Pkg.version;

    const intl = useIntl();
    return (
        <>
            <Helmet>
                <title>
                    {intl.formatMessage({ id: "title" }, { version })}
                </title>
            </Helmet>
            <Loading noIntl message="asdf" />
        </>
    );
};

export default Layout;
