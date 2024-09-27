import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

function mountApp() {
    const root = createRoot(document.getElementById('root')!)
    root.render(
        <App />,
    )
}

window.addEventListener("DOMContentLoaded", mountApp);
if (document.readyState === "interactive" || document.readyState === "complete") {
    mountApp();
}
