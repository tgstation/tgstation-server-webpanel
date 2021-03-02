import { ApiClient } from "../ApiClient/_base";

declare global {
    interface Window {
        loadedChannelFromWebpack?: boolean;
        clients: Record<string, ApiClient>;
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
