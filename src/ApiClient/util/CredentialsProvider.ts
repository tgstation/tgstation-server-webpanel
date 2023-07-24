import { MODE } from "../../definitions/constants";
import type { TokenResponse } from "../generatedcode/generated";
import { CredentialsType, ICredentials, IPasswordCredentials } from "../models/ICredentials";

//Data structure meant to help against circular dependencies within the ApiClient
//Its rather dumb and only holds username, password and the token.
//Also contains a function to determine if theres a token here
export default new (class CredentialsProvider {
    //token
    public token?: TokenResponse;
    public defaulted?: boolean;

    //credentials
    public credentials?: ICredentials;
    public default: IPasswordCredentials = {
        type: CredentialsType.Password,
        userName: "admin",
        password: "ISolemlySwearToDeleteTheDataDirectory"
    };

    public isTokenValid() {
        return (
            this.token &&
            this.token
                .bearer /* &&
            (!this.token.expiresAt || new Date(this.token.expiresAt) > new Date(Date.now()))*/
        );
    }

    public constructor() {
        if (MODE === "DEV") {
            window.credentialProvider = this;
        }
    }
})();
