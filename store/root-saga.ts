import { all, fork } from "redux-saga/effects";

import { devoteeAccountSaga } from "./devotee-account/saga";

export function* rootSaga() {
  yield all([fork(devoteeAccountSaga)]);
}
