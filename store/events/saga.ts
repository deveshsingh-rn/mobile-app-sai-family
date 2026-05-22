import { all, takeLatest } from "redux-saga/effects";

import { EVENTS_ACTIONS } from "./types";

function* eventsPlaceholderWorker() {
  // Pillar 2 API orchestration will be added in the next implementation step.
}

export function* eventsSaga() {
  yield all([
    takeLatest(
      EVENTS_ACTIONS.FETCH_FEED_REQUEST,
      eventsPlaceholderWorker
    ),
    takeLatest(
      EVENTS_ACTIONS.FETCH_DETAIL_REQUEST,
      eventsPlaceholderWorker
    ),
    takeLatest(
      EVENTS_ACTIONS.CREATE_REQUEST,
      eventsPlaceholderWorker
    ),
  ]);
}
