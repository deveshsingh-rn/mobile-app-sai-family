import { combineReducers } from "redux";

import { devoteeAccountReducer } from "./devotee-account/reducer";
import { directoryReducer } from "./directory/reducer";
import { eventsReducer } from "./events/reducer";
import { experiencesReducer } from "./experiences/reducer";
import { notificationsReducer } from "./notifications/reducer";

export const rootReducer = combineReducers({
  devoteeAccount: devoteeAccountReducer,
  directory: directoryReducer,
  events: eventsReducer,
  experiences: experiencesReducer,
  notifications: notificationsReducer,
});
