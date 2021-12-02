import { ApiClient } from "../ApiClient/_base";
import AuthController from "../ApiClient/util/AuthController";
import RouteController from "../utils/RouteController";

declare global {
    interface Window {
        loadedChannelFromWebpack?: boolean;
        clients: Record<string, ApiClient>;
        authController?: AuthController;
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
