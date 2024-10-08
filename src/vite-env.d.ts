/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_PUBLIC_PATH: string;
    readonly VITE_DEV_MODE: boolean;
    readonly VITE_DEV_DELAY_SECONDS: number;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
