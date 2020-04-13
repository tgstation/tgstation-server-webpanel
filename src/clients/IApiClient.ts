import { ApiResponse } from './generated';

import { TgsResponse } from '../models/TgsResponse';

export default interface IApiClient {
    makeApiRequest<TRequestParameters, TModel>(
        rawRequestFunc: (requestParameters: TRequestParameters) => Promise<ApiResponse<TModel>>,
        instanceId?: number | null,
        requestParameters?: TRequestParameters | any | null,
        requiresToken?: boolean): TgsResponse<TModel>;
}
