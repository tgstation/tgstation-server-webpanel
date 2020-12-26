//definition files
import "./definitions/scss.d";
import "./definitions/globals.d";
//css
import "./styles/dark.scss";
//polyfills
import "@formatjs/intl-relativetimeformat/polyfill";
import "@formatjs/intl-relativetimeformat/locale-data/en";
import "@formatjs/intl-pluralrules/polyfill";
import "@formatjs/intl-pluralrules/locale-data/en";

import * as React from "react";
import { render as ReactDOMRender } from "react-dom";

import ConfigController from "./ApiClient/util/ConfigController";
import App from "./App";
import Locales from "./translations/Locales";
import initIcons from "./utils/icolibrary";

initIcons();
ConfigController.loadconfig();

//I can't be assed to remember the default admin password
document.addEventListener("keydown", function (event) {
    if (event.key == "L" && event.ctrlKey && event.shiftKey) {
        alert("ISolemlySwearToDeleteTheDataDirectory");
    }
});

const rootNode = document.getElementById("root") as HTMLElement;
const appTsx = (
    <React.StrictMode>
        <App locale={Locales.en} />
    </React.StrictMode>
);

ReactDOMRender(appTsx, rootNode);
