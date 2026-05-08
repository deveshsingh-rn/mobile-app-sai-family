import { DEVOTEE_ACCOUNT_ACTIONS, DevoteeAccountAction, DevoteeAccountState } from "./types";

export const initialDevoteeAccountState: DevoteeAccountState = {
  account: null,
  error: null,
  hasHydrated: false,
  isCreating: false,
  isLoadingSaved: false,
};

export function devoteeAccountReducer(
  state = initialDevoteeAccountState,
  action: DevoteeAccountAction
): DevoteeAccountState {
  switch (action.type) {
    case DEVOTEE_ACCOUNT_ACTIONS.LOAD_SAVED_REQUEST:
      return {
        ...state,
        error: null,
        isLoadingSaved: true,
      };

    case DEVOTEE_ACCOUNT_ACTIONS.LOAD_SAVED_SUCCESS:
      return {
        ...state,
        account: action.payload,
        error: null,
        hasHydrated: true,
        isLoadingSaved: false,
      };

    case DEVOTEE_ACCOUNT_ACTIONS.LOAD_SAVED_FAILURE:
      return {
        ...state,
        error: action.payload,
        hasHydrated: true,
        isLoadingSaved: false,
      };

    case DEVOTEE_ACCOUNT_ACTIONS.CREATE_REQUEST:
      return {
        ...state,
        error: null,
        isCreating: true,
      };

    case DEVOTEE_ACCOUNT_ACTIONS.CREATE_SUCCESS:
      return {
        ...state,
        account: action.payload,
        error: null,
        isCreating: false,
      };

    case DEVOTEE_ACCOUNT_ACTIONS.CREATE_FAILURE:
      return {
        ...state,
        error: action.payload,
        isCreating: false,
      };

    case DEVOTEE_ACCOUNT_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
}
