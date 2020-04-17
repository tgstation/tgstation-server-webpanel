import IUsersClient from './IUserClient';
import IApiClient from './IApiClient';

import { User, UserUpdate, Token } from './generated/models';
import { UserApi } from './generated';

import ServerResponse from '../models/ServerResponse';
import TgsResponse from '../models/TgsResponse';

export default class UsersClient implements IUsersClient {
    private readonly userApi: UserApi;

    private currentUserPromise: TgsResponse<User> | null;
    private currentUser: ServerResponse<User> | null;
    private currentCacheToken: Token | null;

    constructor(private readonly apiClient: IApiClient) {
        this.userApi = new UserApi(apiClient.config);

        this.currentUserPromise = null;
        this.currentUser = null;
        this.currentCacheToken = null;
    }

    public async getCurrentCached(forceRefresh?: boolean): Promise<ServerResponse<User> | null> {
        if (forceRefresh) {
            this.currentCacheToken = null;
            this.currentUser = null;
        }

        if (this.currentUser && this.currentCacheToken === this.apiClient.getToken()) {
            return this.currentUser;
        }

        const controlOfPromise = !this.currentUserPromise;
        if (controlOfPromise) {
            this.currentUserPromise = this.apiClient.makeApiRequest(this.userApi.userControllerReadRaw.bind(this.userApi));
        }

        const result = await this.currentUserPromise;

        if (controlOfPromise) {
            this.currentUserPromise = null;
            if (result?.model) {
                this.currentUser = result;
                this.currentCacheToken = this.apiClient.getToken();
            } else {
                this.currentUser = null;
                this.currentCacheToken = null;
            }
        }

        return result;
    }

    public list(): TgsResponse<User[]> {
        return this.apiClient.makeApiRequest(this.userApi.userControllerListRaw.bind(this.userApi));
    }

    public update(userUpdate: UserUpdate): TgsResponse<User> {
        return this.apiClient.makeApiRequest(this.userApi.userControllerUpdateRaw.bind(this.userApi), null, {
            userUpdate
        });
    }

    public getId(user: User): TgsResponse<User> {
        if (!user.id)
            throw new Error('user.Id was null!');

        return this.apiClient.makeApiRequest(this.userApi.userControllerGetIdRaw.bind(this.userApi), null, {
            id: user.id
        });
    }
}
