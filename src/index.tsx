import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './definitions/scss.d';

import App from './App';
import Locales from './translations/Locales';
import './utils/icolibrary';
import './index.css';
import './ApiClient/_clients';
import './definitions/globals.d';

import('./styles/dark.scss');

const apiUrl = 'http://localhost:5000';

setupGlobals();

const rootNode = document.getElementById('root') as HTMLElement;
const appTsx = (
    <React.StrictMode>
        <App serverAddress={apiUrl} locale={Locales.en} />
    </React.StrictMode>
);

ReactDOM.render(appTsx, rootNode);
