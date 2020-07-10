//external imports
import * as React from 'react';
import * as ReactDOM from 'react-dom';

//local imports
import App from './App';
import Locales from './translations/Locales';

//definition files
import './definitions/scss.d';
import './definitions/globals.d';

//init script
import './utils/icolibrary';
import './utils/ConfigController';

//css
import './styles/dark.scss';

const rootNode = document.getElementById('root') as HTMLElement;
const appTsx = (
    <React.StrictMode>
        <App locale={Locales.en} />
    </React.StrictMode>
);

ReactDOM.render(appTsx, rootNode);
