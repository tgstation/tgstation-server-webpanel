import { InstanceUser } from './generated';

import TgsResponse from '../models/TgsResponse';

export default interface IInstanceUserClient {
    getCurrentCached(forceRefresh?: boolean): TgsResponse<InstanceUser>;
}
