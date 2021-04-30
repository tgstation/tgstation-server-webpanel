import { LogFileResponse } from "../generatedcode/schemas";

export type DownloadedLog = LogFileResponse & {
    content: string;
};
