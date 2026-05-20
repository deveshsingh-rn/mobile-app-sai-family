import { combineReducers } from "redux";

import { devoteeAccountReducer } from "./devotee-account/reducer";
import { experiencesReducer } from "./experiences/reducer";
import { notificationsReducer } from "./notifications/reducer";

export const rootReducer = combineReducers({
  devoteeAccount: devoteeAccountReducer,
  experiences: experiencesReducer,
  notifications: notificationsReducer,
});
