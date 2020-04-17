import { DreamMakerApi } from './generated';

import ComponentClient from './ComponentClient';
import IDreamMakerClient from './IDreamMakerClient';
import IApiClient from './IApiClient';

export default class DreamMakerClient extends ComponentClient
    implements IDreamMakerClient {
    private readonly dreamMakerApi: DreamMakerApi;

    constructor(apiClient: IApiClient, instanceId: number) {
        super(apiClient, instanceId);

        this.dreamMakerApi = new DreamMakerApi(apiClient.config);
    }
}
