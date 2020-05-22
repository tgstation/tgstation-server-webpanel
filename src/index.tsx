import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './definitions/scss.d';

import App from './App';
import Locales from './translations/Locales';
import './utils/icolibrary';
import './index.css';
import './definitions/globals.d';
import { GlobalObjects } from './utils/globalObjects';

if (GlobalObjects.darkMode) {
    import('./styles/dark.scss');
} else {
    import('./styles/light.scss');
}

const apiUrl = process.env.TGSCP_API || 'http://localhost:5000';

const rootNode = document.getElementById('root') as HTMLElement;
const appTsx = (
    <React.StrictMode>
        <App serverAddress={apiUrl} locale={Locales.en} />
    </React.StrictMode>
);

ReactDOM.render(appTsx, rootNode);
