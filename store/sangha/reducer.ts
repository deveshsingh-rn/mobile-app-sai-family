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
  groupsHome: null,
  groupsHomeLoading: false,
  groupsList: [],
  groupsListLoading: false,
  groupsListPagination: null,
  home: null,
  homeLoading: false,
  profile: null,
  profileLoading: false,
  recentSearches: [],
  recentSearchesLoading: false,
  searchGroups: [],
  searchGroupsLoading: false,
  searchGroupsPagination: null,
  userInvitations: [],
  userInvitationsLoading: false,
  userInvitationsPagination: null,
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

function mergeById<T extends { id?: string }>(
  current: T[],
  incoming: T[]
) {
  const seen = new Set<string>();

  return [...current, ...incoming].filter((item) => {
    if (!item.id) {
      return true;
    }

    if (seen.has(item.id)) {
      return false;
    }

    seen.add(item.id);
    return true;
  });
}

function removeInvitation(
  list: SanghaState["userInvitations"],
  id: string
) {
  return list.filter((item) => item.id !== id);
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

    case SANGHA_ACTIONS.FETCH_GROUPS_HOME_REQUEST:
      return {
        ...state,
        error: null,
        groupsHomeLoading: true,
      };

    case SANGHA_ACTIONS.FETCH_GROUPS_HOME_SUCCESS:
      return {
        ...state,
        error: null,
        groupsHome: action.payload,
        groupsHomeLoading: false,
      };

    case SANGHA_ACTIONS.FETCH_GROUPS_HOME_FAILURE:
      return {
        ...state,
        error: action.payload,
        groupsHomeLoading: false,
      };

    case SANGHA_ACTIONS.SEARCH_GROUPS_REQUEST:
      return {
        ...state,
        error: null,
        searchGroupsLoading: true,
      };

    case SANGHA_ACTIONS.SEARCH_GROUPS_SUCCESS:
      return {
        ...state,
        error: null,
        searchGroups: action.payload.append
          ? mergeById(
              state.searchGroups,
              action.payload.groups
            )
          : action.payload.groups,
        searchGroupsLoading: false,
        searchGroupsPagination: action.payload.pagination,
      };

    case SANGHA_ACTIONS.SEARCH_GROUPS_FAILURE:
      return {
        ...state,
        error: action.payload,
        searchGroupsLoading: false,
      };

    case SANGHA_ACTIONS.FETCH_GROUPS_REQUEST:
      return {
        ...state,
        error: null,
        groupsListLoading: true,
      };

    case SANGHA_ACTIONS.FETCH_GROUPS_SUCCESS:
      return {
        ...state,
        error: null,
        groupsList: action.payload.append
          ? mergeById(
              state.groupsList,
              action.payload.groups
            )
          : action.payload.groups,
        groupsListLoading: false,
        groupsListPagination: action.payload.pagination,
      };

    case SANGHA_ACTIONS.FETCH_GROUPS_FAILURE:
      return {
        ...state,
        error: action.payload,
        groupsListLoading: false,
      };

    case SANGHA_ACTIONS.FETCH_RECENT_SEARCHES_REQUEST:
    case SANGHA_ACTIONS.ADD_RECENT_SEARCH_REQUEST:
    case SANGHA_ACTIONS.CLEAR_RECENT_SEARCHES_REQUEST:
      return {
        ...state,
        error: null,
        recentSearchesLoading: true,
      };

    case SANGHA_ACTIONS.FETCH_RECENT_SEARCHES_SUCCESS:
    case SANGHA_ACTIONS.ADD_RECENT_SEARCH_SUCCESS:
      return {
        ...state,
        error: null,
        recentSearches: action.payload,
        recentSearchesLoading: false,
      };

    case SANGHA_ACTIONS.CLEAR_RECENT_SEARCHES_SUCCESS:
      return {
        ...state,
        error: null,
        recentSearches: [],
        recentSearchesLoading: false,
      };

    case SANGHA_ACTIONS.FETCH_RECENT_SEARCHES_FAILURE:
    case SANGHA_ACTIONS.ADD_RECENT_SEARCH_FAILURE:
    case SANGHA_ACTIONS.CLEAR_RECENT_SEARCHES_FAILURE:
      return {
        ...state,
        error: action.payload,
        recentSearchesLoading: false,
      };

    case SANGHA_ACTIONS.FETCH_INVITATIONS_REQUEST:
      return {
        ...state,
        error: null,
        userInvitationsLoading: true,
      };

    case SANGHA_ACTIONS.FETCH_INVITATIONS_SUCCESS:
      return {
        ...state,
        error: null,
        userInvitations: action.payload.append
          ? mergeById(
              state.userInvitations,
              action.payload.invitations
            )
          : action.payload.invitations,
        userInvitationsLoading: false,
        userInvitationsPagination: action.payload.pagination,
      };

    case SANGHA_ACTIONS.FETCH_INVITATIONS_FAILURE:
      return {
        ...state,
        error: action.payload,
        userInvitationsLoading: false,
      };

    case SANGHA_ACTIONS.ACCEPT_INVITATION_REQUEST:
    case SANGHA_ACTIONS.DECLINE_INVITATION_REQUEST:
      return {
        ...state,
        actionPendingIds: {
          ...state.actionPendingIds,
          [action.payload.id]: true,
        },
        error: null,
      };

    case SANGHA_ACTIONS.ACCEPT_INVITATION_SUCCESS:
    case SANGHA_ACTIONS.DECLINE_INVITATION_SUCCESS:
      return {
        ...state,
        actionPendingIds: removePending(
          state.actionPendingIds,
          action.payload.id
        ),
        groupsHome: state.groupsHome
          ? {
              ...state.groupsHome,
              invitations: removeInvitation(
                state.groupsHome.invitations || [],
                action.payload.id
              ),
            }
          : state.groupsHome,
        userInvitations: removeInvitation(
          state.userInvitations,
          action.payload.id
        ),
      };

    case SANGHA_ACTIONS.ACCEPT_INVITATION_FAILURE:
    case SANGHA_ACTIONS.DECLINE_INVITATION_FAILURE:
      return {
        ...state,
        actionPendingIds: removePending(
          state.actionPendingIds,
          action.payload.id
        ),
        error: action.payload.error,
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
