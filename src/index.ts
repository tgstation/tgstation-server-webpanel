// definition files
// css
import "./styles/dark.scss";
// polyfills
import "@formatjs/intl-relativetimeformat/polyfill";
import "@formatjs/intl-relativetimeformat/locale-data/en";
import "@formatjs/intl-pluralrules/polyfill";
import "@formatjs/intl-pluralrules/locale-data/en";

import ReactDOM from "react-dom";

import ConfigController from "./ApiClient/util/ConfigController";
import JobsController from "./ApiClient/util/JobsController";
import { IndexApp } from "./App";
import { MODE, VERSION } from "./definitions/constants";
import initIcons from "./utils/icolibrary";

// dont lag the dom
initIcons();
ConfigController.loadconfig();
JobsController.init();

if (window.loadedChannelFromWebpack && MODE !== "DEV") {
    alert(
        "Warning: channel.json was served from bundled files instead of TGS, the webpanel is running from the local version instead of the github update repo.\nPlease report this to your server host.\nIf you are the server host, please report this to alexkar598#2712 on discord\n\nWebpanel version: " +
            VERSION
    );
}

// At some point, the webpanel had the ability to save passwords, this is however,
// insecure as compromised webhosts can lead to code being served from an untrusted source,
// leaking the saved password. Makes sure it's not there anymore
try {
    window.localStorage.removeItem("username");
    window.sessionStorage.removeItem("username");
    window.localStorage.removeItem("password");
    window.sessionStorage.removeItem("password");
} catch {
    (() => {})();
}

window.addEventListener("DOMContentLoaded", () => {
    ReactDOM.render(IndexApp, document.getElementById("root"));
});
