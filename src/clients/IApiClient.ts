import { ApiResponse, Token, Configuration } from './generated';

import TgsResponse from '../models/TgsResponse';

export type RawRequestFunc<TRequestParameters, TModel> = (requestParameters: TRequestParameters) => Promise<ApiResponse<TModel>>;

export default interface IApiClient {
    readonly config: Configuration;

    getToken(): Token | null;

    makeApiRequest<TRequestParameters, TModel>(
        rawRequestFunc: RawRequestFunc<TRequestParameters, TModel>,
        instanceId?: number | null,
        requestParameters?: TRequestParameters | any | null,
        requiresToken?: boolean): TgsResponse<TModel>;
}
