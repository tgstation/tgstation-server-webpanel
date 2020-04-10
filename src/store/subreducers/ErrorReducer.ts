import Actions from "../Actions";
import IRootState from "../IRootState";
import IErrorAction from "../subactiontypes/IErrorAction";

const ErrorReducer = (state: IRootState, action: IErrorAction): IRootState => {
    switch (action.action) {
        case Actions.LoginError:
            state.loginError = action.error;
            state.refreshingToken = false;
            state = { ...state };
            break;
    }
    return state;
};

export default ErrorReducer;
