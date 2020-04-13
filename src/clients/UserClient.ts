import IUsersClient from './IUserClient';
import IApiClient from './IApiClient';

import { User, UserUpdate } from './generated/models';
import { Configuration, UserApi } from './generated';

import { TgsResponse } from '../models/TgsResponse';

export default class UsersClient implements IUsersClient {
    private readonly userApi: UserApi;

    constructor(private readonly apiClient: IApiClient, apiConfig: Configuration) {
        this.userApi = new UserApi(apiConfig);
    }

    public getCurrent(): TgsResponse<User> {
        return this.apiClient.makeApiRequest(this.userApi.userControllerReadRaw.bind(this.userApi));
    }

    public update(userUpdate: UserUpdate): TgsResponse<User> {
        return this.apiClient.makeApiRequest(this.userApi.userControllerUpdateRaw.bind(this.userApi), null, {
            userUpdate
        });
    }

}
