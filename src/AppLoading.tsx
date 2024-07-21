// css
import "./styles/dark.scss";

import React, { Suspense } from "react";

const App = React.lazy(async () => import("./App"));
const Loading = React.lazy(async () => import("./components/utils/Loading"));

import Locales from "./translations/Locales";

export default class AppLoading extends React.Component {
    public render(): React.ReactNode {
        return (
            <React.StrictMode>
                <Suspense fallback={<p className="text-center">Loading spinner...</p>}>
                    <Suspense fallback={<Loading text="Loading bundles..." noIntl></Loading>}>
                        <App locale={Locales.en} />
                    </Suspense>
                </Suspense>
            </React.StrictMode>
        );
    }
}
