import { Action } from "redux";
import CredentialsReducer from './CredentialsReducer';
import { CredentialsActionType, ICredentialsAction } from './ICredentialsAction';
import IRootState from "./IRootState";

const MainReducer = (state: IRootState, action: Action): IRootState => {
    switch(action.type){
        case CredentialsActionType:
            return CredentialsReducer(state, action as ICredentialsAction);
    }
    return state;
};

export default MainReducer;