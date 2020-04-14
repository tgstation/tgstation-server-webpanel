import { InstanceUserApi, InstanceUser, Token } from './generated';

import ComponentClient from './ComponentClient';
import IInstanceUserClient from './IInstanceUserClient';
import IApiClient from './IApiClient';

import ServerResponse from '../models/ServerResponse';

export default class InstanceUserClient extends ComponentClient implements IInstanceUserClient {
    private readonly instanceUserApi: InstanceUserApi;

    private currentUser: ServerResponse<InstanceUser> | null;
    private currentCacheToken: Token | null;

    constructor(apiClient: IApiClient, instanceId: number) {
        super(apiClient, instanceId);

        this.instanceUserApi = new InstanceUserApi(apiClient.config);

        this.currentUser = null;
        this.currentCacheToken = null;
    }

    public async getCurrentCached(): Promise<ServerResponse<InstanceUser> | null> {
        if (this.currentUser && this.currentCacheToken === this.getToken()) {
            return this.currentUser;
        }

        return await this.getCurrent();
    }

    public async getCurrent(): Promise<ServerResponse<InstanceUser> | null> {
        const result = await this.makeApiRequest(this.instanceUserApi.instanceUserControllerReadRaw.bind(this.instanceUserApi));
        if (result?.model) {
            this.currentUser = result;
            this.currentCacheToken = this.getToken();
        } else {
            this.currentUser = null;
            this.currentCacheToken = null;
        }

        return result;
    }

}
