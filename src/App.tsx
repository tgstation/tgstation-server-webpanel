import { StrictMode, useEffect, useState } from "react";

import Loading from "./components/utils/Loading/Loading";

import ThemeProvider from "./context/theme/Provider";
import ITranslationFactory from "./translations/ITranslationFactory";
import ITranslation from "./translations/ITranslation";
import { IntlProvider } from "react-intl";
import Meta from "./components/core/Meta/Meta";

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

    return (
        <StrictMode>
            <ThemeProvider>
                {translations ? (
                    <IntlProvider
                        locale={translations.locale}
                        messages={translations.messages}
                        defaultLocale="en"
                    >
                        <Meta />
                    </IntlProvider>
                ) : (
                    <Loading />
                )}
            </ThemeProvider>
        </StrictMode>
    );
};

export default App;
