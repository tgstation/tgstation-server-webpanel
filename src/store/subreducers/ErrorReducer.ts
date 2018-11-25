import Actions from '../Actions';
import IRootState from "../IRootState";
import IErrorAction from '../subactiontypes/IErrorAction';

const CredentialsReducer = (state: IRootState, action: IErrorAction): IRootState => {
    switch (action.action) {
        case Actions.LoginError:
            state.loginError = action.error;
            state = { ...state };
            break;
    }
    return state;
};

export default CredentialsReducer;
