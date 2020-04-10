import ICredentials from "../models/ICredentials";

import PageType from "./PageType";

interface IRootState {
    credentials: ICredentials;
    loggedIn: boolean;
    loginError?: string;
    refreshingToken: boolean;
    pageType: PageType;
}

export default IRootState;
