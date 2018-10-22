import ICredentials from './ICredentials';

interface IRootState {
    serverAddress: string;

    credentials?: ICredentials;
}

export default IRootState;
