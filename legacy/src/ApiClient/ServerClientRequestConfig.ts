import { InternalAxiosRequestConfig } from "axios";

export type ServerClientRequestConfig = InternalAxiosRequestConfig & {
    overrideTokenDetection?: boolean;
};
