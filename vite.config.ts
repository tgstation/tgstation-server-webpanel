import path from "path";

import react from "@vitejs/plugin-react";
import removeTestIdAttribute from "rollup-plugin-jsx-remove-attributes";
import { defineConfig, loadEnv } from "vite";
import relay from "vite-plugin-relay";

// https://vitejs.dev/config/
const plugins = [relay, react()];

export default defineConfig(({ mode }) => {
    process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

    const testAttributeRemoverPlugin =
        // keep this one last, the storybook config pops it off
        removeTestIdAttribute({
            attributes: ["data-testid"], // remove test attributes from jsx
            usage: "vite"
        });
    if (process.env.VITE_DEV_MODE !== "false") {
        plugins.push(testAttributeRemoverPlugin);
    }

    return {
        build: {
            rollupOptions: {
                input: ["index.html", "src/main.tsx"]
            },
            manifest: "webpanelmanifest.json"
        },
        plugins,
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "./src")
            }
        }
    };
});
