import { StrictMode, useEffect, useState } from "react";
import { IntlProvider } from "react-intl";

import Loading from "./components/utils/Loading/Loading";
import ITranslationFactory from "./translations/ITranslationFactory";
import ITranslation from "./translations/ITranslation";
import Locales from "./translations/Locales";
import ConfigProvider from "./context/config/Provider";
import icolibrary from "./components/utils/icolibrary";
import RelayEnvironment from "./components/core/RelayEnvironment/RelayEnvironment";

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
                        defaultLocale="en"
                    >
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
