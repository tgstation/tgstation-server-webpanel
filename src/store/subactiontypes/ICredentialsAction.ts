import ICredentials from '../../models/ICredentials';
import ISubAction from '../ISubActionType';

interface ICredentialsAction extends ISubAction {
    credentials: ICredentials;
}

export default ICredentialsAction;
