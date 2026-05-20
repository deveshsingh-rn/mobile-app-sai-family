import {
  NOTIFICATIONS_ACTIONS,
  NotificationsAction,
  NotificationsState,
} from "./types";

export const initialNotificationsState: NotificationsState = {
  error: null,
  isRegistering: false,
  lastRegisteredAt: null,
  platform: null,
  token: null,
};

export function notificationsReducer(
  state: NotificationsState = initialNotificationsState,
  action: NotificationsAction
): NotificationsState {
  switch (action.type) {
    case NOTIFICATIONS_ACTIONS.REGISTER_PUSH_TOKEN_REQUEST:
      return {
        ...state,
        error: null,
        isRegistering: true,
      };

    case NOTIFICATIONS_ACTIONS.REGISTER_PUSH_TOKEN_SUCCESS:
      return {
        ...state,
        error: null,
        isRegistering: false,
        lastRegisteredAt: new Date().toISOString(),
        platform: action.payload.platform,
        token: action.payload.token,
      };

    case NOTIFICATIONS_ACTIONS.REGISTER_PUSH_TOKEN_FAILURE:
      return {
        ...state,
        error: action.payload,
        isRegistering: false,
      };

    case NOTIFICATIONS_ACTIONS.RESET:
      return initialNotificationsState;

    default:
      return state;
  }
}
