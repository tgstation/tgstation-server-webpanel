declare let __webpack_public_path__: string;
declare const DEFAULT_BASEPATH: string;

if (!window.publicPath) window.publicPath = DEFAULT_BASEPATH;

// eslint-disable-next-line prefer-const
__webpack_public_path__ = window.publicPath;
console.log("Public path:", __webpack_public_path__);

export {};
