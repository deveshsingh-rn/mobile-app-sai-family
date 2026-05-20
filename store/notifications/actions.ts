import {
  NOTIFICATIONS_ACTIONS,
  PushPlatform,
} from "./types";

export const registerPushTokenRequest = (
  userId?: string
) =>
  ({
    payload: {
      userId,
    },
    type: NOTIFICATIONS_ACTIONS.REGISTER_PUSH_TOKEN_REQUEST,
  } as const);

export const registerPushTokenSuccess = (
  token: string,
  platform: PushPlatform
) =>
  ({
    payload: {
      platform,
      token,
    },
    type: NOTIFICATIONS_ACTIONS.REGISTER_PUSH_TOKEN_SUCCESS,
  } as const);

export const registerPushTokenFailure = (
  error: string
) =>
  ({
    payload: error,
    type: NOTIFICATIONS_ACTIONS.REGISTER_PUSH_TOKEN_FAILURE,
  } as const);

export const resetNotifications = () =>
  ({
    type: NOTIFICATIONS_ACTIONS.RESET,
  } as const);
