import { RootState } from "../types";

export const selectNotificationsState = (
  state: RootState
) => state.notifications;

export const selectPushToken = (
  state: RootState
) => selectNotificationsState(state).token;

export const selectPushNotificationError = (
  state: RootState
) => selectNotificationsState(state).error;

export const selectIsRegisteringPushToken = (
  state: RootState
) => selectNotificationsState(state).isRegistering;

export const selectLastRegisteredPushTokenAt = (
  state: RootState
) =>
  selectNotificationsState(state)
    .lastRegisteredAt;
