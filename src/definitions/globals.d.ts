import { ApiClient } from "../ApiClient/_base";
import CredentialsProvider from "../ApiClient/util/CredentialsProvider";
import RouteController from "../utils/RouteController";

declare global {
    interface Window {
        loadedChannelFromWebpack?: boolean;
        clients: Record<string, ApiClient>;
        credentialProvider?: CredentialsProvider;
        rtcontroller?: RouteController;
        publicPath: string;
    }
}
