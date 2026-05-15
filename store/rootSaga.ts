import { all } from 'redux-saga/effects';
import { devoteeAccountSaga } from './devotee-account/jjjjjjj';
import { experiencesSaga } from './experiences/saga';

// Root saga that combines all sagas
export default function* rootSaga() {
  yield all([
    devoteeAccountSaga(),
    experiencesSaga(),
  ]);
}