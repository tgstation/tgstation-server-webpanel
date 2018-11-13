import { Action } from "redux";

import Actions from './Actions';
import CredentialsReducer from './CredentialsReducer';
import { CredentialsActionType, ICredentialsAction } from './ICredentialsAction';
import IRootState from "./IRootState";

const MainReducer = (state: IRootState, action: Action): IRootState => {
    switch(action.type){
        case CredentialsActionType:
            return CredentialsReducer(state, action as ICredentialsAction);
        case Actions.BeginLogin:
            state = {...state};
            state.loggedIn = false;
            state.refreshingToken = true;
            break;
    }
    return state;
};

export default MainReducer;