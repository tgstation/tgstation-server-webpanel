import { OAuthProvider } from "../generatedcode/_enums";

export enum Provider {
    Password,
    OAuth
}

export interface IPasswordCredentials {
    type: Provider.Password;
    userName: string;
    password: string;
}

export interface IOAuthCredentials {
    type: Provider.OAuth;
    provider: OAuthProvider;
    token: string;
}

export type ICredentials = IPasswordCredentials | IOAuthCredentials;
