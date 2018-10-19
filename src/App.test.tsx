import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
import Locales from './translations/Locales';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App serverAddress="https://tgs4alpha.dextraspace.net" locale={Locales.enCA} />, div);
  ReactDOM.unmountComponentAtNode(div);
});
