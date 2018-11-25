import { Action } from "redux";

import Actions from './Actions';
import ActionTypes from './ActionTypes';
import IRootState from "./IRootState";

import CredentialsReducer from './subreducers/CredentialsReducer';

const MainReducer = (state: IRootState, action: Action): IRootState => {
    const ReducerTypeMap: { [id: string]: (state: IRootState, action: Action) => IRootState; } = {};
    ReducerTypeMap[ActionTypes.Credentials] = CredentialsReducer;

    const mappedAction = ReducerTypeMap[action.type];
    if (mappedAction)
        return mappedAction(state, action);

    switch (action.type) {
        case Actions.BeginLogin:
            state = { ...state };
            state.loggedIn = false;
            state.refreshingToken = true;
            break;
    }
    return state;
};

export default MainReducer;