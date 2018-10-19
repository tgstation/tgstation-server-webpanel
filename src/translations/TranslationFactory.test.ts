import Locales from './Locales';
import TranslationFactory from './TranslationFactory';

const translationFactory = new TranslationFactory();
it('loads english translation properly', () => translationFactory.LoadTranslation(Locales.enCA));

it('throws when given a bad locale', async () => {
  try {
    await translationFactory.LoadTranslation("fake as hell");
  } catch (e) {
    expect(e).toBeInstanceOf(Error);
    return;
  }
  expect(true).toBeFalsy();
});
