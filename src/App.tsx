import { StrictMode, useEffect, useState } from "react";

import Loading from "./components/utils/Loading/Loading";

import ThemeProvider from "./context/theme/Provider";
import ITranslationFactory from "./translations/ITranslationFactory";
import ITranslation from "./translations/ITranslation";
import { IntlProvider } from "react-intl";
import Meta from "./components/core/Meta/Meta";
import Locales from "./translations/Locales";

interface IProps {
    preferredLocales: readonly string[];
    translationFactory: ITranslationFactory;
}

const App = (props: IProps) => {
    const [translations, setTranslations] = useState<ITranslation | null>(null);

    useEffect(() => {
        void (async () => {
            try {
                let loadedTranslation: ITranslation | null = null;
                console.log(JSON.stringify(props.preferredLocales));
                for (const locale of props.preferredLocales) {
                    try {
                        loadedTranslation =
                            await props.translationFactory.loadTranslation(
                                locale
                            );
                        if (loadedTranslation) {
                            setTranslations(loadedTranslation);
                            break;
                        }
                    } catch {
                        (() => {})();
                    }

                    console.log(`Failed to load localization: ${locale}`);
                }

                if (!loadedTranslation) {
                    const FallbackLocale = Locales.en;
                    alert(
                        `Failed to load localization for preferred locale(s): ${props.preferredLocales.join(
                            ", "
                        )}. Falling back to ${FallbackLocale}.`
                    );

                    loadedTranslation =
                        await props.translationFactory.loadTranslation(
                            FallbackLocale
                        );
                }
            } catch (error) {
                alert(
                    `Could not load any localization: ${
                        JSON.stringify(error) ?? "An unknown error occurred"
                    }`
                );
            }
        })();
    }, [props.preferredLocales, props.translationFactory]);

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
