import { ConfigurationApi } from './generated';

import ComponentClient from './ComponentClient';
import IConfigurationClient from './IConfigurationClient';
import IApiClient from './IApiClient';

export default class ConfigurationClient extends ComponentClient
    implements IConfigurationClient {
    private readonly configurationApi: ConfigurationApi;

    public constructor(apiClient: IApiClient, instanceId: number) {
        super(apiClient, instanceId);

        this.configurationApi = new ConfigurationApi(apiClient.config);
    }
}
