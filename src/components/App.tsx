import { lazy, StrictMode, Suspense, useEffect, useState } from "react";
import { IntlProvider } from "react-intl";

import ConfigProvider from "../context/config/Provider";
import devDelay from "../lib/devDelay";
import ITranslation from "../lib/translations/ITranslation";
import ITranslationFactory from "../lib/translations/ITranslationFactory";
import Locales from "../lib/translations/Locales";

import Loading from "./utils/Loading/Loading";
import icolibrary from "./utils/icolibrary";

const RelayEnvironment = lazy(async () => {
    await devDelay();
    return await import("@/components/core/RelayEnvironment/RelayEnvironment");
});

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
                        <Suspense
                            fallback={
                                <div className="grid lg:grid-cols-11 md:grid-cols-8">
                                    <div className="lg:col-start-3 lg:col-end-9 md:col-start-2 md:col-end-8">
                                        <Loading message="loading.loading" />
                                    </div>
                                </div>
                            }>
                            <RelayEnvironment />
                        </Suspense>
                    </IntlProvider>
                ) : (
                    <Loading />
                )}
            </ConfigProvider>
        </StrictMode>
    );
};

export default App;
