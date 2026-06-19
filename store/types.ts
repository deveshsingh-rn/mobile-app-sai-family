import { Dispatch } from "redux";

import { DevoteeAccountAction } from "./devotee-account/types";
import { DirectoryAction } from "./directory/types";
import { EventsAction } from "./events/types";
import { ExperiencesActionTypes } from "./experiences/types";
import { NotificationsAction } from "./notifications/types";
import { rootReducer } from "./root-reducer";

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = Dispatch<
  | DevoteeAccountAction
  | DirectoryAction
  | EventsAction
  | ExperiencesActionTypes
  | NotificationsAction
>;
