import { takeLatest } from 'redux-saga/effects';

import { EXPERIENCE_ACTIONS } from './types';

function* fetchExperienceFeedWorker() {
  // Feed API wiring will be added when Pillar 1 implementation starts.
}

export function* experiencesSaga() {
  yield takeLatest(EXPERIENCE_ACTIONS.FETCH_FEED_REQUEST, fetchExperienceFeedWorker);
}
