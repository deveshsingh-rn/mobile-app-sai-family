import {
  SANGHA_ACTIONS,
  SanghaDevoteeListParams,
  SanghaDevoteeListResult,
  SanghaDiscoverySettingsPayload,
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
