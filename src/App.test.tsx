import * as React from 'react';

import { render } from '@testing-library/react';

import App from './App';

import ITranslation from './translations/ITranslation';
import ITranslationFactory from './translations/ITranslationFactory';
import Locales from './translations/Locales';
import Translation from './translations/Translation';

class FakeTranslationFactory implements ITranslationFactory {
  public loadTranslation(locale: string): Promise<ITranslation> {
    return Promise.resolve<ITranslation>(new Translation(Locales.enCA, {}));
  }
}

it('renders without crashing', () => {
  const div = document.createElement('div');
  render(<App serverAddress="https://tgs.fakesite.net" locale={Locales.enCA} translationFactory={new FakeTranslationFactory()} />, div);
});
