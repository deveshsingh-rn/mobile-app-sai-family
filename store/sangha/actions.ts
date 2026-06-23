import {
  SANGHA_ACTIONS,
  SanghaDevoteeListParams,
  SanghaDevoteeListResult,
  SanghaDevoteeProfile,
  SanghaDiscoverySettingsPayload,
  SanghaHubHomeResult,
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
