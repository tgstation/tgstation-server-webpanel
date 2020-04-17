import IHttpClient from '../clients/IHttpClient';

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

    public async loadTranslation(locale: string): Promise<ITranslation> {
        const requestPath =
            process.env.NODE_ENV === 'development'
                ? 'tgstation-server-control-panel'
                : '';
        '/locales/' + locale + '.json';
        const response = await this.httpClient.runRequest(
            requestPath,
            undefined,
            true
        );

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

        const json = (await response.json()) as ILocalization;

        return new Translation(locale, json);
    }
}

export default TranslationFactory;
