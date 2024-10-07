import { createRoot } from "react-dom/client";

import App from "./App.tsx";
import "./index.css";
import TranslationFactory from "./lib/translations/TranslationFactory.ts";

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

if (document.readyState === "interactive" || document.readyState === "complete") {
    mountApp();
} else {
    window.addEventListener("DOMContentLoaded", mountApp);
}
