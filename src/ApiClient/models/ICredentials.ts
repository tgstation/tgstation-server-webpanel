import { OAuthProvider } from "../generatedcode/_enums";

export enum CredentialsType {
    Password,
    OAuth,
}

export interface IPasswordCredentials {
    type: CredentialsType.Password;
    userName: string;
    password: string;
}

export interface IOAuthCredentials {
    type: CredentialsType.OAuth;
    provider: OAuthProvider;
    token: string;
}

export type ICredentials = IPasswordCredentials | IOAuthCredentials;
