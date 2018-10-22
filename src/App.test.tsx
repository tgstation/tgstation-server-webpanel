import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
import ITranslation from './translations/ITranslation';
import ITranslationFactory from './translations/ITranslationFactory';
import Locales from './translations/Locales';

class FakeTranslationFactory implements ITranslationFactory {
  public loadTranslation(locale: string): Promise<ITranslation> {
    return Promise.resolve<ITranslation>({
      locale: Locales.enCA,
      messages: {}
    });
  }
}

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App serverAddress="https://tgs4alpha.dextraspace.net" locale={Locales.enCA} translationFactory={new FakeTranslationFactory()} />, div);
});
