import { ByondApi, Byond } from './generated';

import ComponentClient from './ComponentClient';
import IByondClient from './IByondClient';
import IApiClient from './IApiClient';

import TgsResponse from '../models/TgsResponse';

export default class ByondClient extends ComponentClient
    implements IByondClient {
    private readonly byondApi: ByondApi;

    public constructor(apiClient: IApiClient, instanceId: number) {
        super(apiClient, instanceId);

        this.byondApi = new ByondApi(apiClient.config);
    }

    public read(): TgsResponse<Byond> {
        return this.makeApiRequest(
            this.byondApi.byondControllerReadRaw.bind(this.byondApi)
        );
    }
}
