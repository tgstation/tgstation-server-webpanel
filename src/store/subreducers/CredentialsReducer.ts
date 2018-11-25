import Actions from '../Actions';
import IRootState from "../IRootState";
import ICredentialsAction from '../subactiontypes/ICredentialsAction';

const CredentialsReducer = (state: IRootState, action: ICredentialsAction): IRootState => {
    switch (action.action) {
        case Actions.CredentialsUpdate:
            state.credentials = action.credentials;
            state = { ...state };
            break;
    }
    return state;
};

export default CredentialsReducer;
