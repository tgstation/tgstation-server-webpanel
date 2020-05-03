import * as React from 'react';
import * as ReactDOM from 'react-dom';

import App from './App';
import Locales from './translations/Locales';

import './index.css';

const apiUrl = process.env.TGSCP_API || 'http://localhost:5000';
const basePath = '/tgstation-server-control-panel';

const rootNode = document.getElementById('root') as HTMLElement;
const appTsx = (
    <React.StrictMode>
        <App basePath={basePath} serverAddress={apiUrl} locale={Locales.en} />
    </React.StrictMode>
);

ReactDOM.render(appTsx, rootNode);
