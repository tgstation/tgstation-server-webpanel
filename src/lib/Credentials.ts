export interface ICredentials {
    createAuthorizationHeader: () => string;
    defaultCredentials: boolean;
}

export class UserPasswordCredentials implements ICredentials {
    private readonly username: string;
    private readonly password: string;

    public readonly defaultCredentials: boolean;

    constructor(username: string, password: string, defaultCredentials: boolean = false) {
        this.username = username;
        this.password = password;
        this.defaultCredentials = defaultCredentials;
    }

    public createAuthorizationHeader(): string {
        return `Basic ${btoa(this.username + ":" + this.password)}`;
    }
}

export class DefaultUserPasswordCredentials extends UserPasswordCredentials {
    constructor() {
        super("Admin", "ISolemlySwearToDeleteTheDataDirectory", true);
    }
}

export class OAuthCredentials implements ICredentials {
    public readonly provider: string;
    public readonly defaultCredentials: boolean;
    private readonly oAuthCode: string;

    constructor(provider: string, oAuthCode: string) {
        this.provider = provider;
        this.oAuthCode = oAuthCode;
        this.defaultCredentials = false;
    }

    public createAuthorizationHeader(): string {
        return `OAuth ${this.oAuthCode}`;
    }
}

export class BearerCredentials implements ICredentials {
    private readonly bearer: string;
    public readonly defaultCredentials: boolean;

    constructor(bearer: string) {
        this.bearer = bearer;
        this.defaultCredentials = false;
    }

    public createAuthorizationHeader(): string {
        return `Bearer ${this.bearer}`;
    }
}
