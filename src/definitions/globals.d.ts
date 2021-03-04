import { ApiClient } from "../ApiClient/_base";
import CredentialsProvider from "../ApiClient/util/CredentialsProvider";
import RouteController from "../utils/RouteController";

declare global {
    interface Window {
        loadedChannelFromWebpack?: boolean;
        clients: Record<string, ApiClient>;
        credentialProvider?: CredentialsProvider;
        rtcontroller?: RouteController;
    }
}

/*
AdminClient: AdminClient;
        ByondClient: ByondClient;
        InstanceClient: InstanceClient;
        InstancePermissionSetClient: InstancePermissionSetClient;
        JobsClient: JobsClient;
        ServerClient: ServerClient;
        TransferClient: TransferClient;
        UserClient: UserClient;
        UserGroupClient: UserGroupClient;
 */
