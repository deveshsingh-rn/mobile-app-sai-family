import {
  DEVOTEE_ACCOUNT_ACTIONS,
  DevoteeAccount,
  DevoteeAccountForm,
  DevoteeAccountAction,
} from "./types";

export const loadSavedDevoteeAccountRequest = (): DevoteeAccountAction => ({
  type: DEVOTEE_ACCOUNT_ACTIONS.LOAD_SAVED_REQUEST,
});

export const loadSavedDevoteeAccountSuccess = (account: DevoteeAccount | null): DevoteeAccountAction => ({
  payload: account,
  type: DEVOTEE_ACCOUNT_ACTIONS.LOAD_SAVED_SUCCESS,
});

export const loadSavedDevoteeAccountFailure = (message: string): DevoteeAccountAction => ({
  payload: message,
  type: DEVOTEE_ACCOUNT_ACTIONS.LOAD_SAVED_FAILURE,
});

export const createDevoteeAccountRequest = (form: DevoteeAccountForm): DevoteeAccountAction => ({
  payload: form,
  type: DEVOTEE_ACCOUNT_ACTIONS.CREATE_REQUEST,
});

export const createDevoteeAccountSuccess = (account: DevoteeAccount): DevoteeAccountAction => ({
  payload: account,
  type: DEVOTEE_ACCOUNT_ACTIONS.CREATE_SUCCESS,
});

export const createDevoteeAccountFailure = (message: string): DevoteeAccountAction => ({
  payload: message,
  type: DEVOTEE_ACCOUNT_ACTIONS.CREATE_FAILURE,
});

export const clearDevoteeAccountError = (): DevoteeAccountAction => ({
  type: DEVOTEE_ACCOUNT_ACTIONS.CLEAR_ERROR,
});
