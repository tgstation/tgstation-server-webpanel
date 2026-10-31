import React, { createContext, PropsWithChildren, useEffect, useState } from "react";
import { IntlProvider } from "react-intl";

import Loading from "../components/utils/Loading";

const getShortHandedLocale = (locale: string) => {
    return locale.split("-")[0];
};

const LOCALE_FILE: Record<string, string[]> = {
    "en-us": [
        "./locales/en-us.json"
        // insert other files if you dont want to dump everything in en_* namespace.
    ],
    "pt-br": ["./locales/pt-br.json"]
} as const;

export const LanguagesAvailable = ["en-us", "pt-br"];
export const FallbackLanguage = "en-us";
export type Locale = `${string}-${string}`;

type LocalizatonCtx = {
    language: Locale;
    setLanguage: React.Dispatch<React.SetStateAction<Locale>>;
};

const LocalizationContext = createContext<LocalizatonCtx>({} as unknown as LocalizatonCtx);
LocalizationContext.displayName = "Localization Context";
const LocalizationStorage = "lang";

/**
 * Handles and provides localization context (@see {IntlProvider})
 *
 * @see {useLocalization}
 */
export const Localization = ({ children }: PropsWithChildren<unknown>) => {
    const [lang, setLang] = useState<Locale>(() => {
        if (!window.localStorage) return FallbackLanguage;
        const savedLang = window.localStorage.getItem(LocalizationStorage) as Locale | null;
        if (!savedLang) return FallbackLanguage;

        console.info(`[Localizaton]: Found saved locale ${savedLang}`);
        return savedLang;
    });
    const [langData, setLangData] = useState<Record<string, string>>({});

    useEffect(() => {
        const effect = async () => {
            console.info(`[Localizaton]: Loading ${lang}`);
            console.time("[Localizaton]: Reload - Fallback Language");
            setLangData({});
            for (const file of LOCALE_FILE[FallbackLanguage]) {
                try {
                    const fileData = (await import(`${file}`)) as Record<string, string>;
                    setLangData(prevState => ({
                        ...prevState,
                        ...fileData
                    }));
                } catch (error) {
                    console.error("[Localizaton]:", error);
                }
            }
            console.timeEnd("[Localizaton]: Reload - Fallback Language");
            if (lang === FallbackLanguage) {
                console.info(
                    "[Localizaton]:",
                    `Skipped loading selected language since its ${FallbackLanguage} (Fallback Language)`
                );
                return;
            }

            console.time("[Localizaton]: Reload - Selected Language");
            for (const file of LOCALE_FILE[lang]) {
                try {
                    const fileData = (await import(`${file}`)) as Record<string, string>;
                    setLangData(prevState => ({
                        ...prevState,
                        ...fileData
                    }));
                } catch (error) {
                    console.error("[Localizaton]:", error);
                }
            }
            console.timeEnd("[Localizaton]: Reload - Selected Language");
        };

        void effect();
    }, [lang, setLangData]);

    useEffect(() => {
        if (!window.localStorage) return;
        window.localStorage.setItem(LocalizationStorage, lang);
        console.info(`[Localizaton]: Saved locale ${lang}`);
    }, [lang]);

    if (!Object.keys(langData).length) {
        return <Loading>Loading localization...</Loading>;
    }

    return (
        <LocalizationContext.Provider value={{ language: lang, setLanguage: setLang }}>
            <IntlProvider
                locale={getShortHandedLocale(lang)}
                messages={langData}
                defaultLocale="en">
                {children}
            </IntlProvider>
        </LocalizationContext.Provider>
    );
};

/**
 * Provides {language} for the current language and {setLanguage} to set the language.
 *
 * See {@see LanguagesAvailable LanguagesAvailable} for languages available
 */
export const useLocalization = () => useState(LocalizationContext);
