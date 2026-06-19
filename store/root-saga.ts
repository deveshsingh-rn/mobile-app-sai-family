import { all, fork } from "redux-saga/effects";

import { devoteeAccountSaga } from "@/store/devotee-account";
import { directorySaga } from "./directory/saga";
import { eventsSaga } from "./events/saga";
import { experiencesSaga } from "./experiences/saga";
import { notificationsSaga } from "./notifications/saga";

export function* rootSaga() {
  yield all([
    fork(devoteeAccountSaga),
    fork(directorySaga),
    fork(eventsSaga),
    fork(experiencesSaga),
    fork(notificationsSaga),
  ]);
}
