export const DEVOTEE_ACCOUNT_ACTIONS = {
  LOAD_SAVED_REQUEST: "devoteeAccount/loadSavedRequest",
  LOAD_SAVED_SUCCESS: "devoteeAccount/loadSavedSuccess",
  LOAD_SAVED_FAILURE: "devoteeAccount/loadSavedFailure",
  CREATE_REQUEST: "devoteeAccount/createRequest",
  CREATE_SUCCESS: "devoteeAccount/createSuccess",
  CREATE_FAILURE: "devoteeAccount/createFailure",
  CLEAR_ERROR: "devoteeAccount/clearError",
} as const;

export type ProfileImageInput = {
  fileName?: string | null;
  mimeType?: string | null;
  uri: string;
};

export type DevoteeAccountForm = {
  name: string;
  email: string;
  mobileNumber: string;
  completeAddress: string;
  pincode: string;
  occupation: string;
  city: string;
  state: string;
  country: string;
  language: string;
  profileImage?: ProfileImageInput;
};

export type DevoteeAccount = DevoteeAccountForm & {
  id?: string;
  memberId: string;
  profileImageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type DevoteeAccountState = {
  account: DevoteeAccount | null;
  error: string | null;
  hasHydrated: boolean;
  isCreating: boolean;
  isLoadingSaved: boolean;
};

export type LoadSavedDevoteeAccountRequestAction = {
  type: typeof DEVOTEE_ACCOUNT_ACTIONS.LOAD_SAVED_REQUEST;
};

export type LoadSavedDevoteeAccountSuccessAction = {
  payload: DevoteeAccount | null;
  type: typeof DEVOTEE_ACCOUNT_ACTIONS.LOAD_SAVED_SUCCESS;
};

export type LoadSavedDevoteeAccountFailureAction = {
  payload: string;
  type: typeof DEVOTEE_ACCOUNT_ACTIONS.LOAD_SAVED_FAILURE;
};

export type CreateDevoteeAccountRequestAction = {
  payload: DevoteeAccountForm;
  type: typeof DEVOTEE_ACCOUNT_ACTIONS.CREATE_REQUEST;
};

export type CreateDevoteeAccountSuccessAction = {
  payload: DevoteeAccount;
  type: typeof DEVOTEE_ACCOUNT_ACTIONS.CREATE_SUCCESS;
};

export type CreateDevoteeAccountFailureAction = {
  payload: string;
  type: typeof DEVOTEE_ACCOUNT_ACTIONS.CREATE_FAILURE;
};

export type ClearDevoteeAccountErrorAction = {
  type: typeof DEVOTEE_ACCOUNT_ACTIONS.CLEAR_ERROR;
};

export type DevoteeAccountAction =
  | LoadSavedDevoteeAccountRequestAction
  | LoadSavedDevoteeAccountSuccessAction
  | LoadSavedDevoteeAccountFailureAction
  | CreateDevoteeAccountRequestAction
  | CreateDevoteeAccountSuccessAction
  | CreateDevoteeAccountFailureAction
  | ClearDevoteeAccountErrorAction;
