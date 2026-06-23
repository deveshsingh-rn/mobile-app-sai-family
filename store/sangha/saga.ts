import { call, put, takeLatest } from "redux-saga/effects";

import {
  apiBlockSanghaDevotee,
  apiDisconnectSanghaDevotee,
  apiFetchSanghaDevotees,
  apiFetchSanghaDevoteeProfile,
  apiFetchSanghaGroupsHome,
  apiFetchSanghaHome,
  apiRequestSanghaConnection,
  apiUpdateSanghaDiscovery,
} from "@/services/sangha";
import {
  blockSanghaDevoteeFailure,
  blockSanghaDevoteeSuccess,
  disconnectSanghaDevoteeFailure,
  disconnectSanghaDevoteeSuccess,
  fetchSanghaDevoteesFailure,
  fetchSanghaDevoteesSuccess,
  fetchSanghaHomeFailure,
  fetchSanghaHomeSuccess,
  fetchSanghaProfileFailure,
  fetchSanghaProfileSuccess,
  fetchSanghaGroupsHomeFailure,
  fetchSanghaGroupsHomeSuccess,
  requestSanghaConnectionFailure,
  requestSanghaConnectionSuccess,
  updateSanghaDiscoveryFailure,
  updateSanghaDiscoverySuccess,
} from "./actions";
import { SANGHA_ACTIONS } from "./types";

function getErrorMessage(error: any, fallback: string) {
  return (
    error?.response?.data?.error?.message ||
    error?.message ||
    fallback
  );
}

function normalizeSanghaHome(response: any) {
  return {
    filters:
      response?.filters ||
      response?.data?.filters ||
      undefined,
    nearMeEnabled:
      response?.nearMeEnabled ??
      response?.settings?.nearMeEnabled ??
      response?.data?.nearMeEnabled ??
      response?.data?.settings?.nearMeEnabled,
    nearYou:
      response?.nearYou ||
      response?.nearbyDevotees ||
      response?.devoteesNearYou ||
      response?.data?.nearYou ||
      response?.data?.nearbyDevotees ||
      [],
    stats:
      response?.stats || response?.data?.stats || undefined,
    suggestedForYou:
      response?.suggestedForYou ||
      response?.suggested ||
      response?.recommendedDevotees ||
      response?.data?.suggestedForYou ||
      response?.data?.recommendedDevotees ||
      [],
  };
}

function normalizeDevoteeList(response: any, append = false) {
  return {
    append,
    devotees:
      response?.devotees ||
      response?.results ||
      response?.data?.devotees ||
      response?.data?.results ||
      [],
    pagination:
      response?.pagination ||
      response?.data?.pagination ||
      null,
  };
}

function* handleFetchSanghaHome(
  action: any
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiFetchSanghaHome,
      action.payload
    );

    yield put(
      fetchSanghaHomeSuccess(normalizeSanghaHome(response))
    );
  } catch (error) {
    yield put(
      fetchSanghaHomeFailure(
        getErrorMessage(
          error,
          "Failed to fetch Sangha home."
        )
      )
    );
  }
}

function normalizeProfile(response: any) {
  return (
    response?.devotee ||
    response?.profile ||
    response?.data?.devotee ||
    response?.data?.profile ||
    response
  );
}

function normalizeGroupsHome(response: any) {
  return {
    invitations:
      response?.invitations ||
      response?.pendingInvitations ||
      response?.data?.invitations ||
      response?.data?.pendingInvitations ||
      [],
    myGroups:
      response?.myGroups ||
      response?.groups ||
      response?.data?.myGroups ||
      response?.data?.groups ||
      [],
    purposeTiles:
      response?.purposeTiles ||
      response?.purposes ||
      response?.data?.purposeTiles ||
      response?.data?.purposes ||
      [],
    recommendedGroups:
      response?.recommendedGroups ||
      response?.data?.recommendedGroups ||
      [],
    stats: response?.stats || response?.data?.stats || undefined,
  };
}

function* handleFetchSanghaDevotees(
  action: any
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiFetchSanghaDevotees,
      action.payload
    );

    yield put(
      fetchSanghaDevoteesSuccess(
        normalizeDevoteeList(
          response,
          Boolean(action.payload?.offset)
        )
      )
    );
  } catch (error) {
    yield put(
      fetchSanghaDevoteesFailure(
        getErrorMessage(
          error,
          "Failed to fetch Sangha devotees."
        )
      )
    );
  }
}

function* handleFetchSanghaProfile(
  action: any
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiFetchSanghaDevoteeProfile,
      action.payload.id
    );

    yield put(fetchSanghaProfileSuccess(normalizeProfile(response)));
  } catch (error) {
    yield put(
      fetchSanghaProfileFailure(
        getErrorMessage(
          error,
          "Failed to fetch devotee profile."
        )
      )
    );
  }
}

function* handleRequestConnection(
  action: any
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiRequestSanghaConnection,
      action.payload.id
    );

    yield put(
      requestSanghaConnectionSuccess({
        id: action.payload.id,
        response,
      })
    );
  } catch (error) {
    yield put(
      requestSanghaConnectionFailure({
        error: getErrorMessage(
          error,
          "Failed to request connection."
        ),
        id: action.payload.id,
      })
    );
  }
}

function* handleFetchSanghaGroupsHome(
  action: any
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiFetchSanghaGroupsHome,
      action.payload
    );

    yield put(
      fetchSanghaGroupsHomeSuccess(
        normalizeGroupsHome(response)
      )
    );
  } catch (error) {
    yield put(
      fetchSanghaGroupsHomeFailure(
        getErrorMessage(
          error,
          "Failed to fetch Sangha Hub."
        )
      )
    );
  }
}

function* handleDisconnectDevotee(
  action: any
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiDisconnectSanghaDevotee,
      action.payload.id
    );

    yield put(
      disconnectSanghaDevoteeSuccess({
        id: action.payload.id,
        response,
      })
    );
  } catch (error) {
    yield put(
      disconnectSanghaDevoteeFailure({
        error: getErrorMessage(
          error,
          "Failed to disconnect devotee."
        ),
        id: action.payload.id,
      })
    );
  }
}

function* handleBlockDevotee(
  action: any
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiBlockSanghaDevotee,
      action.payload.id,
      { reason: action.payload.reason }
    );

    yield put(
      blockSanghaDevoteeSuccess({
        id: action.payload.id,
        response,
      })
    );
  } catch (error) {
    yield put(
      blockSanghaDevoteeFailure({
        error: getErrorMessage(
          error,
          "Failed to block devotee."
        ),
        id: action.payload.id,
      })
    );
  }
}

function* handleUpdateSanghaDiscovery(
  action: any
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiUpdateSanghaDiscovery,
      action.payload
    );

    yield put(
      updateSanghaDiscoverySuccess({
        ...action.payload,
        response,
      })
    );
  } catch (error) {
    yield put(
      updateSanghaDiscoveryFailure(
        getErrorMessage(
          error,
          "Failed to update discovery settings."
        )
      )
    );
  }
}

export function* sanghaSaga() {
  yield takeLatest(
    SANGHA_ACTIONS.FETCH_HOME_REQUEST,
    handleFetchSanghaHome
  );
  yield takeLatest(
    SANGHA_ACTIONS.FETCH_DEVOTEES_REQUEST,
    handleFetchSanghaDevotees
  );
  yield takeLatest(
    SANGHA_ACTIONS.FETCH_PROFILE_REQUEST,
    handleFetchSanghaProfile
  );
  yield takeLatest(
    SANGHA_ACTIONS.FETCH_GROUPS_HOME_REQUEST,
    handleFetchSanghaGroupsHome
  );
  yield takeLatest(
    SANGHA_ACTIONS.REQUEST_CONNECTION_REQUEST,
    handleRequestConnection
  );
  yield takeLatest(
    SANGHA_ACTIONS.DISCONNECT_DEVOTEE_REQUEST,
    handleDisconnectDevotee
  );
  yield takeLatest(
    SANGHA_ACTIONS.BLOCK_DEVOTEE_REQUEST,
    handleBlockDevotee
  );
  yield takeLatest(
    SANGHA_ACTIONS.UPDATE_DISCOVERY_REQUEST,
    handleUpdateSanghaDiscovery
  );
}
