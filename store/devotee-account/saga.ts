import { call, put, takeLatest } from "redux-saga/effects";

import {
  createDevoteeAccount,
  getSavedDevoteeAccount,
  saveDevoteeAccount,
  clearSavedDevoteeAccount,
  updateDevoteeSettings,
} from "@/services/devotee-account";

import {
  createDevoteeAccountFailure,
  createDevoteeAccountSuccess,
  loadSavedDevoteeAccountFailure,
  loadSavedDevoteeAccountSuccess,
  logoutSuccess,
  updateSettingsFailure,
  updateSettingsSuccess,
  LOGOUT_REQUEST,
  UPDATE_SETTINGS_REQUEST,
} from "./actions";

import {
  CreateDevoteeAccountRequestAction,
  DEVOTEE_ACCOUNT_ACTIONS,
  DevoteeAccount,
  UpdateSettingsRequestAction,
} from "./types";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

function* loadSavedDevoteeAccountWorker() {
  try {
    const account: DevoteeAccount | null = yield call(getSavedDevoteeAccount);

    yield put(loadSavedDevoteeAccountSuccess(account));
  } catch (error) {
    yield put(loadSavedDevoteeAccountFailure(getErrorMessage(error)));
  }
}

function* createDevoteeAccountWorker(
  action: CreateDevoteeAccountRequestAction
) {
  try {
    const account: DevoteeAccount = yield call(
      createDevoteeAccount,
      action.payload
    );

    yield call(saveDevoteeAccount, account);

    yield put(createDevoteeAccountSuccess(account));
  } catch (error) {
    yield put(createDevoteeAccountFailure(getErrorMessage(error)));
  }
}

function* handleLogout() {
  try {
    yield call(clearSavedDevoteeAccount);

    yield put(logoutSuccess());
  } catch (error) {
    console.error("Logout error:", error);
  }
}

function* handleUpdateSettings(
  action: UpdateSettingsRequestAction
) {
  try {
    const { accountId, settings } = action.payload;

    const updatedAccount: DevoteeAccount = yield call(
      updateDevoteeSettings,
      accountId,
      settings
    );

    // save latest account locally too
    yield call(saveDevoteeAccount, updatedAccount);

    yield put(updateSettingsSuccess(updatedAccount));
  } catch (error) {
    yield put(updateSettingsFailure(getErrorMessage(error)));
  }
}

export function* devoteeAccountSaga() {
  yield takeLatest(
    DEVOTEE_ACCOUNT_ACTIONS.LOAD_SAVED_REQUEST,
    loadSavedDevoteeAccountWorker
  );

  yield takeLatest(
    DEVOTEE_ACCOUNT_ACTIONS.CREATE_REQUEST,
    createDevoteeAccountWorker
  );

  yield takeLatest(
    LOGOUT_REQUEST,
    handleLogout
  );

  yield takeLatest(
    UPDATE_SETTINGS_REQUEST,
    handleUpdateSettings
  );
}