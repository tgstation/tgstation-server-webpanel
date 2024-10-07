import path from "path";

import react from "@vitejs/plugin-react";
import removeTestIdAttribute from "rollup-plugin-jsx-remove-attributes";
import { defineConfig } from "vite";
import relay from "vite-plugin-relay";

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        rollupOptions: {
            input: ["index.html", "src/main.tsx"]
        },
        manifest: "webpanelmanifest.json"
    },
    plugins: [
        relay,
        react(),
        // keep this one last, the storybook config pops it off
        removeTestIdAttribute({
            attributes: ["data-testid"], // remove test attributes from jsx
            usage: "vite"
        })
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src")
        }
    }
});
