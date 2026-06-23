import {
  SANGHA_ACTIONS,
  SanghaAction,
  SanghaState,
} from "./types";

export const initialSanghaState: SanghaState = {
  devotees: [],
  devoteesLoading: false,
  devoteesPagination: null,
  discoverySaving: false,
  error: null,
  home: null,
  homeLoading: false,
};

export function sanghaReducer(
  state: SanghaState = initialSanghaState,
  action: SanghaAction
): SanghaState {
  switch (action.type) {
    case SANGHA_ACTIONS.FETCH_HOME_REQUEST:
      return {
        ...state,
        error: null,
        homeLoading: true,
      };

    case SANGHA_ACTIONS.FETCH_HOME_SUCCESS:
      return {
        ...state,
        error: null,
        home: action.payload,
        homeLoading: false,
      };

    case SANGHA_ACTIONS.FETCH_HOME_FAILURE:
      return {
        ...state,
        error: action.payload,
        homeLoading: false,
      };

    case SANGHA_ACTIONS.FETCH_DEVOTEES_REQUEST:
      return {
        ...state,
        devoteesLoading: true,
        error: null,
      };

    case SANGHA_ACTIONS.FETCH_DEVOTEES_SUCCESS:
      return {
        ...state,
        devotees: action.payload.append
          ? [
              ...state.devotees,
              ...action.payload.devotees,
            ]
          : action.payload.devotees,
        devoteesLoading: false,
        devoteesPagination: action.payload.pagination,
        error: null,
      };

    case SANGHA_ACTIONS.FETCH_DEVOTEES_FAILURE:
      return {
        ...state,
        devoteesLoading: false,
        error: action.payload,
      };

    case SANGHA_ACTIONS.UPDATE_DISCOVERY_REQUEST:
      return {
        ...state,
        discoverySaving: true,
        error: null,
        home: state.home
          ? {
              ...state.home,
              nearMeEnabled:
                action.payload.nearMeEnabled ??
                state.home.nearMeEnabled,
            }
          : state.home,
      };

    case SANGHA_ACTIONS.UPDATE_DISCOVERY_SUCCESS:
      return {
        ...state,
        discoverySaving: false,
        error: null,
        home: state.home
          ? {
              ...state.home,
              nearMeEnabled:
                action.payload.nearMeEnabled ??
                state.home.nearMeEnabled,
            }
          : state.home,
      };

    case SANGHA_ACTIONS.UPDATE_DISCOVERY_FAILURE:
      return {
        ...state,
        discoverySaving: false,
        error: action.payload,
      };

    default:
      return state;
  }
}
