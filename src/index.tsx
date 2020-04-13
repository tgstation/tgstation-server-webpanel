import * as React from 'react';
import * as ReactDOM from 'react-dom';

import App from './App';
import Locales from './translations/Locales';

import './index.css';

const apiUrl = process.env.TGS || "http://localhost:5000";

const rootNode = document.getElementById('root') as HTMLElement;
const appTsx =
    <React.StrictMode>
        <App serverAddress={apiUrl} locale={Locales.en} />
    </React.StrictMode>;

ReactDOM.render(appTsx, rootNode);
