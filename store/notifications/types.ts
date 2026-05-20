import { PushPlatform } from "@/services/push-notifications";

export type { PushPlatform };

export const NOTIFICATIONS_ACTIONS = {
  REGISTER_PUSH_TOKEN_REQUEST:
    "notifications/registerPushTokenRequest",
  REGISTER_PUSH_TOKEN_SUCCESS:
    "notifications/registerPushTokenSuccess",
  REGISTER_PUSH_TOKEN_FAILURE:
    "notifications/registerPushTokenFailure",
  RESET: "notifications/reset",
} as const;

export type NotificationsState = {
  error: string | null;
  isRegistering: boolean;
  lastRegisteredAt: string | null;
  platform: PushPlatform | null;
  token: string | null;
};

export type RegisterPushTokenRequestAction = {
  payload: {
    userId?: string;
  };
  type: typeof NOTIFICATIONS_ACTIONS.REGISTER_PUSH_TOKEN_REQUEST;
};

export type RegisterPushTokenSuccessAction = {
  payload: {
    platform: PushPlatform;
    token: string;
  };
  type: typeof NOTIFICATIONS_ACTIONS.REGISTER_PUSH_TOKEN_SUCCESS;
};

export type RegisterPushTokenFailureAction = {
  payload: string;
  type: typeof NOTIFICATIONS_ACTIONS.REGISTER_PUSH_TOKEN_FAILURE;
};

export type ResetNotificationsAction = {
  type: typeof NOTIFICATIONS_ACTIONS.RESET;
};

export type NotificationsAction =
  | RegisterPushTokenRequestAction
  | RegisterPushTokenSuccessAction
  | RegisterPushTokenFailureAction
  | ResetNotificationsAction;
