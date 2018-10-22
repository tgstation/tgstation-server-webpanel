import { Action } from "redux";

interface ISubAction extends Action {
    action: string;
}

export default ISubAction;
