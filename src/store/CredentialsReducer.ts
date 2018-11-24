import Actions from './Actions';
import { ICredentialsAction } from './ICredentialsAction';
import IRootState from "./IRootState";

const CredentialsReducer = (state: IRootState, action: ICredentialsAction): IRootState => {
    switch(action.action){
        case Actions.CredentialsUpdate:
            state.credentials = action.credentials;
            state = {...state};
            break;
    }
    return state;
};

export default CredentialsReducer;