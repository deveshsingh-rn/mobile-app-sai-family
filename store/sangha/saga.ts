import { call, put, takeLatest } from "redux-saga/effects";

import {
  apiFetchSanghaDevotees,
  apiFetchSanghaHome,
  apiUpdateSanghaDiscovery,
} from "@/services/sangha";
import {
  fetchSanghaDevoteesFailure,
  fetchSanghaDevoteesSuccess,
  fetchSanghaHomeFailure,
  fetchSanghaHomeSuccess,
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
    SANGHA_ACTIONS.UPDATE_DISCOVERY_REQUEST,
    handleUpdateSanghaDiscovery
  );
}
