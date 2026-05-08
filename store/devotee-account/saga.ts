import { call, put, takeLatest } from "redux-saga/effects";

import {
  createDevoteeAccount,
  getSavedDevoteeAccount,
  saveDevoteeAccount,
} from "@/services/devotee-account";

import {
  createDevoteeAccountFailure,
  createDevoteeAccountSuccess,
  loadSavedDevoteeAccountFailure,
  loadSavedDevoteeAccountSuccess,
} from "./actions";
import {
  CreateDevoteeAccountRequestAction,
  DEVOTEE_ACCOUNT_ACTIONS,
  DevoteeAccount,
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

function* createDevoteeAccountWorker(action: CreateDevoteeAccountRequestAction) {
  try {
    const account: DevoteeAccount = yield call(createDevoteeAccount, action.payload);
    yield call(saveDevoteeAccount, account);
    yield put(createDevoteeAccountSuccess(account));
  } catch (error) {
    yield put(createDevoteeAccountFailure(getErrorMessage(error)));
  }
}

export function* devoteeAccountSaga() {
  yield takeLatest(DEVOTEE_ACCOUNT_ACTIONS.LOAD_SAVED_REQUEST, loadSavedDevoteeAccountWorker);
  yield takeLatest(DEVOTEE_ACCOUNT_ACTIONS.CREATE_REQUEST, createDevoteeAccountWorker);
}
