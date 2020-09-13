//definition files
import "./definitions/scss.d";
import "./definitions/globals.d";
//init script
import "./utils/icolibrary";
import "./ApiClient/util/ConfigController";
//css
import "./styles/dark.scss";
//polyfills
import "@formatjs/intl-relativetimeformat/polyfill";
import "@formatjs/intl-relativetimeformat/locale-data/en";
import "@formatjs/intl-pluralrules/polyfill";
import "@formatjs/intl-pluralrules/locale-data/en";

import * as React from "react";
import * as ReactDOM from "react-dom";

//local imports
import App from "./App";
import Locales from "./translations/Locales";

const rootNode = document.getElementById("root") as HTMLElement;
const appTsx = (
    <React.StrictMode>
        <App locale={Locales.en} />
    </React.StrictMode>
);

ReactDOM.render(appTsx, rootNode);
