import { createRoot } from "react-dom/client";

import App from "./App.tsx";
import "./index.css";
import TranslationFactory from "./lib/translations/TranslationFactory.ts";

import Pkg from "@/../package.json";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
if ((window as any).loadedChannelFromWebpack && import.meta.env.PROD) {
    alert(
        "Warning: channel.json was served from bundled files instead of TGS, the webpanel is running from the local version instead of the github update repo.\nPlease report this to your server host.\nIf you are the server host, please report this to alexkar598#2712 on discord\n\nWebpanel version: " +
            Pkg.version
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
    const root = createRoot(document.getElementById("root")!);
    root.render(
        <App preferredLocales={navigator.languages} translationFactory={new TranslationFactory()} />
    );
}

window.addEventListener("DOMContentLoaded", mountApp);
if (document.readyState === "interactive" || document.readyState === "complete") {
    mountApp();
}
