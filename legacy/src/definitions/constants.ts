declare const API_VERSION: string;
declare const VERSION: string;
declare const MODE: "DEV" | "PROD" | "GITHUB";
declare const DEFAULT_BASEPATH: string;
declare const DEFAULT_APIPATH: string;

const _API_VERSION = API_VERSION;
const _VERSION = VERSION;
const _MODE = MODE;
const _DEFAULT_BASEPATH = DEFAULT_BASEPATH;
const _DEFAULT_APIPATH = DEFAULT_APIPATH;

export { _API_VERSION as API_VERSION };
export { _VERSION as VERSION };
export { _MODE as MODE };
export { _DEFAULT_BASEPATH as DEFAULT_BASEPATH };
export { _DEFAULT_APIPATH as DEFAULT_APIPATH };
