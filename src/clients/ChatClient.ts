import { ChatApi } from './generated';

import ComponentClient from './ComponentClient';
import IChatClient from './IChatClient';
import IApiClient from './IApiClient';

export default class ChatClient extends ComponentClient implements IChatClient {
    private readonly chatApi: ChatApi;

    public constructor(apiClient: IApiClient, instanceId: number) {
        super(apiClient, instanceId);

        this.chatApi = new ChatApi(apiClient.config);
    }
}
