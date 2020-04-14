import IRepositoryClient from './IRepositoryClient';
import IByondClient from './IByondClient';
import IDreamMakerClient from './IDreamMakerClient';
import IDreamDaemonClient from './IDreamDaemonClient';
import IChatClient from './IChatClient';
import IConfigurationClient from './IConfigurationClient';
import IInstanceUserClient from './IInstanceUserClient';

export default interface IInstanceClient {
    readonly repo: IRepositoryClient;
    readonly byond: IByondClient;
    readonly dreamMaker: IDreamMakerClient;
    readonly dreamDaemon: IDreamDaemonClient;
    readonly chat: IChatClient;
    readonly config: IConfigurationClient;
    readonly users: IInstanceUserClient;
}
