import { User, UserUpdate } from './generated';

import TgsResponse from '../models/TgsResponse';

export default interface IUserClient {
    getCurrentCached(forceRefresh?: boolean): TgsResponse<User>;
    update(userUpdate: UserUpdate): TgsResponse<User>;
    list(): TgsResponse<Array<User>>;
    getId(user: User): TgsResponse<User>;
}
