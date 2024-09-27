/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_PUBLIC_PATH: string
    readonly VITE_DEV_MODE: boolean
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
