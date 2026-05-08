import { combineReducers } from "redux";

import { devoteeAccountReducer } from "./devotee-account/reducer";

export const rootReducer = combineReducers({
  devoteeAccount: devoteeAccountReducer,
});
