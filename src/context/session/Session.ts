import { ICredentials } from "@/lib/Credentials";

export default interface ISession {
    bearer: string;
    userID: string;
    originalCredentials: ICredentials;
}
