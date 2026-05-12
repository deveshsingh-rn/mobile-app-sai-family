import { all } from 'redux-saga/effects';
import { devoteeAccountSaga } from './devotee-account/sagas';

// Root saga that combines all sagas
export default function* rootSaga() {
  yield all([
    devoteeAccountSaga(),
  ]);
}