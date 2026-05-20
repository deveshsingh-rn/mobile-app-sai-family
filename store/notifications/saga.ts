import { call, put, takeLatest } from "redux-saga/effects";

import {
  getExpoPushToken,
  getPushPlatform,
  registerExpoPushToken,
} from "@/services/push-notifications";

import {
  registerPushTokenFailure,
  registerPushTokenSuccess,
} from "./actions";

import {
  NOTIFICATIONS_ACTIONS,
  RegisterPushTokenRequestAction,
} from "./types";

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Unable to register push notifications.";
}

function* registerPushTokenWorker(
  action: RegisterPushTokenRequestAction
) {
  try {
    const token: string = yield call(getExpoPushToken);
    const platform = getPushPlatform();

    yield call(registerExpoPushToken, {
      platform,
      token,
      userId: action.payload.userId,
    });

    yield put(registerPushTokenSuccess(token, platform));
  } catch (error) {
    yield put(registerPushTokenFailure(getErrorMessage(error)));
  }
}

export function* notificationsSaga() {
  yield takeLatest(
    NOTIFICATIONS_ACTIONS.REGISTER_PUSH_TOKEN_REQUEST,
    registerPushTokenWorker
  );
}
