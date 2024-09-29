import { StrictMode, useEffect, useState } from "react";

import Loading from "./components/utils/Loading/Loading";

import { Helmet } from "react-helmet";
import Pkg from "../package.json";
import ThemeProvider from "./lib/theme/Provider";
import ITranslationFactory from "./translations/ITranslationFactory";
import ITranslation from "./translations/ITranslation";

interface IProps {
    locale: string;
    translationFactory: ITranslationFactory;
}

const App = (props: IProps) => {
    const [translations, setTranslations] = useState<ITranslation | null>(null);

    // TODO
    const [, setTranslationError] = useState<string | null>(null);

    useEffect(() => {
        void (async () => {
            try {
                const loadedTranslation =
                    await props.translationFactory.loadTranslation(
                        props.locale
                    );
                setTranslations(loadedTranslation);
            } catch (error) {
                setTranslationError(
                    JSON.stringify(error) ?? "An unknown error occurred"
                );
            }
        })();
    }, [props.locale, props.translationFactory]);

    const coreApp = (
        <>
            <Helmet>
                <title>TGS Webpanel v{Pkg.version}</title>
            </Helmet>
            <Loading />
        </>
    );

    return (
        <StrictMode>
            <ThemeProvider>
                {translations ? coreApp : <Loading />}
            </ThemeProvider>
        </StrictMode>
    );
};

export default App;
