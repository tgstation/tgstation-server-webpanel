import path from "path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import relay from "vite-plugin-relay";

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        rollupOptions: {
            external: ["src/main.tsx"]
        }
    },
    plugins: [relay, react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src")
        }
    }
});
