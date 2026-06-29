import { call, put, takeLatest } from "redux-saga/effects";

import {
  apiAcceptSanghaInvitation,
  apiAddSanghaRecentSearch,
  apiBlockSanghaDevotee,
  apiClearSanghaRecentSearches,
  apiCreateSanghaGroup,
  apiArchiveSanghaGroup,
  apiDeclineSanghaInvitation,
  apiDisconnectSanghaDevotee,
  apiFetchSanghaDevotees,
  apiFetchSanghaDevoteeProfile,
  apiFetchSanghaGroupDetail,
  apiFetchSanghaGroupEvents,
  apiFetchSanghaGroupFeed,
  apiFetchSanghaGroupJoinRequests,
  apiFetchSanghaGroupMembership,
  apiFetchSanghaGroupMembers,
  apiCreateSanghaGroupPost,
  apiCreateSanghaGroupPostComment,
  apiCreateSanghaGroupEvent,
  apiCancelSanghaGroupEventRsvp,
  apiDeleteSanghaGroupPost,
  apiFetchSanghaGroupPosts,
  apiFetchSanghaGroupPostComments,
  apiFetchSanghaGroups,
  apiFetchSanghaGroupsHome,
  apiFetchSanghaHome,
  apiFetchSanghaInvitations,
  apiFetchSanghaRecentSearches,
  apiJoinSanghaGroup,
  apiLeaveSanghaGroup,
  apiLikeSanghaGroupPost,
  apiFetchSanghaNotifications,
  apiMarkSanghaNotificationsRead,
  apiPinSanghaGroupPost,
  apiRequestSanghaConnection,
  apiRsvpSanghaGroupEvent,
  apiSearchSanghaGroups,
  apiUnlikeSanghaGroupPost,
  apiUnpinSanghaGroupPost,
  apiUpdateSanghaDiscovery,
  apiUpdateSanghaGroup,
  apiStartSanghaConversation,
  apiFetchSanghaConversationMessages,
  apiSendSanghaConversationMessage,
  apiMarkSanghaConversationRead,
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
  createSanghaGroupFailure,
  createSanghaGroupSuccess,
  archiveSanghaGroupFailure,
  archiveSanghaGroupSuccess,
  declineSanghaInvitationFailure,
  declineSanghaInvitationSuccess,
  createSanghaGroupPostCommentFailure,
  createSanghaGroupPostCommentSuccess,
  createSanghaGroupPostFailure,
  createSanghaGroupPostSuccess,
  cancelSanghaGroupEventRsvpFailure,
  cancelSanghaGroupEventRsvpSuccess,
  createSanghaGroupEventFailure,
  createSanghaGroupEventSuccess,
  deleteSanghaGroupPostFailure,
  deleteSanghaGroupPostSuccess,
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
  fetchSanghaGroupFeedFailure,
  fetchSanghaGroupFeedSuccess,
  fetchSanghaGroupJoinRequestsFailure,
  fetchSanghaGroupJoinRequestsSuccess,
  fetchSanghaGroupMembershipFailure,
  fetchSanghaGroupMembershipSuccess,
  fetchSanghaGroupMembersFailure,
  fetchSanghaGroupMembersSuccess,
  fetchSanghaGroupPostsFailure,
  fetchSanghaGroupPostsSuccess,
  fetchSanghaGroupPostCommentsFailure,
  fetchSanghaGroupPostCommentsSuccess,
  fetchSanghaHomeFailure,
  fetchSanghaHomeSuccess,
  fetchSanghaInvitationsFailure,
  fetchSanghaInvitationsSuccess,
  fetchSanghaNotificationsFailure,
  fetchSanghaNotificationsSuccess,
  fetchSanghaProfileFailure,
  fetchSanghaProfileSuccess,
  fetchSanghaRecentSearchesFailure,
  fetchSanghaRecentSearchesSuccess,
  joinSanghaGroupFailure,
  joinSanghaGroupSuccess,
  leaveSanghaGroupFailure,
  leaveSanghaGroupSuccess,
  likeSanghaGroupPostFailure,
  likeSanghaGroupPostSuccess,
  markSanghaNotificationsReadFailure,
  markSanghaNotificationsReadSuccess,
  pinSanghaGroupPostFailure,
  pinSanghaGroupPostSuccess,
  requestSanghaConnectionFailure,
  requestSanghaConnectionSuccess,
  rsvpSanghaGroupEventFailure,
  rsvpSanghaGroupEventSuccess,
  searchSanghaGroupsFailure,
  searchSanghaGroupsSuccess,
  unlikeSanghaGroupPostFailure,
  unlikeSanghaGroupPostSuccess,
  unpinSanghaGroupPostFailure,
  unpinSanghaGroupPostSuccess,
  updateSanghaDiscoveryFailure,
  updateSanghaDiscoverySuccess,
  updateSanghaGroupFailure,
  updateSanghaGroupSuccess,
  startSanghaConversationFailure,
  startSanghaConversationSuccess,
  fetchSanghaConversationMessagesFailure,
  fetchSanghaConversationMessagesSuccess,
  sendSanghaConversationMessageFailure,
  sendSanghaConversationMessageSuccess,
  markSanghaConversationReadFailure,
  markSanghaConversationReadSuccess,
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

function normalizeGroup(response: any) {
  return (
    response?.group ||
    response?.data?.group ||
    response
  );
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

function normalizeFeed(response: any, append = false) {
  return {
    append,
    feed:
      response?.feed ||
      response?.items ||
      response?.results ||
      response?.data?.feed ||
      response?.data?.items ||
      response?.data?.results ||
      [],
    pagination:
      response?.pagination ||
      response?.data?.pagination ||
      null,
  };
}

function normalizeMembership(response: any) {
  return (
    response?.membership ||
    response?.data?.membership ||
    response?.capabilities ||
    response?.data?.capabilities ||
    response
  );
}

function normalizeJoinRequests(response: any, append = false) {
  return {
    append,
    joinRequests:
      response?.joinRequests ||
      response?.requests ||
      response?.results ||
      response?.data?.joinRequests ||
      response?.data?.requests ||
      response?.data?.results ||
      [],
    pagination:
      response?.pagination ||
      response?.data?.pagination ||
      null,
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

function normalizePost(response: any) {
  return (
    response?.post ||
    response?.data?.post ||
    response?.groupPost ||
    response?.data?.groupPost ||
    response
  );
}

function normalizeComments(response: any, append = false) {
  return {
    append,
    comments:
      response?.comments ||
      response?.results ||
      response?.data?.comments ||
      response?.data?.results ||
      [],
  };
}

function normalizeComment(response: any) {
  return (
    response?.comment ||
    response?.data?.comment ||
    response?.groupComment ||
    response?.data?.groupComment ||
    response
  );
}

function normalizeEvent(response: any) {
  return (
    response?.event ||
    response?.data?.event ||
    response?.groupEvent ||
    response?.data?.groupEvent ||
    response
  );
}

function normalizeNotifications(response: any, append = false) {
  return {
    append,
    notifications:
      response?.notifications ||
      response?.results ||
      response?.data?.notifications ||
      response?.data?.results ||
      [],
    pagination:
      response?.pagination ||
      response?.data?.pagination ||
      null,
  };
}

function normalizeConversation(response: any) {
  return (
    response?.conversation ||
    response?.data?.conversation ||
    response
  );
}

function normalizeMessages(response: any, append = false) {
  return {
    append,
    messages:
      response?.messages ||
      response?.results ||
      response?.data?.messages ||
      response?.data?.results ||
      [],
    nextCursor:
      response?.nextCursor ||
      response?.data?.nextCursor ||
      null,
  };
}

function normalizeMessage(response: any) {
  return (
    response?.message ||
    response?.data?.message ||
    response
  );
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

function* handleCreateSanghaGroup(
  action: any
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiCreateSanghaGroup,
      action.payload
    );

    yield put(
      createSanghaGroupSuccess(normalizeGroup(response))
    );
  } catch (error) {
    yield put(
      createSanghaGroupFailure(
        getErrorMessage(error, "Failed to create Sangha group.")
      )
    );
  }
}

function* handleUpdateSanghaGroup(
  action: any
): Generator<any, void, any> {
  try {
    const { groupId, ...payload } = action.payload;
    const response = yield call(
      apiUpdateSanghaGroup,
      groupId,
      payload
    );

    yield put(
      updateSanghaGroupSuccess(normalizeGroup(response))
    );
  } catch (error) {
    yield put(
      updateSanghaGroupFailure(
        getErrorMessage(error, "Failed to update Sangha group.")
      )
    );
  }
}

function* handleArchiveSanghaGroup(
  action: any
): Generator<any, void, any> {
  try {
    yield call(apiArchiveSanghaGroup, action.payload.groupId);
    yield put(archiveSanghaGroupSuccess(action.payload.groupId));
  } catch (error) {
    yield put(
      archiveSanghaGroupFailure({
        error: getErrorMessage(error, "Failed to archive Sangha group."),
        groupId: action.payload.groupId,
      })
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

function* handleFetchGroupFeed(
  action: any
): Generator<any, void, any> {
  try {
    const { groupId, ...params } = action.payload;
    const response = yield call(
      apiFetchSanghaGroupFeed,
      groupId,
      params
    );

    yield put(
      fetchSanghaGroupFeedSuccess(
        normalizeFeed(response, Boolean(params.offset))
      )
    );
  } catch (error) {
    yield put(
      fetchSanghaGroupFeedFailure(
        getErrorMessage(error, "Failed to fetch group feed.")
      )
    );
  }
}

function* handleFetchGroupMembership(
  action: any
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiFetchSanghaGroupMembership,
      action.payload.groupId
    );

    yield put(
      fetchSanghaGroupMembershipSuccess(
        normalizeMembership(response)
      )
    );
  } catch (error) {
    yield put(
      fetchSanghaGroupMembershipFailure(
        getErrorMessage(error, "Failed to fetch group membership.")
      )
    );
  }
}

function* handleFetchGroupJoinRequests(
  action: any
): Generator<any, void, any> {
  try {
    const { groupId, ...params } = action.payload;
    const response = yield call(
      apiFetchSanghaGroupJoinRequests,
      groupId,
      params
    );

    yield put(
      fetchSanghaGroupJoinRequestsSuccess(
        normalizeJoinRequests(response, Boolean(params.offset))
      )
    );
  } catch (error) {
    yield put(
      fetchSanghaGroupJoinRequestsFailure(
        getErrorMessage(error, "Failed to fetch join requests.")
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

function* handleCreateGroupEvent(
  action: any
): Generator<any, void, any> {
  try {
    const { groupId, ...payload } = action.payload;
    const response = yield call(
      apiCreateSanghaGroupEvent,
      groupId,
      payload
    );

    yield put(
      createSanghaGroupEventSuccess({
        event: normalizeEvent(response),
        response,
      })
    );
  } catch (error) {
    yield put(
      createSanghaGroupEventFailure(
        getErrorMessage(error, "Failed to create group event.")
      )
    );
  }
}

function* handleRsvpGroupEvent(
  action: any
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiRsvpSanghaGroupEvent,
      action.payload.groupId,
      action.payload.eventId
    );

    yield put(
      rsvpSanghaGroupEventSuccess({
        eventId: action.payload.eventId,
        response,
      })
    );
  } catch (error) {
    yield put(
      rsvpSanghaGroupEventFailure({
        error: getErrorMessage(error, "Failed to RSVP."),
        eventId: action.payload.eventId,
      })
    );
  }
}

function* handleCancelGroupEventRsvp(
  action: any
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiCancelSanghaGroupEventRsvp,
      action.payload.groupId,
      action.payload.eventId
    );

    yield put(
      cancelSanghaGroupEventRsvpSuccess({
        eventId: action.payload.eventId,
        response,
      })
    );
  } catch (error) {
    yield put(
      cancelSanghaGroupEventRsvpFailure({
        error: getErrorMessage(error, "Failed to cancel RSVP."),
        eventId: action.payload.eventId,
      })
    );
  }
}

function* handleFetchNotifications(
  action: any
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiFetchSanghaNotifications,
      action.payload
    );

    yield put(
      fetchSanghaNotificationsSuccess(
        normalizeNotifications(
          response,
          Boolean(action.payload?.offset)
        )
      )
    );
  } catch (error) {
    yield put(
      fetchSanghaNotificationsFailure(
        getErrorMessage(error, "Failed to fetch Sangha notifications.")
      )
    );
  }
}

function* handleMarkNotificationsRead(
  action: any
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiMarkSanghaNotificationsRead,
      action.payload
    );

    yield put(
      markSanghaNotificationsReadSuccess({
        notificationIds: action.payload.notificationIds,
        response,
      })
    );
  } catch (error) {
    yield put(
      markSanghaNotificationsReadFailure(
        getErrorMessage(error, "Failed to mark notifications read.")
      )
    );
  }
}

function* handleJoinGroup(
  action: any
): Generator<any, void, any> {
  try {
    const response = yield call(apiJoinSanghaGroup, action.payload.groupId);
    yield put(joinSanghaGroupSuccess({ groupId: action.payload.groupId, response }));
  } catch (error) {
    yield put(
      joinSanghaGroupFailure({
        error: getErrorMessage(error, "Failed to join group."),
        groupId: action.payload.groupId,
      })
    );
  }
}

function* handleLeaveGroup(
  action: any
): Generator<any, void, any> {
  try {
    const response = yield call(apiLeaveSanghaGroup, action.payload.groupId);
    yield put(leaveSanghaGroupSuccess({ groupId: action.payload.groupId, response }));
  } catch (error) {
    yield put(
      leaveSanghaGroupFailure({
        error: getErrorMessage(error, "Failed to leave group."),
        groupId: action.payload.groupId,
      })
    );
  }
}

function* handleCreateGroupPost(
  action: any
): Generator<any, void, any> {
  try {
    const { groupId, ...payload } = action.payload;
    const response = yield call(apiCreateSanghaGroupPost, groupId, payload);
    yield put(createSanghaGroupPostSuccess({ post: normalizePost(response), response }));
  } catch (error) {
    yield put(createSanghaGroupPostFailure(getErrorMessage(error, "Failed to create post.")));
  }
}

function* handleLikeGroupPost(
  action: any
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiLikeSanghaGroupPost,
      action.payload.groupId,
      action.payload.postId
    );
    yield put(likeSanghaGroupPostSuccess({ postId: action.payload.postId, response }));
  } catch (error) {
    yield put(
      likeSanghaGroupPostFailure({
        error: getErrorMessage(error, "Failed to like post."),
        postId: action.payload.postId,
      })
    );
  }
}

function* handleUnlikeGroupPost(
  action: any
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiUnlikeSanghaGroupPost,
      action.payload.groupId,
      action.payload.postId
    );
    yield put(unlikeSanghaGroupPostSuccess({ postId: action.payload.postId, response }));
  } catch (error) {
    yield put(
      unlikeSanghaGroupPostFailure({
        error: getErrorMessage(error, "Failed to unlike post."),
        postId: action.payload.postId,
      })
    );
  }
}

function* handleFetchPostComments(
  action: any
): Generator<any, void, any> {
  try {
    const { groupId, postId, ...params } = action.payload;
    const response = yield call(
      apiFetchSanghaGroupPostComments,
      groupId,
      postId,
      params
    );
    yield put(
      fetchSanghaGroupPostCommentsSuccess({
        ...normalizeComments(response, Boolean(params.offset)),
        postId,
      })
    );
  } catch (error) {
    yield put(
      fetchSanghaGroupPostCommentsFailure({
        error: getErrorMessage(error, "Failed to fetch comments."),
        postId: action.payload.postId,
      })
    );
  }
}

function* handleCreatePostComment(
  action: any
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiCreateSanghaGroupPostComment,
      action.payload.groupId,
      action.payload.postId,
      { content: action.payload.content }
    );
    yield put(
      createSanghaGroupPostCommentSuccess({
        comment: normalizeComment(response),
        postId: action.payload.postId,
      })
    );
  } catch (error) {
    yield put(
      createSanghaGroupPostCommentFailure({
        error: getErrorMessage(error, "Failed to add comment."),
        postId: action.payload.postId,
      })
    );
  }
}

function* handlePinGroupPost(
  action: any
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiPinSanghaGroupPost,
      action.payload.groupId,
      action.payload.postId
    );
    yield put(pinSanghaGroupPostSuccess({ postId: action.payload.postId, response }));
  } catch (error) {
    yield put(pinSanghaGroupPostFailure({ error: getErrorMessage(error, "Failed to pin post."), postId: action.payload.postId }));
  }
}

function* handleUnpinGroupPost(
  action: any
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiUnpinSanghaGroupPost,
      action.payload.groupId,
      action.payload.postId
    );
    yield put(unpinSanghaGroupPostSuccess({ postId: action.payload.postId, response }));
  } catch (error) {
    yield put(unpinSanghaGroupPostFailure({ error: getErrorMessage(error, "Failed to unpin post."), postId: action.payload.postId }));
  }
}

function* handleDeleteGroupPost(
  action: any
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiDeleteSanghaGroupPost,
      action.payload.groupId,
      action.payload.postId
    );
    yield put(deleteSanghaGroupPostSuccess({ postId: action.payload.postId, response }));
  } catch (error) {
    yield put(deleteSanghaGroupPostFailure({ error: getErrorMessage(error, "Failed to delete post."), postId: action.payload.postId }));
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

function* handleStartConversation(
  action: any
): Generator<any, void, any> {
  try {
    const response = yield call(apiStartSanghaConversation, {
      groupId: action.payload.groupId,
      participantUserId: action.payload.participantUserId,
      type: "direct",
    });
    const conversation = normalizeConversation(response);

    yield put(
      startSanghaConversationSuccess({
        ...conversation,
        participantUserId:
          conversation?.participantUserId ||
          action.payload.participantUserId,
      })
    );
  } catch (error) {
    yield put(
      startSanghaConversationFailure({
        error: getErrorMessage(error, "Failed to start chat."),
        participantUserId: action.payload.participantUserId,
      })
    );
  }
}

function* handleFetchConversationMessages(
  action: any
): Generator<any, void, any> {
  try {
    const { conversationId, ...params } = action.payload;
    const response = yield call(
      apiFetchSanghaConversationMessages,
      conversationId,
      params
    );

    yield put(
      fetchSanghaConversationMessagesSuccess({
        ...normalizeMessages(response, Boolean(params.before)),
        conversationId,
      })
    );
  } catch (error) {
    yield put(
      fetchSanghaConversationMessagesFailure({
        conversationId: action.payload.conversationId,
        error: getErrorMessage(error, "Failed to fetch messages."),
      })
    );
  }
}

function* handleSendConversationMessage(
  action: any
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiSendSanghaConversationMessage,
      action.payload.conversationId,
      { content: action.payload.content }
    );

    yield put(
      sendSanghaConversationMessageSuccess({
        conversationId: action.payload.conversationId,
        message: normalizeMessage(response),
      })
    );
  } catch (error) {
    yield put(
      sendSanghaConversationMessageFailure({
        conversationId: action.payload.conversationId,
        error: getErrorMessage(error, "Failed to send message."),
      })
    );
  }
}

function* handleMarkConversationRead(
  action: any
): Generator<any, void, any> {
  try {
    yield call(
      apiMarkSanghaConversationRead,
      action.payload.conversationId
    );
    yield put(
      markSanghaConversationReadSuccess(
        action.payload.conversationId
      )
    );
  } catch (error) {
    yield put(
      markSanghaConversationReadFailure({
        conversationId: action.payload.conversationId,
        error: getErrorMessage(error, "Failed to mark chat read."),
      })
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
    SANGHA_ACTIONS.CREATE_GROUP_REQUEST,
    handleCreateSanghaGroup
  );
  yield takeLatest(
    SANGHA_ACTIONS.UPDATE_GROUP_REQUEST,
    handleUpdateSanghaGroup
  );
  yield takeLatest(
    SANGHA_ACTIONS.ARCHIVE_GROUP_REQUEST,
    handleArchiveSanghaGroup
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
    SANGHA_ACTIONS.FETCH_GROUP_FEED_REQUEST,
    handleFetchGroupFeed
  );
  yield takeLatest(
    SANGHA_ACTIONS.FETCH_GROUP_MEMBERSHIP_REQUEST,
    handleFetchGroupMembership
  );
  yield takeLatest(
    SANGHA_ACTIONS.FETCH_GROUP_JOIN_REQUESTS_REQUEST,
    handleFetchGroupJoinRequests
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
    SANGHA_ACTIONS.CREATE_GROUP_EVENT_REQUEST,
    handleCreateGroupEvent
  );
  yield takeLatest(
    SANGHA_ACTIONS.RSVP_GROUP_EVENT_REQUEST,
    handleRsvpGroupEvent
  );
  yield takeLatest(
    SANGHA_ACTIONS.CANCEL_GROUP_EVENT_RSVP_REQUEST,
    handleCancelGroupEventRsvp
  );
  yield takeLatest(
    SANGHA_ACTIONS.FETCH_NOTIFICATIONS_REQUEST,
    handleFetchNotifications
  );
  yield takeLatest(
    SANGHA_ACTIONS.MARK_NOTIFICATIONS_READ_REQUEST,
    handleMarkNotificationsRead
  );
  yield takeLatest(
    SANGHA_ACTIONS.JOIN_GROUP_REQUEST,
    handleJoinGroup
  );
  yield takeLatest(
    SANGHA_ACTIONS.LEAVE_GROUP_REQUEST,
    handleLeaveGroup
  );
  yield takeLatest(
    SANGHA_ACTIONS.CREATE_GROUP_POST_REQUEST,
    handleCreateGroupPost
  );
  yield takeLatest(
    SANGHA_ACTIONS.LIKE_GROUP_POST_REQUEST,
    handleLikeGroupPost
  );
  yield takeLatest(
    SANGHA_ACTIONS.UNLIKE_GROUP_POST_REQUEST,
    handleUnlikeGroupPost
  );
  yield takeLatest(
    SANGHA_ACTIONS.FETCH_GROUP_POST_COMMENTS_REQUEST,
    handleFetchPostComments
  );
  yield takeLatest(
    SANGHA_ACTIONS.CREATE_GROUP_POST_COMMENT_REQUEST,
    handleCreatePostComment
  );
  yield takeLatest(
    SANGHA_ACTIONS.PIN_GROUP_POST_REQUEST,
    handlePinGroupPost
  );
  yield takeLatest(
    SANGHA_ACTIONS.UNPIN_GROUP_POST_REQUEST,
    handleUnpinGroupPost
  );
  yield takeLatest(
    SANGHA_ACTIONS.DELETE_GROUP_POST_REQUEST,
    handleDeleteGroupPost
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
  yield takeLatest(
    SANGHA_ACTIONS.START_CONVERSATION_REQUEST,
    handleStartConversation
  );
  yield takeLatest(
    SANGHA_ACTIONS.FETCH_CONVERSATION_MESSAGES_REQUEST,
    handleFetchConversationMessages
  );
  yield takeLatest(
    SANGHA_ACTIONS.SEND_CONVERSATION_MESSAGE_REQUEST,
    handleSendConversationMessage
  );
  yield takeLatest(
    SANGHA_ACTIONS.MARK_CONVERSATION_READ_REQUEST,
    handleMarkConversationRead
  );
}
