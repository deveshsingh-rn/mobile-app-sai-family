import {
  SANGHA_ACTIONS,
  SanghaDevoteeListParams,
  SanghaDevoteeListResult,
  SanghaDevoteeProfile,
  SanghaDiscoverySettingsPayload,
  SanghaGroupListParams,
  SanghaGroupListResult,
  SanghaHubHomeResult,
  SanghaInvitation,
  SanghaPagination,
  SanghaRecentSearch,
  SanghaHomeParams,
  SanghaHomeResult,
} from "./types";

export const fetchSanghaHomeRequest = (
  payload: SanghaHomeParams = {}
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.FETCH_HOME_REQUEST,
  } as const);

export const fetchSanghaHomeSuccess = (
  payload: SanghaHomeResult
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.FETCH_HOME_SUCCESS,
  } as const);

export const fetchSanghaHomeFailure = (
  payload: string
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.FETCH_HOME_FAILURE,
  } as const);

export const fetchSanghaDevoteesRequest = (
  payload: SanghaDevoteeListParams = {}
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.FETCH_DEVOTEES_REQUEST,
  } as const);

export const fetchSanghaDevoteesSuccess = (
  payload: SanghaDevoteeListResult & {
    append?: boolean;
  }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.FETCH_DEVOTEES_SUCCESS,
  } as const);

export const fetchSanghaDevoteesFailure = (
  payload: string
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.FETCH_DEVOTEES_FAILURE,
  } as const);

export const fetchSanghaProfileRequest = (id: string) =>
  ({
    payload: { id },
    type: SANGHA_ACTIONS.FETCH_PROFILE_REQUEST,
  } as const);

export const fetchSanghaProfileSuccess = (
  payload: SanghaDevoteeProfile
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.FETCH_PROFILE_SUCCESS,
  } as const);

export const fetchSanghaProfileFailure = (
  payload: string
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.FETCH_PROFILE_FAILURE,
  } as const);

export const fetchSanghaGroupsHomeRequest = (
  payload: {
    limit?: number;
    privacy?: string;
    purpose?: string;
  } = {}
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.FETCH_GROUPS_HOME_REQUEST,
  } as const);

export const fetchSanghaGroupsHomeSuccess = (
  payload: SanghaHubHomeResult
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.FETCH_GROUPS_HOME_SUCCESS,
  } as const);

export const fetchSanghaGroupsHomeFailure = (
  payload: string
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.FETCH_GROUPS_HOME_FAILURE,
  } as const);

export const searchSanghaGroupsRequest = (
  payload: SanghaGroupListParams
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.SEARCH_GROUPS_REQUEST,
  } as const);

export const searchSanghaGroupsSuccess = (
  payload: SanghaGroupListResult & { append?: boolean }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.SEARCH_GROUPS_SUCCESS,
  } as const);

export const searchSanghaGroupsFailure = (
  payload: string
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.SEARCH_GROUPS_FAILURE,
  } as const);

export const fetchSanghaGroupsRequest = (
  payload: SanghaGroupListParams = {}
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.FETCH_GROUPS_REQUEST,
  } as const);

export const fetchSanghaGroupsSuccess = (
  payload: SanghaGroupListResult & { append?: boolean }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.FETCH_GROUPS_SUCCESS,
  } as const);

export const fetchSanghaGroupsFailure = (
  payload: string
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.FETCH_GROUPS_FAILURE,
  } as const);

export const fetchSanghaRecentSearchesRequest = (
  payload: { limit?: number } = {}
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.FETCH_RECENT_SEARCHES_REQUEST,
  } as const);

export const fetchSanghaRecentSearchesSuccess = (
  payload: SanghaRecentSearch[]
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.FETCH_RECENT_SEARCHES_SUCCESS,
  } as const);

export const fetchSanghaRecentSearchesFailure = (
  payload: string
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.FETCH_RECENT_SEARCHES_FAILURE,
  } as const);

export const addSanghaRecentSearchRequest = (
  payload: { query: string }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.ADD_RECENT_SEARCH_REQUEST,
  } as const);

export const addSanghaRecentSearchSuccess = (
  payload: SanghaRecentSearch[]
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.ADD_RECENT_SEARCH_SUCCESS,
  } as const);

export const addSanghaRecentSearchFailure = (
  payload: string
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.ADD_RECENT_SEARCH_FAILURE,
  } as const);

export const clearSanghaRecentSearchesRequest = () =>
  ({
    type: SANGHA_ACTIONS.CLEAR_RECENT_SEARCHES_REQUEST,
  } as const);

export const clearSanghaRecentSearchesSuccess = () =>
  ({
    type: SANGHA_ACTIONS.CLEAR_RECENT_SEARCHES_SUCCESS,
  } as const);

export const clearSanghaRecentSearchesFailure = (
  payload: string
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.CLEAR_RECENT_SEARCHES_FAILURE,
  } as const);

export const fetchSanghaInvitationsRequest = (
  payload: {
    limit?: number;
    offset?: number;
    status?: string;
  } = {}
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.FETCH_INVITATIONS_REQUEST,
  } as const);

export const fetchSanghaInvitationsSuccess = (
  payload: {
    append?: boolean;
    invitations: SanghaInvitation[];
    pagination: SanghaPagination | null;
  }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.FETCH_INVITATIONS_SUCCESS,
  } as const);

export const fetchSanghaInvitationsFailure = (
  payload: string
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.FETCH_INVITATIONS_FAILURE,
  } as const);

export const acceptSanghaInvitationRequest = (
  id: string
) =>
  ({
    payload: { id },
    type: SANGHA_ACTIONS.ACCEPT_INVITATION_REQUEST,
  } as const);

export const acceptSanghaInvitationSuccess = (
  payload: { id: string; response?: any }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.ACCEPT_INVITATION_SUCCESS,
  } as const);

export const acceptSanghaInvitationFailure = (
  payload: { error: string; id: string }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.ACCEPT_INVITATION_FAILURE,
  } as const);

export const declineSanghaInvitationRequest = (
  id: string
) =>
  ({
    payload: { id },
    type: SANGHA_ACTIONS.DECLINE_INVITATION_REQUEST,
  } as const);

export const declineSanghaInvitationSuccess = (
  payload: { id: string; response?: any }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.DECLINE_INVITATION_SUCCESS,
  } as const);

export const declineSanghaInvitationFailure = (
  payload: { error: string; id: string }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.DECLINE_INVITATION_FAILURE,
  } as const);

export const requestSanghaConnectionRequest = (
  id: string
) =>
  ({
    payload: { id },
    type: SANGHA_ACTIONS.REQUEST_CONNECTION_REQUEST,
  } as const);

export const requestSanghaConnectionSuccess = (
  payload: { id: string; response?: any }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.REQUEST_CONNECTION_SUCCESS,
  } as const);

export const requestSanghaConnectionFailure = (
  payload: { error: string; id: string }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.REQUEST_CONNECTION_FAILURE,
  } as const);

export const disconnectSanghaDevoteeRequest = (
  id: string
) =>
  ({
    payload: { id },
    type: SANGHA_ACTIONS.DISCONNECT_DEVOTEE_REQUEST,
  } as const);

export const disconnectSanghaDevoteeSuccess = (
  payload: { id: string; response?: any }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.DISCONNECT_DEVOTEE_SUCCESS,
  } as const);

export const disconnectSanghaDevoteeFailure = (
  payload: { error: string; id: string }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.DISCONNECT_DEVOTEE_FAILURE,
  } as const);

export const blockSanghaDevoteeRequest = (
  payload: { id: string; reason?: string }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.BLOCK_DEVOTEE_REQUEST,
  } as const);

export const blockSanghaDevoteeSuccess = (
  payload: { id: string; response?: any }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.BLOCK_DEVOTEE_SUCCESS,
  } as const);

export const blockSanghaDevoteeFailure = (
  payload: { error: string; id: string }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.BLOCK_DEVOTEE_FAILURE,
  } as const);

export const updateSanghaDiscoveryRequest = (
  payload: SanghaDiscoverySettingsPayload
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.UPDATE_DISCOVERY_REQUEST,
  } as const);

export const updateSanghaDiscoverySuccess = (
  payload: SanghaDiscoverySettingsPayload & {
    response?: any;
  }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.UPDATE_DISCOVERY_SUCCESS,
  } as const);

export const updateSanghaDiscoveryFailure = (
  payload: string
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.UPDATE_DISCOVERY_FAILURE,
  } as const);
