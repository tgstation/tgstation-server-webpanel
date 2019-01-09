import IHttpClient from "../clients/IHttpClient";

import ILocalization from "./ILocalization";
import ITranslation from "./ITranslation";
import ITranslationFactory from "./ITranslationFactory";
import Locales from "./Locales";

class TranslationFactory implements ITranslationFactory {
  private static readonly fallbackLocale: string = Locales.en;

  private static getShortHandedLocale(locale: string): string {
    return locale.split("-")[0];
  }

  private readonly httpClient: IHttpClient;

  constructor(httpClient: IHttpClient) {
    this.httpClient = httpClient;
  }

  public async loadTranslation(locale: string): Promise<ITranslation> {
    const response = await this.httpClient.runRequest("/locales/" + locale + ".json", undefined, true);

    if (response.status < 200 || response.status >= 300) {
      let shortHandedLocale = TranslationFactory.getShortHandedLocale(locale);
      if (shortHandedLocale === locale) {
        if (shortHandedLocale === TranslationFactory.fallbackLocale)
          throw new Error("Invalid locale: " + locale);
        shortHandedLocale = TranslationFactory.fallbackLocale;
      }
      return await this.loadTranslation(shortHandedLocale);
    }
    const json = await response.json() as ILocalization;

    const translation: ITranslation = {
      locale,
      messages: json
    };

    return translation;
  }
}

export default TranslationFactory;
