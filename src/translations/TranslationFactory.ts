import enCATranslation from "./enCATranslation";
import ITranslation from "./ITranslation";
import Locales from "./Locales";

class TranslationFactory {
  public async LoadTranslation(locale: string): Promise<ITranslation> {
    let translation: ITranslation;
    switch (locale) {
      case Locales.enCA:
        translation = new enCATranslation();
        break;
      default:
        throw new Error("Invalid locale: " + locale + "!");
    }

    await translation.Load();

    return translation;
  }
}

export default TranslationFactory;
