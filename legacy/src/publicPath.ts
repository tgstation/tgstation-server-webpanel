declare let __webpack_public_path__: string;
declare let MODE: "GITHUB" | "PROD" | "DEV";

// eslint-disable-next-line prefer-const
if (window.publicPath && MODE !== "GITHUB") __webpack_public_path__ = window.publicPath;
console.log("Public path:", __webpack_public_path__);

export {};
