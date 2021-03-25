import ITranslation from "./ITranslation";
import ITranslationFactory from "./ITranslationFactory";
import Locales, { LocalesHumanReadable } from "./Locales";
import Translation from "./Translation";

class TranslationFactory implements ITranslationFactory {
    private static readonly fallbackLocale: string = Locales.en;
    /**
     * All the possible languages you can select. Key is the locales and value is the language
     */
    public static readonly localesHumanReadable: { [key: string]: string } = LocalesHumanReadable;

    private static getShortHandedLocale(locale: string): string {
        return locale.split("-")[0];
    }

    public async loadTranslation(locale: string): Promise<ITranslation> {
        // Load the en lang (AS BASE)
        const default_en: { [key: string]: string } = (await import(
            `./locales/${TranslationFactory.fallbackLocale}.json`
        )) as {
            [key: string]: string;
        };
        // Import the specified lang, so you can just make keys for things you WANT to translate!
        const specified_lang: { [key: string]: string } = (await import(
            `./locales/${locale}.json`
        )) as {
            [key: string]: string;
        };
        // fancy type annotations but its just load the json file in this variable as a map of strings to strings
        // merge them into one json
        const localization: { [key: string]: string } = { ...default_en, ...specified_lang } as {
            [key: string]: string;
        };
        // things we assume on this check:
        // 1. The defualt en loads
        // 2. The fallback locale never fails
        if (!specified_lang) {
            const shortHandedLocale = TranslationFactory.getShortHandedLocale(locale);
            if (shortHandedLocale === locale) {
                if (shortHandedLocale !== TranslationFactory.fallbackLocale)
                    throw new Error("Invalid locale: " + locale);
            }
            // return await this.loadTranslation(shortHandedLocale);
        }

        let model: ITranslation | null = null;
        try {
            model = new Translation(locale, localization);
        } catch (e) {
            throw Error(`Error loading localization for locale '${locale}': ${JSON.stringify(e)}`);
        }

        return model;
    }
}

export default TranslationFactory;
