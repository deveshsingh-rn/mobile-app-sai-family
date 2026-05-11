import { combineReducers } from "redux";

import { devoteeAccountReducer } from "./devotee-account/reducer";
import { experiencesReducer } from "./experiences/reducer";

export const rootReducer = combineReducers({
  devoteeAccount: devoteeAccountReducer,
  experiences: experiencesReducer,
});
