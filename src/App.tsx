import { StrictMode } from "react";

import Loading from "./components/utils/Loading";

import { Helmet } from "react-helmet";
import Pkg from "../package.json";

const App = () => {
    return (
        <StrictMode>
            <Helmet>
                <title>TGS Webpanel v{Pkg.version}</title>
            </Helmet>
            <Loading />
        </StrictMode>
    );
};

export default App;
