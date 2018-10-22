import ICredentials from './ICredentials';
import ISubAction from './ISubActionType';

const CredentialsActionType = "CREDENTIALS_ACTION";

interface ICredentialsAction extends ISubAction {
    credentials: ICredentials;
}

export {
     ICredentialsAction,
     CredentialsActionType
};
