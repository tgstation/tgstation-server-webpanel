import IHttpClient from '../clients/IHttpClient';

import ServerResponse from '../models/ServerResponse';

import ILocalization from './ILocalization';
import ITranslation from './ITranslation';
import ITranslationFactory from './ITranslationFactory';
import Locales from './Locales';
import Translation from './Translation';

class TranslationFactory implements ITranslationFactory {
    private static readonly fallbackLocale: string = Locales.en;

    private static getShortHandedLocale(locale: string): string {
        return locale.split('-')[0];
    }

    private readonly httpClient: IHttpClient;

    public constructor(httpClient: IHttpClient) {
        this.httpClient = httpClient;
    }

    public async loadTranslation(
        locale: string
    ): Promise<ServerResponse<ITranslation>> {
        const requestPath = `/locales/${locale}.json`;
        const response = await this.httpClient.runRequest(requestPath);

        if (response.status < 200 || response.status >= 300) {
            let shortHandedLocale = TranslationFactory.getShortHandedLocale(
                locale
            );
            if (shortHandedLocale === locale) {
                if (shortHandedLocale === TranslationFactory.fallbackLocale)
                    throw new Error('Invalid locale: ' + locale);
                shortHandedLocale = TranslationFactory.fallbackLocale;
            }
            return await this.loadTranslation(shortHandedLocale);
        }

        let model: ITranslation | null = null;
        try {
            const localization = (await response.json()) as ILocalization;
            model = new Translation(locale, localization);
        } catch (e) {
            return new ServerResponse<ITranslation>(
                null,
                null,
                null,
                `Error loading localization for locale '${locale}': ${e.toString()}`
            );
        }

        return new ServerResponse(model, response, model);
    }
}

export default TranslationFactory;
