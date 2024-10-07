import ITranslation from "./ITranslation";
import ITranslationFactory from "./ITranslationFactory";
import Translation from "./Translation";

class TranslationFactory implements ITranslationFactory {
    private static getShortHandedLocale(locale: string): string {
        return locale.split("-")[0];
    }

    public async loadTranslation(locale: string): Promise<ITranslation> {
        //fancy type annotations but its just load the json file in this variable as a map of strings to strings
        let localization: { [key: string]: string } | null;
        try {
            localization = (await import(`./locales/${locale}.json`)).default;
        } catch {
            localization = null;
        }

        if (!localization) {
            const shortHandedLocale = TranslationFactory.getShortHandedLocale(locale);
            if (shortHandedLocale === locale) {
                throw new Error("Invalid locale: " + locale);
            }
            return await this.loadTranslation(shortHandedLocale);
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