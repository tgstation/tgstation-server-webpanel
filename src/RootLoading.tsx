import React, { Suspense } from "react";

const AppLoading = React.lazy(async () => import("./AppLoading"));

export const RootLoading = (
    <React.StrictMode>
        <Suspense
            fallback={
                <React.Fragment>
                    <style type="text/css">{`
                        body {
                            background: #212529;
                            color: #FFFFFF;
                            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
                        }
                        p {
                            text-align: center;
                        }
                    `}</style>
                    <p>Loading styles...</p>
                </React.Fragment>
            }>
            <AppLoading />
        </Suspense>
    </React.StrictMode>
);
