import { call, put, takeLatest } from "redux-saga/effects";

import {
  apiAcceptSanghaInvitation,
  apiAddSanghaRecentSearch,
  apiBlockSanghaDevotee,
  apiClearSanghaRecentSearches,
  apiDeclineSanghaInvitation,
  apiDisconnectSanghaDevotee,
  apiFetchSanghaDevotees,
  apiFetchSanghaDevoteeProfile,
  apiFetchSanghaGroupDetail,
  apiFetchSanghaGroupEvents,
  apiFetchSanghaGroupMembers,
  apiFetchSanghaGroupPosts,
  apiFetchSanghaGroups,
  apiFetchSanghaGroupsHome,
  apiFetchSanghaHome,
  apiFetchSanghaInvitations,
  apiFetchSanghaRecentSearches,
  apiRequestSanghaConnection,
  apiSearchSanghaGroups,
  apiUpdateSanghaDiscovery,
} from "@/services/sangha";
import {
  acceptSanghaInvitationFailure,
  acceptSanghaInvitationSuccess,
  addSanghaRecentSearchFailure,
  addSanghaRecentSearchSuccess,
  blockSanghaDevoteeFailure,
  blockSanghaDevoteeSuccess,
  clearSanghaRecentSearchesFailure,
  clearSanghaRecentSearchesSuccess,
  declineSanghaInvitationFailure,
  declineSanghaInvitationSuccess,
  disconnectSanghaDevoteeFailure,
  disconnectSanghaDevoteeSuccess,
  fetchSanghaDevoteesFailure,
  fetchSanghaDevoteesSuccess,
  fetchSanghaGroupsFailure,
  fetchSanghaGroupsHomeFailure,
  fetchSanghaGroupsHomeSuccess,
  fetchSanghaGroupsSuccess,
  fetchSanghaGroupDetailFailure,
  fetchSanghaGroupDetailSuccess,
  fetchSanghaGroupEventsFailure,
  fetchSanghaGroupEventsSuccess,
  fetchSanghaGroupMembersFailure,
  fetchSanghaGroupMembersSuccess,
  fetchSanghaGroupPostsFailure,
  fetchSanghaGroupPostsSuccess,
  fetchSanghaHomeFailure,
  fetchSanghaHomeSuccess,
  fetchSanghaInvitationsFailure,
  fetchSanghaInvitationsSuccess,
  fetchSanghaProfileFailure,
  fetchSanghaProfileSuccess,
  fetchSanghaRecentSearchesFailure,
  fetchSanghaRecentSearchesSuccess,
  requestSanghaConnectionFailure,
  requestSanghaConnectionSuccess,
  searchSanghaGroupsFailure,
  searchSanghaGroupsSuccess,
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

function normalizeGroupList(response: any, append = false) {
  return {
    append,
    groups:
      response?.groups ||
      response?.results ||
      response?.data?.groups ||
      response?.data?.results ||
      [],
    pagination:
      response?.pagination ||
      response?.data?.pagination ||
      null,
  };
}

function normalizeRecentSearches(response: any) {
  return (
    response?.searches ||
    response?.recentSearches ||
    response?.data?.searches ||
    response?.data?.recentSearches ||
    []
  );
}

function normalizeInvitations(response: any, append = false) {
  return {
    append,
    invitations:
      response?.invitations ||
      response?.results ||
      response?.data?.invitations ||
      response?.data?.results ||
      [],
    pagination:
      response?.pagination ||
      response?.data?.pagination ||
      null,
  };
}

function normalizeGroupDetail(response: any) {
  return (
    response?.group ||
    response?.data?.group ||
    response?.detail ||
    response?.data?.detail ||
    response
  );
}

function normalizePosts(response: any, append = false) {
  return {
    append,
    pagination:
      response?.pagination ||
      response?.data?.pagination ||
      null,
    posts:
      response?.posts ||
      response?.results ||
      response?.data?.posts ||
      response?.data?.results ||
      [],
  };
}

function normalizeMembers(response: any, append = false) {
  return {
    append,
    members:
      response?.members ||
      response?.results ||
      response?.data?.members ||
      response?.data?.results ||
      [],
    pagination:
      response?.pagination ||
      response?.data?.pagination ||
      null,
  };
}

function normalizeEvents(response: any, append = false) {
  return {
    append,
    events:
      response?.events ||
      response?.results ||
      response?.data?.events ||
      response?.data?.results ||
      [],
    pagination:
      response?.pagination ||
      response?.data?.pagination ||
      null,
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

function* handleSearchSanghaGroups(
  action: any
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiSearchSanghaGroups,
      action.payload
    );

    yield put(
      searchSanghaGroupsSuccess(
        normalizeGroupList(
          response,
          Boolean(action.payload?.offset)
        )
      )
    );
  } catch (error) {
    yield put(
      searchSanghaGroupsFailure(
        getErrorMessage(error, "Failed to search Sangha groups.")
      )
    );
  }
}

function* handleFetchSanghaGroups(
  action: any
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiFetchSanghaGroups,
      action.payload
    );

    yield put(
      fetchSanghaGroupsSuccess(
        normalizeGroupList(
          response,
          Boolean(action.payload?.offset)
        )
      )
    );
  } catch (error) {
    yield put(
      fetchSanghaGroupsFailure(
        getErrorMessage(error, "Failed to fetch Sangha groups.")
      )
    );
  }
}

function* handleFetchGroupDetail(
  action: any
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiFetchSanghaGroupDetail,
      action.payload.id
    );

    yield put(
      fetchSanghaGroupDetailSuccess(
        normalizeGroupDetail(response)
      )
    );
  } catch (error) {
    yield put(
      fetchSanghaGroupDetailFailure(
        getErrorMessage(error, "Failed to fetch group detail.")
      )
    );
  }
}

function* handleFetchGroupPosts(
  action: any
): Generator<any, void, any> {
  try {
    const { groupId, ...params } = action.payload;
    const response = yield call(
      apiFetchSanghaGroupPosts,
      groupId,
      params
    );

    yield put(
      fetchSanghaGroupPostsSuccess(
        normalizePosts(response, Boolean(params.offset))
      )
    );
  } catch (error) {
    yield put(
      fetchSanghaGroupPostsFailure(
        getErrorMessage(error, "Failed to fetch group posts.")
      )
    );
  }
}

function* handleFetchGroupMembers(
  action: any
): Generator<any, void, any> {
  try {
    const { groupId, ...params } = action.payload;
    const response = yield call(
      apiFetchSanghaGroupMembers,
      groupId,
      params
    );

    yield put(
      fetchSanghaGroupMembersSuccess(
        normalizeMembers(response, Boolean(params.offset))
      )
    );
  } catch (error) {
    yield put(
      fetchSanghaGroupMembersFailure(
        getErrorMessage(error, "Failed to fetch group members.")
      )
    );
  }
}

function* handleFetchGroupEvents(
  action: any
): Generator<any, void, any> {
  try {
    const { groupId, ...params } = action.payload;
    const response = yield call(
      apiFetchSanghaGroupEvents,
      groupId,
      params
    );

    yield put(
      fetchSanghaGroupEventsSuccess(
        normalizeEvents(response, Boolean(params.offset))
      )
    );
  } catch (error) {
    yield put(
      fetchSanghaGroupEventsFailure(
        getErrorMessage(error, "Failed to fetch group events.")
      )
    );
  }
}

function* handleFetchRecentSearches(
  action: any
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiFetchSanghaRecentSearches,
      action.payload
    );

    yield put(
      fetchSanghaRecentSearchesSuccess(
        normalizeRecentSearches(response)
      )
    );
  } catch (error) {
    yield put(
      fetchSanghaRecentSearchesFailure(
        getErrorMessage(error, "Failed to fetch recent searches.")
      )
    );
  }
}

function* handleAddRecentSearch(
  action: any
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiAddSanghaRecentSearch,
      action.payload
    );

    yield put(
      addSanghaRecentSearchSuccess(
        normalizeRecentSearches(response)
      )
    );
  } catch (error) {
    yield put(
      addSanghaRecentSearchFailure(
        getErrorMessage(error, "Failed to save recent search.")
      )
    );
  }
}

function* handleClearRecentSearches(): Generator<
  any,
  void,
  any
> {
  try {
    yield call(apiClearSanghaRecentSearches);
    yield put(clearSanghaRecentSearchesSuccess());
  } catch (error) {
    yield put(
      clearSanghaRecentSearchesFailure(
        getErrorMessage(error, "Failed to clear recent searches.")
      )
    );
  }
}

function* handleFetchInvitations(
  action: any
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiFetchSanghaInvitations,
      action.payload
    );

    yield put(
      fetchSanghaInvitationsSuccess(
        normalizeInvitations(
          response,
          Boolean(action.payload?.offset)
        )
      )
    );
  } catch (error) {
    yield put(
      fetchSanghaInvitationsFailure(
        getErrorMessage(error, "Failed to fetch invitations.")
      )
    );
  }
}

function* handleAcceptInvitation(
  action: any
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiAcceptSanghaInvitation,
      action.payload.id
    );

    yield put(
      acceptSanghaInvitationSuccess({
        id: action.payload.id,
        response,
      })
    );
  } catch (error) {
    yield put(
      acceptSanghaInvitationFailure({
        error: getErrorMessage(error, "Failed to accept invitation."),
        id: action.payload.id,
      })
    );
  }
}

function* handleDeclineInvitation(
  action: any
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiDeclineSanghaInvitation,
      action.payload.id
    );

    yield put(
      declineSanghaInvitationSuccess({
        id: action.payload.id,
        response,
      })
    );
  } catch (error) {
    yield put(
      declineSanghaInvitationFailure({
        error: getErrorMessage(error, "Failed to decline invitation."),
        id: action.payload.id,
      })
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
    SANGHA_ACTIONS.SEARCH_GROUPS_REQUEST,
    handleSearchSanghaGroups
  );
  yield takeLatest(
    SANGHA_ACTIONS.FETCH_GROUPS_REQUEST,
    handleFetchSanghaGroups
  );
  yield takeLatest(
    SANGHA_ACTIONS.FETCH_GROUP_DETAIL_REQUEST,
    handleFetchGroupDetail
  );
  yield takeLatest(
    SANGHA_ACTIONS.FETCH_GROUP_POSTS_REQUEST,
    handleFetchGroupPosts
  );
  yield takeLatest(
    SANGHA_ACTIONS.FETCH_GROUP_MEMBERS_REQUEST,
    handleFetchGroupMembers
  );
  yield takeLatest(
    SANGHA_ACTIONS.FETCH_GROUP_EVENTS_REQUEST,
    handleFetchGroupEvents
  );
  yield takeLatest(
    SANGHA_ACTIONS.FETCH_RECENT_SEARCHES_REQUEST,
    handleFetchRecentSearches
  );
  yield takeLatest(
    SANGHA_ACTIONS.ADD_RECENT_SEARCH_REQUEST,
    handleAddRecentSearch
  );
  yield takeLatest(
    SANGHA_ACTIONS.CLEAR_RECENT_SEARCHES_REQUEST,
    handleClearRecentSearches
  );
  yield takeLatest(
    SANGHA_ACTIONS.FETCH_INVITATIONS_REQUEST,
    handleFetchInvitations
  );
  yield takeLatest(
    SANGHA_ACTIONS.ACCEPT_INVITATION_REQUEST,
    handleAcceptInvitation
  );
  yield takeLatest(
    SANGHA_ACTIONS.DECLINE_INVITATION_REQUEST,
    handleDeclineInvitation
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
