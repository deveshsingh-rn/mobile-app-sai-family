import {
  SANGHA_ACTIONS,
  SanghaDevoteeListParams,
  SanghaDevoteeListResult,
  SanghaDevoteeProfile,
  SanghaDiscoverySettingsPayload,
  SanghaGroupListParams,
  SanghaGroupListResult,
  SanghaGroupSummary,
  SanghaGroupDetail,
  SanghaGroupEvent,
  SanghaGroupFeedItem,
  SanghaGroupJoinRequest,
  SanghaGroupMembership,
  SanghaGroupMember,
  SanghaGroupPost,
  SanghaGroupPostComment,
  SanghaHubHomeResult,
  SanghaInvitation,
  SanghaNotification,
  SanghaPagination,
  SanghaRecentSearch,
  SanghaHomeParams,
  SanghaHomeResult,
  SanghaConversation,
  SanghaConversationMessage,
  CreateSanghaGroupPayload,
  UpdateSanghaGroupPayload,
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

export const createSanghaGroupRequest = (
  payload: CreateSanghaGroupPayload
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.CREATE_GROUP_REQUEST,
  } as const);

export const createSanghaGroupSuccess = (
  payload: SanghaGroupSummary
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.CREATE_GROUP_SUCCESS,
  } as const);

export const createSanghaGroupFailure = (
  payload: string
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.CREATE_GROUP_FAILURE,
  } as const);

export const updateSanghaGroupRequest = (
  payload: UpdateSanghaGroupPayload
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.UPDATE_GROUP_REQUEST,
  } as const);

export const updateSanghaGroupSuccess = (
  payload: SanghaGroupSummary
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.UPDATE_GROUP_SUCCESS,
  } as const);

export const updateSanghaGroupFailure = (
  payload: string
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.UPDATE_GROUP_FAILURE,
  } as const);

export const archiveSanghaGroupRequest = (groupId: string) =>
  ({
    payload: { groupId },
    type: SANGHA_ACTIONS.ARCHIVE_GROUP_REQUEST,
  } as const);

export const archiveSanghaGroupSuccess = (groupId: string) =>
  ({
    payload: { groupId },
    type: SANGHA_ACTIONS.ARCHIVE_GROUP_SUCCESS,
  } as const);

export const archiveSanghaGroupFailure = (
  payload: { error: string; groupId: string }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.ARCHIVE_GROUP_FAILURE,
  } as const);

export const fetchSanghaGroupDetailRequest = (
  id: string
) =>
  ({
    payload: { id },
    type: SANGHA_ACTIONS.FETCH_GROUP_DETAIL_REQUEST,
  } as const);

export const fetchSanghaGroupDetailSuccess = (
  payload: SanghaGroupDetail
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.FETCH_GROUP_DETAIL_SUCCESS,
  } as const);

export const fetchSanghaGroupDetailFailure = (
  payload: string
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.FETCH_GROUP_DETAIL_FAILURE,
  } as const);

export const fetchSanghaGroupPostsRequest = (
  payload: {
    groupId: string;
    limit?: number;
    offset?: number;
    pinnedFirst?: boolean;
  }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.FETCH_GROUP_POSTS_REQUEST,
  } as const);

export const fetchSanghaGroupPostsSuccess = (
  payload: {
    append?: boolean;
    pagination: SanghaPagination | null;
    posts: SanghaGroupPost[];
  }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.FETCH_GROUP_POSTS_SUCCESS,
  } as const);

export const fetchSanghaGroupPostsFailure = (
  payload: string
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.FETCH_GROUP_POSTS_FAILURE,
  } as const);

export const fetchSanghaGroupFeedRequest = (
  payload: {
    groupId: string;
    limit?: number;
    offset?: number;
    pinnedFirst?: boolean;
    types?: string;
  }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.FETCH_GROUP_FEED_REQUEST,
  } as const);

export const fetchSanghaGroupFeedSuccess = (
  payload: {
    append?: boolean;
    feed: SanghaGroupFeedItem[];
    pagination: SanghaPagination | null;
  }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.FETCH_GROUP_FEED_SUCCESS,
  } as const);

export const fetchSanghaGroupFeedFailure = (
  payload: string
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.FETCH_GROUP_FEED_FAILURE,
  } as const);

export const fetchSanghaGroupMembershipRequest = (
  groupId: string
) =>
  ({
    payload: { groupId },
    type: SANGHA_ACTIONS.FETCH_GROUP_MEMBERSHIP_REQUEST,
  } as const);

export const fetchSanghaGroupMembershipSuccess = (
  payload: SanghaGroupMembership
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.FETCH_GROUP_MEMBERSHIP_SUCCESS,
  } as const);

export const fetchSanghaGroupMembershipFailure = (
  payload: string
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.FETCH_GROUP_MEMBERSHIP_FAILURE,
  } as const);

export const fetchSanghaGroupJoinRequestsRequest = (
  payload: {
    groupId: string;
    limit?: number;
    offset?: number;
  }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.FETCH_GROUP_JOIN_REQUESTS_REQUEST,
  } as const);

export const fetchSanghaGroupJoinRequestsSuccess = (
  payload: {
    append?: boolean;
    joinRequests: SanghaGroupJoinRequest[];
    pagination: SanghaPagination | null;
  }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.FETCH_GROUP_JOIN_REQUESTS_SUCCESS,
  } as const);

export const fetchSanghaGroupJoinRequestsFailure = (
  payload: string
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.FETCH_GROUP_JOIN_REQUESTS_FAILURE,
  } as const);

export const fetchSanghaGroupMembersRequest = (
  payload: {
    groupId: string;
    limit?: number;
    offset?: number;
    role?: string;
    status?: string;
  }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.FETCH_GROUP_MEMBERS_REQUEST,
  } as const);

export const fetchSanghaGroupMembersSuccess = (
  payload: {
    append?: boolean;
    members: SanghaGroupMember[];
    pagination: SanghaPagination | null;
  }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.FETCH_GROUP_MEMBERS_SUCCESS,
  } as const);

export const fetchSanghaGroupMembersFailure = (
  payload: string
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.FETCH_GROUP_MEMBERS_FAILURE,
  } as const);

export const fetchSanghaGroupEventsRequest = (
  payload: {
    groupId: string;
    limit?: number;
    offset?: number;
    status?: string;
  }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.FETCH_GROUP_EVENTS_REQUEST,
  } as const);

export const fetchSanghaGroupEventsSuccess = (
  payload: {
    append?: boolean;
    events: SanghaGroupEvent[];
    pagination: SanghaPagination | null;
  }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.FETCH_GROUP_EVENTS_SUCCESS,
  } as const);

export const fetchSanghaGroupEventsFailure = (
  payload: string
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.FETCH_GROUP_EVENTS_FAILURE,
  } as const);

export const createSanghaGroupEventRequest = (
  payload: {
    description?: string;
    endAt?: string;
    groupId: string;
    startAt: string;
    title: string;
    venueName?: string;
  }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.CREATE_GROUP_EVENT_REQUEST,
  } as const);

export const createSanghaGroupEventSuccess = (
  payload: { event: SanghaGroupEvent; response?: any }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.CREATE_GROUP_EVENT_SUCCESS,
  } as const);

export const createSanghaGroupEventFailure = (
  payload: string
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.CREATE_GROUP_EVENT_FAILURE,
  } as const);

export const rsvpSanghaGroupEventRequest = (
  payload: { eventId: string; groupId: string }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.RSVP_GROUP_EVENT_REQUEST,
  } as const);

export const rsvpSanghaGroupEventSuccess = (
  payload: { eventId: string; response?: any }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.RSVP_GROUP_EVENT_SUCCESS,
  } as const);

export const rsvpSanghaGroupEventFailure = (
  payload: { error: string; eventId: string }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.RSVP_GROUP_EVENT_FAILURE,
  } as const);

export const cancelSanghaGroupEventRsvpRequest = (
  payload: { eventId: string; groupId: string }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.CANCEL_GROUP_EVENT_RSVP_REQUEST,
  } as const);

export const cancelSanghaGroupEventRsvpSuccess = (
  payload: { eventId: string; response?: any }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.CANCEL_GROUP_EVENT_RSVP_SUCCESS,
  } as const);

export const cancelSanghaGroupEventRsvpFailure = (
  payload: { error: string; eventId: string }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.CANCEL_GROUP_EVENT_RSVP_FAILURE,
  } as const);

export const fetchSanghaNotificationsRequest = (
  payload: {
    limit?: number;
    offset?: number;
    unreadOnly?: boolean;
  } = {}
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.FETCH_NOTIFICATIONS_REQUEST,
  } as const);

export const fetchSanghaNotificationsSuccess = (
  payload: {
    append?: boolean;
    notifications: SanghaNotification[];
    pagination: SanghaPagination | null;
  }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.FETCH_NOTIFICATIONS_SUCCESS,
  } as const);

export const fetchSanghaNotificationsFailure = (
  payload: string
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.FETCH_NOTIFICATIONS_FAILURE,
  } as const);

export const markSanghaNotificationsReadRequest = (
  payload: { notificationIds: string[] }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.MARK_NOTIFICATIONS_READ_REQUEST,
  } as const);

export const markSanghaNotificationsReadSuccess = (
  payload: { notificationIds: string[]; response?: any }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.MARK_NOTIFICATIONS_READ_SUCCESS,
  } as const);

export const markSanghaNotificationsReadFailure = (
  payload: string
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.MARK_NOTIFICATIONS_READ_FAILURE,
  } as const);

export const joinSanghaGroupRequest = (groupId: string) =>
  ({
    payload: { groupId },
    type: SANGHA_ACTIONS.JOIN_GROUP_REQUEST,
  } as const);

export const joinSanghaGroupSuccess = (
  payload: { groupId: string; response?: any }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.JOIN_GROUP_SUCCESS,
  } as const);

export const joinSanghaGroupFailure = (
  payload: { error: string; groupId: string }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.JOIN_GROUP_FAILURE,
  } as const);

export const leaveSanghaGroupRequest = (groupId: string) =>
  ({
    payload: { groupId },
    type: SANGHA_ACTIONS.LEAVE_GROUP_REQUEST,
  } as const);

export const leaveSanghaGroupSuccess = (
  payload: { groupId: string; response?: any }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.LEAVE_GROUP_SUCCESS,
  } as const);

export const leaveSanghaGroupFailure = (
  payload: { error: string; groupId: string }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.LEAVE_GROUP_FAILURE,
  } as const);

export const createSanghaGroupPostRequest = (
  payload: {
    content: string;
    groupId: string;
    mediaUrls?: string[];
    type?: string;
  }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.CREATE_GROUP_POST_REQUEST,
  } as const);

export const createSanghaGroupPostSuccess = (
  payload: { post: SanghaGroupPost; response?: any }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.CREATE_GROUP_POST_SUCCESS,
  } as const);

export const createSanghaGroupPostFailure = (
  payload: string
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.CREATE_GROUP_POST_FAILURE,
  } as const);

export const likeSanghaGroupPostRequest = (
  payload: { groupId: string; postId: string }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.LIKE_GROUP_POST_REQUEST,
  } as const);

export const likeSanghaGroupPostSuccess = (
  payload: { postId: string; response?: any }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.LIKE_GROUP_POST_SUCCESS,
  } as const);

export const likeSanghaGroupPostFailure = (
  payload: { error: string; postId: string }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.LIKE_GROUP_POST_FAILURE,
  } as const);

export const unlikeSanghaGroupPostRequest = (
  payload: { groupId: string; postId: string }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.UNLIKE_GROUP_POST_REQUEST,
  } as const);

export const unlikeSanghaGroupPostSuccess = (
  payload: { postId: string; response?: any }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.UNLIKE_GROUP_POST_SUCCESS,
  } as const);

export const unlikeSanghaGroupPostFailure = (
  payload: { error: string; postId: string }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.UNLIKE_GROUP_POST_FAILURE,
  } as const);

export const fetchSanghaGroupPostCommentsRequest = (
  payload: {
    groupId: string;
    limit?: number;
    offset?: number;
    postId: string;
  }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.FETCH_GROUP_POST_COMMENTS_REQUEST,
  } as const);

export const fetchSanghaGroupPostCommentsSuccess = (
  payload: {
    append?: boolean;
    comments: SanghaGroupPostComment[];
    postId: string;
  }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.FETCH_GROUP_POST_COMMENTS_SUCCESS,
  } as const);

export const fetchSanghaGroupPostCommentsFailure = (
  payload: { error: string; postId: string }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.FETCH_GROUP_POST_COMMENTS_FAILURE,
  } as const);

export const createSanghaGroupPostCommentRequest = (
  payload: { content: string; groupId: string; postId: string }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.CREATE_GROUP_POST_COMMENT_REQUEST,
  } as const);

export const createSanghaGroupPostCommentSuccess = (
  payload: { comment: SanghaGroupPostComment; postId: string }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.CREATE_GROUP_POST_COMMENT_SUCCESS,
  } as const);

export const createSanghaGroupPostCommentFailure = (
  payload: { error: string; postId: string }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.CREATE_GROUP_POST_COMMENT_FAILURE,
  } as const);

export const pinSanghaGroupPostRequest = (
  payload: { groupId: string; postId: string }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.PIN_GROUP_POST_REQUEST,
  } as const);

export const pinSanghaGroupPostSuccess = (
  payload: { postId: string; response?: any }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.PIN_GROUP_POST_SUCCESS,
  } as const);

export const pinSanghaGroupPostFailure = (
  payload: { error: string; postId: string }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.PIN_GROUP_POST_FAILURE,
  } as const);

export const unpinSanghaGroupPostRequest = (
  payload: { groupId: string; postId: string }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.UNPIN_GROUP_POST_REQUEST,
  } as const);

export const unpinSanghaGroupPostSuccess = (
  payload: { postId: string; response?: any }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.UNPIN_GROUP_POST_SUCCESS,
  } as const);

export const unpinSanghaGroupPostFailure = (
  payload: { error: string; postId: string }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.UNPIN_GROUP_POST_FAILURE,
  } as const);

export const deleteSanghaGroupPostRequest = (
  payload: { groupId: string; postId: string }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.DELETE_GROUP_POST_REQUEST,
  } as const);

export const deleteSanghaGroupPostSuccess = (
  payload: { postId: string; response?: any }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.DELETE_GROUP_POST_SUCCESS,
  } as const);

export const deleteSanghaGroupPostFailure = (
  payload: { error: string; postId: string }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.DELETE_GROUP_POST_FAILURE,
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

export const startSanghaConversationRequest = (
  payload: {
    groupId?: string;
    memberName?: string;
    participantUserId: string;
  }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.START_CONVERSATION_REQUEST,
  } as const);

export const startSanghaConversationSuccess = (
  payload: SanghaConversation
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.START_CONVERSATION_SUCCESS,
  } as const);

export const startSanghaConversationFailure = (
  payload: { error: string; participantUserId: string }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.START_CONVERSATION_FAILURE,
  } as const);

export const fetchSanghaConversationMessagesRequest = (
  payload: {
    before?: string;
    conversationId: string;
    limit?: number;
  }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.FETCH_CONVERSATION_MESSAGES_REQUEST,
  } as const);

export const fetchSanghaConversationMessagesSuccess = (
  payload: {
    append?: boolean;
    conversationId: string;
    messages: SanghaConversationMessage[];
    nextCursor?: string | null;
  }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.FETCH_CONVERSATION_MESSAGES_SUCCESS,
  } as const);

export const fetchSanghaConversationMessagesFailure = (
  payload: { conversationId: string; error: string }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.FETCH_CONVERSATION_MESSAGES_FAILURE,
  } as const);

export const sendSanghaConversationMessageRequest = (
  payload: { content: string; conversationId: string }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.SEND_CONVERSATION_MESSAGE_REQUEST,
  } as const);

export const sendSanghaConversationMessageSuccess = (
  payload: {
    conversationId: string;
    message: SanghaConversationMessage;
  }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.SEND_CONVERSATION_MESSAGE_SUCCESS,
  } as const);

export const sendSanghaConversationMessageFailure = (
  payload: { conversationId: string; error: string }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.SEND_CONVERSATION_MESSAGE_FAILURE,
  } as const);

export const markSanghaConversationReadRequest = (
  conversationId: string
) =>
  ({
    payload: { conversationId },
    type: SANGHA_ACTIONS.MARK_CONVERSATION_READ_REQUEST,
  } as const);

export const markSanghaConversationReadSuccess = (
  conversationId: string
) =>
  ({
    payload: { conversationId },
    type: SANGHA_ACTIONS.MARK_CONVERSATION_READ_SUCCESS,
  } as const);

export const markSanghaConversationReadFailure = (
  payload: { conversationId: string; error: string }
) =>
  ({
    payload,
    type: SANGHA_ACTIONS.MARK_CONVERSATION_READ_FAILURE,
  } as const);
