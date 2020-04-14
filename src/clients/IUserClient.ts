import { User, UserUpdate } from './generated';

import TgsResponse from '../models/TgsResponse';

export default interface IUserClient {
    getCurrent(): TgsResponse<User>;
    getCurrentCached(): TgsResponse<User>;
    update(userUpdate: UserUpdate): TgsResponse<User>;
}
