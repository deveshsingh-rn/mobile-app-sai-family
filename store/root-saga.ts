import { all, fork } from "redux-saga/effects";

import { devoteeAccountSaga } from "@/store/devotee-account";
import { experiencesSaga } from "./experiences/saga";

export function* rootSaga() {
  yield all([
    fork(devoteeAccountSaga),
    fork(experiencesSaga),
  ]);
}