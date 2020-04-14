import IUsersClient from './IUserClient';
import IApiClient from './IApiClient';

import { User, UserUpdate, Token } from './generated/models';
import { UserApi } from './generated';

import ServerResponse from '../models/ServerResponse';
import TgsResponse from '../models/TgsResponse';

export default class UsersClient implements IUsersClient {
    private readonly userApi: UserApi;

    private currentUser: ServerResponse<User> | null;
    private currentCacheToken: Token | null;

    constructor(private readonly apiClient: IApiClient) {
        this.userApi = new UserApi(apiClient.config);
        this.currentUser = null;
        this.currentCacheToken = null;
    }

    public async getCurrentCached(): Promise<ServerResponse<User> | null> {
        if (this.currentUser && this.currentCacheToken === this.apiClient.getToken()) {
            return this.currentUser;
        }

        return await this.getCurrent();
    }

    public async getCurrent(): Promise<ServerResponse<User> | null> {
        const result = await this.apiClient.makeApiRequest(this.userApi.userControllerReadRaw.bind(this.userApi));
        if (result?.model) {
            this.currentUser = result;
            this.currentCacheToken = this.apiClient.getToken();
        } else {
            this.currentUser = null;
            this.currentCacheToken = null;
        }

        return result;
    }

    public update(userUpdate: UserUpdate): TgsResponse<User> {
        return this.apiClient.makeApiRequest(this.userApi.userControllerUpdateRaw.bind(this.userApi), null, {
            userUpdate
        });
    }

}
