import { MODE } from "../../definitions/constants";
import { TokenResponse } from "../generatedcode/schemas";
import { ICredentials } from "../models/ICredentials";

//Data structure meant to help against circular dependencies within the ApiClient
//Its rather dumb and only holds username, password and the token.
//Also contains a function to determine if theres a token here
export default new (class CredentialsProvider {
    //token
    public token?: TokenResponse;

    //credentials
    public credentials?: ICredentials;

    public isTokenValid() {
        return (
            this.credentials && this.token && this.token.bearer /* &&
            (!this.token.expiresAt || new Date(this.token.expiresAt) > new Date(Date.now()))*/
        );
    }

    public constructor() {
        if (MODE === "DEV") {
            window.credentialProvider = this;
        }
    }
})();
