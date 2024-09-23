import type { ConfigurationFileResponse } from "../generatedcode/generated";

export type DownloadedConfigFile = ConfigurationFileResponse & {
    content?: Blob;
};
