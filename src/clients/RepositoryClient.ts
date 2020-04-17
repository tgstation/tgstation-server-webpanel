import { RepositoryApi } from './generated';

import ComponentClient from './ComponentClient';
import IRepositoryClient from './IRepositoryClient';
import IApiClient from './IApiClient';

export default class RepositoryClient extends ComponentClient
    implements IRepositoryClient {
    private readonly repositoryApi: RepositoryApi;

    constructor(apiClient: IApiClient, instanceId: number) {
        super(apiClient, instanceId);

        this.repositoryApi = new RepositoryApi(apiClient.config);
    }
}
