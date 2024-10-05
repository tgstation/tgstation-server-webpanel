interface IUserPasswordCredentials {
    username: string;
    password: string;
}

interface IOAuthCredentials {
    oAuthCode: string;
}

type ICredentials = IUserPasswordCredentials | IOAuthCredentials;

export default interface ISession {
    bearer: string;
    originalCredentials: ICredentials;
}
