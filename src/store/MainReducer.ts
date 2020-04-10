import { Action } from "redux";

import Actions from "./Actions";
import ActionTypes from "./ActionTypes";
import IRootState from "./IRootState";

import ICredentialsAction from "./subactiontypes/ICredentialsAction";
import IErrorAction from "./subactiontypes/IErrorAction";
import CredentialsReducer from "./subreducers/CredentialsReducer";
import ErrorReducer from "./subreducers/ErrorReducer";

const MainReducer = (state: IRootState | undefined, action: Action): IRootState => {
  if (!state)
    throw new Error("State is undefined!");

  const ReducerTypeMap: {
    [id: string]: (state: IRootState, action: Action) => IRootState;
  } = {};
  ReducerTypeMap[ActionTypes.Credentials] = (s, a) => CredentialsReducer(s, a as ICredentialsAction);
  ReducerTypeMap[ActionTypes.Error] = (s, a) => ErrorReducer(s, a as IErrorAction);

  const mappedAction = ReducerTypeMap[action.type];
  if (mappedAction)
    return mappedAction(state, action);

  switch (action.type) {
    case Actions.BeginLogin:
      state = { ...state };
      state.loggedIn = false;
      state.refreshingToken = true;
      break;
    case Actions.LoginComplete:
      state = { ...state };
      state.loggedIn = true;
      state.refreshingToken = false;
      break;
  }
  return state;
};

export default MainReducer;
