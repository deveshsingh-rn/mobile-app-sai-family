import { Dispatch } from "redux";

import { DevoteeAccountAction } from "./devotee-account/types";
import { rootReducer } from "./root-reducer";

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = Dispatch<DevoteeAccountAction>;
