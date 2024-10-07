export interface ICredentials {
    createAuthorizationHeader: () => string;
}

export class UserPasswordCredentials implements ICredentials {
    private readonly username: string;
    private readonly password: string;

    constructor(username: string, password: string) {
        this.username = username;
        this.password = password;
    }

    public createAuthorizationHeader(): string {
        return `Basic ${btoa(this.username + ":" + this.password)}`;
    }
}

export class OAuthCredentials implements ICredentials {
    public readonly provider: string;
    private readonly oAuthCode: string;

    constructor(provider: string, oAuthCode: string) {
        this.provider = provider;
        this.oAuthCode = oAuthCode;
    }

    public createAuthorizationHeader(): string {
        return `OAuth ${this.oAuthCode}`;
    }
}

export class BearerCredentials implements ICredentials {
    private readonly bearer: string;

    constructor(bearer: string) {
        this.bearer = bearer;
    }

    public createAuthorizationHeader(): string {
        return `Bearer ${this.bearer}`;
    }
}
