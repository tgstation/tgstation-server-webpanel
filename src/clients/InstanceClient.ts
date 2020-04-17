import IApiClient from './IApiClient';
import IInstanceClient from './IInstanceClient';

import IRepositoryClient from './IRepositoryClient';
import IByondClient from './IByondClient';
import IDreamMakerClient from './IDreamMakerClient';
import IDreamDaemonClient from './IDreamDaemonClient';
import IChatClient from './IChatClient';
import IConfigurationClient from './IConfigurationClient';
import IInstanceUserClient from './IInstanceUserClient';

import RepositoryClient from './RepositoryClient';
import ByondClient from './ByondClient';
import DreamMakerClient from './DreamMakerClient';
import DreamDaemonClient from './DreamDaemonClient';
import ChatClient from './ChatClient';
import ConfigurationClient from './ConfigurationClient';
import InstanceUserClient from './InstanceUserClient';

export default class InstanceClient implements IInstanceClient {
    public readonly repo: IRepositoryClient;
    public readonly byond: IByondClient;
    public readonly dreamMaker: IDreamMakerClient;
    public readonly dreamDaemon: IDreamDaemonClient;
    public readonly chat: IChatClient;
    public readonly config: IConfigurationClient;
    public readonly users: IInstanceUserClient;

    public constructor(apiClient: IApiClient, instanceId: number) {
        this.repo = new RepositoryClient(apiClient, instanceId);
        this.byond = new ByondClient(apiClient, instanceId);
        this.dreamMaker = new DreamMakerClient(apiClient, instanceId);
        this.dreamDaemon = new DreamDaemonClient(apiClient, instanceId);
        this.chat = new ChatClient(apiClient, instanceId);
        this.config = new ConfigurationClient(apiClient, instanceId);
        this.users = new InstanceUserClient(apiClient, instanceId);
    }
}
