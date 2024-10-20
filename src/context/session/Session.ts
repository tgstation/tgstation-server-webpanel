import { ICredentials } from "@/lib/Credentials";

export default interface ISession {
    bearer: string;
    userId: string;
    originalCredentials: ICredentials;
}
