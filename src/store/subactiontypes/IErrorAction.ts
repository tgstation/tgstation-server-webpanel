import ISubAction from '../ISubActionType';

interface IErrorAction extends ISubAction {
    error: string;
}

export default IErrorAction;
