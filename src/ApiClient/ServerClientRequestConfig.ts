import { AxiosRequestConfig } from "axios";

export type ServerClientRequestConfig = AxiosRequestConfig & {
    overrideTokenDetection?: boolean;
};
