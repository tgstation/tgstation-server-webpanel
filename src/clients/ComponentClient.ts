import { Token, Configuration } from './generated';

import IApiClient, { RawRequestFunc } from './IApiClient';

import TgsResponse from '../models/TgsResponse';

export default abstract class ComponentClient implements IApiClient {
    public readonly config: Configuration;

    constructor(
        private readonly apiClient: IApiClient,
        private readonly instanceId: number
    ) {
        this.config = apiClient.config;
    }

    public getToken(): Token | null {
        return this.apiClient.getToken();
    }

    public makeApiRequest<TRequestParameters, TModel>(
        rawRequestFunc: RawRequestFunc<TRequestParameters, TModel>,
        instanceId?: number | null,
        requestParameters?: TRequestParameters | any | null,
        requiresToken?: boolean
    ): TgsResponse<TModel> {
        return this.apiClient.makeApiRequest(
            rawRequestFunc,
            instanceId || this.instanceId,
            requestParameters,
            requiresToken
        );
    }
}
