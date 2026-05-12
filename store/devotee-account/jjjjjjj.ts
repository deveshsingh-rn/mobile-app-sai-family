import { call, put, takeLatest } from 'redux-saga/effects';
import { clearSavedDevoteeAccount, updateDevoteeSettings } from '@/services/devotee-account';
import {
  LOGOUT_REQUEST,
  logoutSuccess,
  UPDATE_SETTINGS_REQUEST,
  updateSettingsSuccess,
  updateSettingsFailure
} from './actions';

function* handleLogout() {
  try {
    yield call(clearSavedDevoteeAccount);
    yield put(logoutSuccess());
  } catch (error) {
    console.error('Logout error:', error);
  }
}

function* handleUpdateSettings(action: any): Generator<any, void, any> {
  try {
    const { accountId, settings } = action.payload;
    const updatedAccount = yield call(updateDevoteeSettings, accountId, settings);
    yield put(updateSettingsSuccess(updatedAccount));
  } catch (error: any) {
    yield put(updateSettingsFailure(error.message));
  }
}

export function* devoteeAccountSaga() {
  yield takeLatest(LOGOUT_REQUEST, handleLogout);
  yield takeLatest(UPDATE_SETTINGS_REQUEST, handleUpdateSettings);
}