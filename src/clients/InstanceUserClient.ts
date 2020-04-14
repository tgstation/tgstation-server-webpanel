import { InstanceUserApi, InstanceUser, Token } from './generated';

import ComponentClient from './ComponentClient';
import IInstanceUserClient from './IInstanceUserClient';
import IApiClient from './IApiClient';

import ServerResponse from '../models/ServerResponse';
import TgsResponse from '../models/TgsResponse';

export default class InstanceUserClient extends ComponentClient implements IInstanceUserClient {
    private readonly instanceUserApi: InstanceUserApi;

    private currentUserPromise: TgsResponse<InstanceUser> | null;
    private currentUser: ServerResponse<InstanceUser> | null;
    private currentCacheToken: Token | null;

    constructor(apiClient: IApiClient, instanceId: number) {
        super(apiClient, instanceId);

        this.instanceUserApi = new InstanceUserApi(apiClient.config);

        this.currentUserPromise = null;
        this.currentUser = null;
        this.currentCacheToken = null;
    }

    public async getCurrentCached(forceRefresh?: boolean): Promise<ServerResponse<InstanceUser> | null> {
        if (forceRefresh) {
            this.currentCacheToken = null;
            this.currentUser = null;
        }

        if (this.currentUser && this.currentCacheToken === this.getToken()) {
            return this.currentUser;
        }

        const controlOfPromise = !this.currentUserPromise;
        if (controlOfPromise) {
            this.currentUserPromise = this.makeApiRequest(this.instanceUserApi.instanceUserControllerReadRaw.bind(this.instanceUserApi));;
        }

        const result = await this.currentUserPromise;

        if (controlOfPromise) {
            this.currentUserPromise = null;
            if (result?.model) {
                this.currentUser = result;
                this.currentCacheToken = this.getToken();
            } else {
                this.currentUser = null;
                this.currentCacheToken = null;
            }
        }

        return result;
    }
}
