import {
  SANGHA_ACTIONS,
  SanghaAction,
  SanghaState,
} from "./types";

export const initialSanghaState: SanghaState = {
  actionPendingIds: {},
  devotees: [],
  devoteesLoading: false,
  devoteesPagination: null,
  discoverySaving: false,
  error: null,
  home: null,
  homeLoading: false,
  profile: null,
  profileLoading: false,
};

function removePending(
  current: Record<string, boolean>,
  id: string
) {
  const next = { ...current };
  delete next[id];
  return next;
}

function updateProfileConnection(
  state: SanghaState,
  id: string,
  connectionStatus: string,
  canConnect?: boolean
) {
  const profileId =
    state.profile?.userId || state.profile?.id;

  if (profileId !== id || !state.profile) {
    return state.profile;
  }

  return {
    ...state.profile,
    canConnect:
      typeof canConnect === "boolean"
        ? canConnect
        : state.profile.canConnect,
    connectionStatus,
  };
}

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

    case SANGHA_ACTIONS.FETCH_PROFILE_REQUEST:
      return {
        ...state,
        error: null,
        profileLoading: true,
      };

    case SANGHA_ACTIONS.FETCH_PROFILE_SUCCESS:
      return {
        ...state,
        error: null,
        profile: action.payload,
        profileLoading: false,
      };

    case SANGHA_ACTIONS.FETCH_PROFILE_FAILURE:
      return {
        ...state,
        error: action.payload,
        profileLoading: false,
      };

    case SANGHA_ACTIONS.REQUEST_CONNECTION_REQUEST:
    case SANGHA_ACTIONS.DISCONNECT_DEVOTEE_REQUEST:
    case SANGHA_ACTIONS.BLOCK_DEVOTEE_REQUEST:
      return {
        ...state,
        actionPendingIds: {
          ...state.actionPendingIds,
          [action.payload.id]: true,
        },
        error: null,
      };

    case SANGHA_ACTIONS.REQUEST_CONNECTION_SUCCESS:
      return {
        ...state,
        actionPendingIds: removePending(
          state.actionPendingIds,
          action.payload.id
        ),
        profile: updateProfileConnection(
          state,
          action.payload.id,
          "pending",
          false
        ),
      };

    case SANGHA_ACTIONS.DISCONNECT_DEVOTEE_SUCCESS:
      return {
        ...state,
        actionPendingIds: removePending(
          state.actionPendingIds,
          action.payload.id
        ),
        profile: updateProfileConnection(
          state,
          action.payload.id,
          "none",
          true
        ),
      };

    case SANGHA_ACTIONS.BLOCK_DEVOTEE_SUCCESS:
      return {
        ...state,
        actionPendingIds: removePending(
          state.actionPendingIds,
          action.payload.id
        ),
        profile: updateProfileConnection(
          state,
          action.payload.id,
          "blocked",
          false
        ),
      };

    case SANGHA_ACTIONS.REQUEST_CONNECTION_FAILURE:
    case SANGHA_ACTIONS.DISCONNECT_DEVOTEE_FAILURE:
    case SANGHA_ACTIONS.BLOCK_DEVOTEE_FAILURE:
      return {
        ...state,
        actionPendingIds: removePending(
          state.actionPendingIds,
          action.payload.id
        ),
        error: action.payload.error,
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
