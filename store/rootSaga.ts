import { all } from 'redux-saga/effects';
import { devoteeAccountSaga } from './devotee-account/jjjjjjj';

// Root saga that combines all sagas
export default function* rootSaga() {
  yield all([
    devoteeAccountSaga(),
  ]);
}