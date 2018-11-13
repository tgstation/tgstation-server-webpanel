import ICredentials from './ICredentials';

interface IRootState {
    credentials: ICredentials;
    loggedIn: boolean;
    loginError?: string;
    refreshingToken: boolean;
}

export default IRootState;
