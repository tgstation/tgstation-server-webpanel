import type { LogFileResponse } from "../generatedcode/generated";

export type DownloadedLog = LogFileResponse & {
    content: string;
};
