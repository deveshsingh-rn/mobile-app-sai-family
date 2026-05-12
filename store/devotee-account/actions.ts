import { DevoteeAccount, DevoteeAccountForm } from './types';

export const LOGOUT_REQUEST = 'devotee-account/LOGOUT_REQUEST';
export const LOGOUT_SUCCESS = 'devotee-account/LOGOUT_SUCCESS';

export const UPDATE_SETTINGS_REQUEST = 'devotee-account/UPDATE_SETTINGS_REQUEST';
export const UPDATE_SETTINGS_SUCCESS = 'devotee-account/UPDATE_SETTINGS_SUCCESS';
export const UPDATE_SETTINGS_FAILURE = 'devotee-account/UPDATE_SETTINGS_FAILURE';

export const logoutRequest = () => ({ type: LOGOUT_REQUEST } as const);
export const logoutSuccess = () => ({ type: LOGOUT_SUCCESS } as const);

export const loadSavedDevoteeAccountRequest = () => ({ type: 'devoteeAccount/loadSavedRequest' } as const);
export const loadSavedDevoteeAccountSuccess = (account: DevoteeAccount | null) => ({
  type: 'devoteeAccount/loadSavedSuccess',
  payload: account,
} as const);
export const loadSavedDevoteeAccountFailure = (error: string) => ({
  type: 'devoteeAccount/loadSavedFailure',
  payload: error,
} as const);

export const createDevoteeAccountRequest = (payload: DevoteeAccountForm) => ({
  type: 'devoteeAccount/createRequest',
  payload,
} as const);
export const createDevoteeAccountSuccess = (account: DevoteeAccount) => ({
  type: 'devoteeAccount/createSuccess',
  payload: account,
} as const);
export const createDevoteeAccountFailure = (error: string) => ({
  type: 'devoteeAccount/createFailure',
  payload: error,
} as const);

export const clearDevoteeAccountError = () => ({ type: 'devoteeAccount/clearError' } as const);

export const updateSettingsRequest = (accountId: string, settings: Partial<DevoteeAccount>) => ({
  type: UPDATE_SETTINGS_REQUEST,
  payload: { accountId, settings },
} as const);

export const updateSettingsSuccess = (account: DevoteeAccount) => ({ type: UPDATE_SETTINGS_SUCCESS, payload: account } as const);
export const updateSettingsFailure = (error: string) => ({ type: UPDATE_SETTINGS_FAILURE, payload: error } as const);
