import { DreamDaemonApi } from './generated';

import ComponentClient from './ComponentClient';
import IDreamDaemonClient from './IDreamDaemonClient';
import IApiClient from './IApiClient';

export default class DreamDaemonClient extends ComponentClient
    implements IDreamDaemonClient {
    private readonly dreamDaemonApi: DreamDaemonApi;

    public constructor(apiClient: IApiClient, instanceId: number) {
        super(apiClient, instanceId);

        this.dreamDaemonApi = new DreamDaemonApi(apiClient.config);
    }
}
