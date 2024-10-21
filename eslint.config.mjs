import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import react from "eslint-plugin-react";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import prettier from "eslint-plugin-prettier";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [{
    ignores: [
        ".yarn/**/*",
        "node_modules/**/*",
        "public/**/*",
        "**/webpack.*.js",
        "**/babel.*.js",
        "**/jsonmanifest-plugin.js",
        "**/yarn.lock",
        "src/ApiClient/generatedcode/**.ts",
        "src/index.js",
        "src/index.html",
        "dist/**/*",
        "scripts/**/*",
        "**/*.svg",
        "**/*.json",
        "**/*.png",
        "**/*.scss",
        "**/*.css",
        "**/postcss.config.js",
        "**/README.md",
        "**/LICENSE",
    ],
}, ...fixupConfigRules(compat.extends(
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "plugin:import/react",
)), {
    plugins: {
        react: fixupPluginRules(react),
        "@typescript-eslint": fixupPluginRules(typescriptEslint),
        "simple-import-sort": simpleImportSort,
        prettier,
    },

    languageOptions: {
        globals: {
            ...globals.browser,
            Atomics: "readonly",
            SharedArrayBuffer: "readonly",
        },

        parser: tsParser,
        ecmaVersion: "latest",
        sourceType: "module",

        parserOptions: {
            ecmaFeatures: {
                jsx: true,
            },

            tsconfigRootDir: ".",
            project: ["./tsconfig.json"],
        },
    },

    settings: {
        react: {
            version: "detect",
        },
    },

    rules: {
        "simple-import-sort/imports": "error",

        "@typescript-eslint/explicit-member-accessibility": ["error", {
            accessibility: "explicit",
        }],

        "@typescript-eslint/prefer-promise-reject-errors": "off",
        "linebreak-style": "off",
        "no-unused-vars": "off",
        "import/no-cycle": "error",
        "@typescript-eslint/unbound-method": "off",

        "@typescript-eslint/ban-ts-comment": ["warn", {
            "ts-expect-error": "allow-with-description",
        }],

        "@typescript-eslint/no-non-null-assertion": "off",
        "@typescript-eslint/no-empty-interface": "off",
        "@typescript-eslint/no-empty-function": "off",
        "prettier/prettier": "error",
        "react/prop-types": "off",
    },
}];