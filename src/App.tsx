import { StrictMode, useEffect, useState } from "react";
import { IntlProvider } from "react-intl";

import RelayEnvironment from "./components/core/RelayEnvironment/RelayEnvironment";
import icolibrary from "./components/utils/icolibrary";
import Loading from "./components/utils/Loading/Loading";
import ConfigProvider from "./context/config/Provider";
import ITranslation from "./lib/translations/ITranslation";
import ITranslationFactory from "./lib/translations/ITranslationFactory";
import Locales from "./lib/translations/Locales";

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
                for (const locale of props.preferredLocales) {
                    try {
                        loadedTranslation = await props.translationFactory.loadTranslation(locale);
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

                    loadedTranslation = await props.translationFactory.loadTranslation(
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

    useEffect(() => {
        icolibrary();
    });

    return (
        <StrictMode>
            <ConfigProvider>
                {translations ? (
                    <IntlProvider
                        locale={translations.locale}
                        messages={translations.messages}
                        defaultLocale="en">
                        <RelayEnvironment />
                    </IntlProvider>
                ) : (
                    <Loading />
                )}
            </ConfigProvider>
        </StrictMode>
    );
};

export default App;
