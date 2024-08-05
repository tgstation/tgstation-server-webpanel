// eslint-disable-next-line
import "./publicPath";

import ReactDOM from "react-dom";

import { RootLoading } from "./RootLoading";
import { MODE, VERSION } from "./definitions/constants";

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

function mountApp() {
    ReactDOM.render(RootLoading, document.getElementById("root"));
}

window.addEventListener("DOMContentLoaded", mountApp);
if (document.readyState === "interactive" || document.readyState === "complete") {
    mountApp();
}
