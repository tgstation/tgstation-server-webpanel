import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import TranslationFactory from "./translations/TranslationFactory.ts";

function mountApp() {
    const root = createRoot(document.getElementById("root")!);
    root.render(
        <App
            locale={navigator.languages[0]}
            translationFactory={new TranslationFactory()}
        />
    );
}

window.addEventListener("DOMContentLoaded", mountApp);
if (
    document.readyState === "interactive" ||
    document.readyState === "complete"
) {
    mountApp();
}
