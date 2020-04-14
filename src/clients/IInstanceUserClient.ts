import { InstanceUser } from './generated';

import TgsResponse from '../models/TgsResponse';

export default interface IInstanceUserClient {
    getCurrent(): TgsResponse<InstanceUser>;
    getCurrentCached(): TgsResponse<InstanceUser>;
}
