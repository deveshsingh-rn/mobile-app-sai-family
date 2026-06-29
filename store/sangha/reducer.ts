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
  createdGroup: null,
  creatingGroup: false,
  updatedGroup: null,
  updatingGroup: false,
  groupDetail: null,
  groupDetailLoading: false,
  groupEvents: [],
  groupEventsLoading: false,
  groupEventsPagination: null,
  groupFeed: [],
  groupFeedLoading: false,
  groupFeedPagination: null,
  groupJoinRequests: [],
  groupJoinRequestsLoading: false,
  groupJoinRequestsPagination: null,
  groupMembership: null,
  groupMembershipLoading: false,
  groupMembers: [],
  groupMembersLoading: false,
  groupMembersPagination: null,
  groupPostCommentsById: {},
  groupPostCommentsLoadingIds: {},
  groupPosts: [],
  groupPostsLoading: false,
  groupPostsPagination: null,
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
  notifications: [],
  notificationsLoading: false,
  notificationsPagination: null,
  activeConversation: null,
  conversationMessagesById: {},
  conversationMessagesLoadingIds: {},
  conversationMessageCursors: {},
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

function updatePost(
  posts: SanghaState["groupPosts"],
  postId: string,
  changes: Partial<SanghaState["groupPosts"][number]>
) {
  return posts.map((post) =>
    post.id === postId ? { ...post, ...changes } : post
  );
}

function mergeMessages(
  current: SanghaState["conversationMessagesById"][string] = [],
  incoming: SanghaState["conversationMessagesById"][string] = []
) {
  return mergeById([...incoming], current);
}

function updateEvent(
  events: SanghaState["groupEvents"],
  eventId: string,
  changes: Partial<SanghaState["groupEvents"][number]>
) {
  return events.map((event) =>
    event.id === eventId ? { ...event, ...changes } : event
  );
}

function updateGroup(
  groups: SanghaState["groupsList"],
  groupId: string,
  changes: Partial<SanghaState["groupsList"][number]>
) {
  return groups.map((group) =>
    group.id === groupId ? { ...group, ...changes } : group
  );
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

    case SANGHA_ACTIONS.CREATE_GROUP_REQUEST:
      return {
        ...state,
        createdGroup: null,
        creatingGroup: true,
        error: null,
      };

    case SANGHA_ACTIONS.CREATE_GROUP_SUCCESS:
      return {
        ...state,
        createdGroup: action.payload,
        creatingGroup: false,
        groupsHome: state.groupsHome
          ? {
              ...state.groupsHome,
              myGroups: [
                action.payload,
                ...(state.groupsHome.myGroups || []),
              ],
            }
          : state.groupsHome,
        groupsList: mergeById(
          [action.payload],
          state.groupsList
        ),
      };

    case SANGHA_ACTIONS.CREATE_GROUP_FAILURE:
      return {
        ...state,
        creatingGroup: false,
        error: action.payload,
      };

    case SANGHA_ACTIONS.UPDATE_GROUP_REQUEST:
      return {
        ...state,
        error: null,
        updatedGroup: null,
        updatingGroup: true,
      };

    case SANGHA_ACTIONS.UPDATE_GROUP_SUCCESS:
      return {
        ...state,
        error: null,
        groupDetail:
          state.groupDetail?.id === action.payload.id
            ? {
                ...state.groupDetail,
                ...action.payload,
              }
            : state.groupDetail,
        groupsList: updateGroup(
          state.groupsList,
          action.payload.id,
          action.payload
        ),
        updatedGroup: action.payload,
        updatingGroup: false,
      };

    case SANGHA_ACTIONS.UPDATE_GROUP_FAILURE:
      return {
        ...state,
        error: action.payload,
        updatingGroup: false,
      };

    case SANGHA_ACTIONS.ARCHIVE_GROUP_REQUEST:
      return {
        ...state,
        actionPendingIds: {
          ...state.actionPendingIds,
          [action.payload.groupId]: true,
        },
        error: null,
      };

    case SANGHA_ACTIONS.ARCHIVE_GROUP_SUCCESS:
      return {
        ...state,
        actionPendingIds: removePending(
          state.actionPendingIds,
          action.payload.groupId
        ),
        groupDetail:
          state.groupDetail?.id === action.payload.groupId
            ? null
            : state.groupDetail,
        groupsList: state.groupsList.filter(
          (group) => group.id !== action.payload.groupId
        ),
      };

    case SANGHA_ACTIONS.ARCHIVE_GROUP_FAILURE:
      return {
        ...state,
        actionPendingIds: removePending(
          state.actionPendingIds,
          action.payload.groupId
        ),
        error: action.payload.error,
      };

    case SANGHA_ACTIONS.FETCH_GROUP_DETAIL_REQUEST:
      return {
        ...state,
        error: null,
        groupDetailLoading: true,
      };

    case SANGHA_ACTIONS.FETCH_GROUP_DETAIL_SUCCESS:
      return {
        ...state,
        error: null,
        groupDetail: action.payload,
        groupDetailLoading: false,
      };

    case SANGHA_ACTIONS.FETCH_GROUP_DETAIL_FAILURE:
      return {
        ...state,
        error: action.payload,
        groupDetailLoading: false,
      };

    case SANGHA_ACTIONS.FETCH_GROUP_POSTS_REQUEST:
      return {
        ...state,
        error: null,
        groupPostsLoading: true,
      };

    case SANGHA_ACTIONS.FETCH_GROUP_POSTS_SUCCESS:
      return {
        ...state,
        error: null,
        groupPosts: action.payload.append
          ? mergeById(state.groupPosts, action.payload.posts)
          : action.payload.posts,
        groupPostsLoading: false,
        groupPostsPagination: action.payload.pagination,
      };

    case SANGHA_ACTIONS.FETCH_GROUP_POSTS_FAILURE:
      return {
        ...state,
        error: action.payload,
        groupPostsLoading: false,
      };

    case SANGHA_ACTIONS.FETCH_GROUP_FEED_REQUEST:
      return {
        ...state,
        error: null,
        groupFeedLoading: true,
      };

    case SANGHA_ACTIONS.FETCH_GROUP_FEED_SUCCESS:
      return {
        ...state,
        error: null,
        groupFeed: action.payload.append
          ? mergeById(state.groupFeed, action.payload.feed)
          : action.payload.feed,
        groupFeedLoading: false,
        groupFeedPagination: action.payload.pagination,
      };

    case SANGHA_ACTIONS.FETCH_GROUP_FEED_FAILURE:
      return {
        ...state,
        error: action.payload,
        groupFeedLoading: false,
      };

    case SANGHA_ACTIONS.FETCH_GROUP_MEMBERSHIP_REQUEST:
      return {
        ...state,
        error: null,
        groupMembershipLoading: true,
      };

    case SANGHA_ACTIONS.FETCH_GROUP_MEMBERSHIP_SUCCESS:
      return {
        ...state,
        error: null,
        groupDetail: state.groupDetail
          ? {
              ...state.groupDetail,
              canManage:
                action.payload.canModerate ??
                state.groupDetail.canManage,
              canPost:
                action.payload.canPost ??
                state.groupDetail.canPost,
              membershipStatus:
                action.payload.membershipStatus ||
                state.groupDetail.membershipStatus,
            }
          : state.groupDetail,
        groupMembership: action.payload,
        groupMembershipLoading: false,
      };

    case SANGHA_ACTIONS.FETCH_GROUP_MEMBERSHIP_FAILURE:
      return {
        ...state,
        error: action.payload,
        groupMembershipLoading: false,
      };

    case SANGHA_ACTIONS.FETCH_GROUP_JOIN_REQUESTS_REQUEST:
      return {
        ...state,
        error: null,
        groupJoinRequestsLoading: true,
      };

    case SANGHA_ACTIONS.FETCH_GROUP_JOIN_REQUESTS_SUCCESS:
      return {
        ...state,
        error: null,
        groupJoinRequests: action.payload.append
          ? mergeById(
              state.groupJoinRequests,
              action.payload.joinRequests
            )
          : action.payload.joinRequests,
        groupJoinRequestsLoading: false,
        groupJoinRequestsPagination: action.payload.pagination,
      };

    case SANGHA_ACTIONS.FETCH_GROUP_JOIN_REQUESTS_FAILURE:
      return {
        ...state,
        error: action.payload,
        groupJoinRequestsLoading: false,
      };

    case SANGHA_ACTIONS.FETCH_GROUP_MEMBERS_REQUEST:
      return {
        ...state,
        error: null,
        groupMembersLoading: true,
      };

    case SANGHA_ACTIONS.FETCH_GROUP_MEMBERS_SUCCESS:
      return {
        ...state,
        error: null,
        groupMembers: action.payload.append
          ? mergeById(state.groupMembers, action.payload.members)
          : action.payload.members,
        groupMembersLoading: false,
        groupMembersPagination: action.payload.pagination,
      };

    case SANGHA_ACTIONS.FETCH_GROUP_MEMBERS_FAILURE:
      return {
        ...state,
        error: action.payload,
        groupMembersLoading: false,
      };

    case SANGHA_ACTIONS.FETCH_GROUP_EVENTS_REQUEST:
      return {
        ...state,
        error: null,
        groupEventsLoading: true,
      };

    case SANGHA_ACTIONS.FETCH_GROUP_EVENTS_SUCCESS:
      return {
        ...state,
        error: null,
        groupEvents: action.payload.append
          ? mergeById(state.groupEvents, action.payload.events)
          : action.payload.events,
        groupEventsLoading: false,
        groupEventsPagination: action.payload.pagination,
      };

    case SANGHA_ACTIONS.FETCH_GROUP_EVENTS_FAILURE:
      return {
        ...state,
        error: action.payload,
        groupEventsLoading: false,
      };

    case SANGHA_ACTIONS.JOIN_GROUP_REQUEST:
    case SANGHA_ACTIONS.LEAVE_GROUP_REQUEST:
      return {
        ...state,
        actionPendingIds: {
          ...state.actionPendingIds,
          [action.payload.groupId]: true,
        },
        error: null,
      };

    case SANGHA_ACTIONS.JOIN_GROUP_SUCCESS:
      return {
        ...state,
        actionPendingIds: removePending(
          state.actionPendingIds,
          action.payload.groupId
        ),
        groupDetail: state.groupDetail
          ? {
              ...state.groupDetail,
              membershipStatus: "active",
            }
          : state.groupDetail,
      };

    case SANGHA_ACTIONS.LEAVE_GROUP_SUCCESS:
      return {
        ...state,
        actionPendingIds: removePending(
          state.actionPendingIds,
          action.payload.groupId
        ),
        groupDetail: state.groupDetail
          ? {
              ...state.groupDetail,
              membershipStatus: "none",
            }
          : state.groupDetail,
      };

    case SANGHA_ACTIONS.JOIN_GROUP_FAILURE:
    case SANGHA_ACTIONS.LEAVE_GROUP_FAILURE:
      return {
        ...state,
        actionPendingIds: removePending(
          state.actionPendingIds,
          action.payload.groupId
        ),
        error: action.payload.error,
      };

    case SANGHA_ACTIONS.CREATE_GROUP_POST_REQUEST:
      return {
        ...state,
        error: null,
      };

    case SANGHA_ACTIONS.CREATE_GROUP_POST_SUCCESS:
      return {
        ...state,
        error: null,
        groupPosts: [action.payload.post, ...state.groupPosts],
      };

    case SANGHA_ACTIONS.CREATE_GROUP_POST_FAILURE:
      return {
        ...state,
        error: action.payload,
      };

    case SANGHA_ACTIONS.LIKE_GROUP_POST_REQUEST:
    case SANGHA_ACTIONS.UNLIKE_GROUP_POST_REQUEST:
    case SANGHA_ACTIONS.PIN_GROUP_POST_REQUEST:
    case SANGHA_ACTIONS.UNPIN_GROUP_POST_REQUEST:
    case SANGHA_ACTIONS.DELETE_GROUP_POST_REQUEST:
      return {
        ...state,
        actionPendingIds: {
          ...state.actionPendingIds,
          [action.payload.postId]: true,
        },
        error: null,
      };

    case SANGHA_ACTIONS.LIKE_GROUP_POST_SUCCESS:
      return {
        ...state,
        actionPendingIds: removePending(
          state.actionPendingIds,
          action.payload.postId
        ),
        groupPosts: updatePost(state.groupPosts, action.payload.postId, {
          likedByMe: true,
          likeCount:
            (state.groupPosts.find((post) => post.id === action.payload.postId)?.likeCount || 0) + 1,
        }),
      };

    case SANGHA_ACTIONS.UNLIKE_GROUP_POST_SUCCESS:
      return {
        ...state,
        actionPendingIds: removePending(
          state.actionPendingIds,
          action.payload.postId
        ),
        groupPosts: updatePost(state.groupPosts, action.payload.postId, {
          likedByMe: false,
          likeCount: Math.max(
            (state.groupPosts.find((post) => post.id === action.payload.postId)?.likeCount || 0) - 1,
            0
          ),
        }),
      };

    case SANGHA_ACTIONS.PIN_GROUP_POST_SUCCESS:
      return {
        ...state,
        actionPendingIds: removePending(
          state.actionPendingIds,
          action.payload.postId
        ),
        groupPosts: updatePost(state.groupPosts, action.payload.postId, {
          isPinned: true,
        }),
      };

    case SANGHA_ACTIONS.UNPIN_GROUP_POST_SUCCESS:
      return {
        ...state,
        actionPendingIds: removePending(
          state.actionPendingIds,
          action.payload.postId
        ),
        groupPosts: updatePost(state.groupPosts, action.payload.postId, {
          isPinned: false,
        }),
      };

    case SANGHA_ACTIONS.DELETE_GROUP_POST_SUCCESS:
      return {
        ...state,
        actionPendingIds: removePending(
          state.actionPendingIds,
          action.payload.postId
        ),
        groupPosts: state.groupPosts.filter(
          (post) => post.id !== action.payload.postId
        ),
      };

    case SANGHA_ACTIONS.LIKE_GROUP_POST_FAILURE:
    case SANGHA_ACTIONS.UNLIKE_GROUP_POST_FAILURE:
    case SANGHA_ACTIONS.PIN_GROUP_POST_FAILURE:
    case SANGHA_ACTIONS.UNPIN_GROUP_POST_FAILURE:
    case SANGHA_ACTIONS.DELETE_GROUP_POST_FAILURE:
      return {
        ...state,
        actionPendingIds: removePending(
          state.actionPendingIds,
          action.payload.postId
        ),
        error: action.payload.error,
      };

    case SANGHA_ACTIONS.FETCH_GROUP_POST_COMMENTS_REQUEST:
    case SANGHA_ACTIONS.CREATE_GROUP_POST_COMMENT_REQUEST:
      return {
        ...state,
        groupPostCommentsLoadingIds: {
          ...state.groupPostCommentsLoadingIds,
          [action.payload.postId]: true,
        },
        error: null,
      };

    case SANGHA_ACTIONS.FETCH_GROUP_POST_COMMENTS_SUCCESS:
      return {
        ...state,
        groupPostCommentsById: {
          ...state.groupPostCommentsById,
          [action.payload.postId]: action.payload.append
            ? [
                ...(state.groupPostCommentsById[action.payload.postId] || []),
                ...action.payload.comments,
              ]
            : action.payload.comments,
        },
        groupPostCommentsLoadingIds: removePending(
          state.groupPostCommentsLoadingIds,
          action.payload.postId
        ),
      };

    case SANGHA_ACTIONS.CREATE_GROUP_POST_COMMENT_SUCCESS:
      return {
        ...state,
        groupPostCommentsById: {
          ...state.groupPostCommentsById,
          [action.payload.postId]: [
            ...(state.groupPostCommentsById[action.payload.postId] || []),
            action.payload.comment,
          ],
        },
        groupPostCommentsLoadingIds: removePending(
          state.groupPostCommentsLoadingIds,
          action.payload.postId
        ),
        groupPosts: updatePost(state.groupPosts, action.payload.postId, {
          commentCount:
            (state.groupPosts.find((post) => post.id === action.payload.postId)?.commentCount || 0) + 1,
        }),
      };

    case SANGHA_ACTIONS.FETCH_GROUP_POST_COMMENTS_FAILURE:
    case SANGHA_ACTIONS.CREATE_GROUP_POST_COMMENT_FAILURE:
      return {
        ...state,
        groupPostCommentsLoadingIds: removePending(
          state.groupPostCommentsLoadingIds,
          action.payload.postId
        ),
        error: action.payload.error,
      };

    case SANGHA_ACTIONS.CREATE_GROUP_EVENT_REQUEST:
      return {
        ...state,
        error: null,
        groupEventsLoading: true,
      };

    case SANGHA_ACTIONS.CREATE_GROUP_EVENT_SUCCESS:
      return {
        ...state,
        error: null,
        groupEvents: [action.payload.event, ...state.groupEvents],
        groupEventsLoading: false,
      };

    case SANGHA_ACTIONS.CREATE_GROUP_EVENT_FAILURE:
      return {
        ...state,
        error: action.payload,
        groupEventsLoading: false,
      };

    case SANGHA_ACTIONS.RSVP_GROUP_EVENT_REQUEST:
    case SANGHA_ACTIONS.CANCEL_GROUP_EVENT_RSVP_REQUEST:
      return {
        ...state,
        actionPendingIds: {
          ...state.actionPendingIds,
          [action.payload.eventId]: true,
        },
        error: null,
      };

    case SANGHA_ACTIONS.RSVP_GROUP_EVENT_SUCCESS:
      return {
        ...state,
        actionPendingIds: removePending(
          state.actionPendingIds,
          action.payload.eventId
        ),
        groupEvents: updateEvent(state.groupEvents, action.payload.eventId, {
          rsvpedByMe: true,
          rsvpCount:
            (state.groupEvents.find((event) => event.id === action.payload.eventId)?.rsvpCount || 0) + 1,
        }),
      };

    case SANGHA_ACTIONS.CANCEL_GROUP_EVENT_RSVP_SUCCESS:
      return {
        ...state,
        actionPendingIds: removePending(
          state.actionPendingIds,
          action.payload.eventId
        ),
        groupEvents: updateEvent(state.groupEvents, action.payload.eventId, {
          rsvpedByMe: false,
          rsvpCount: Math.max(
            (state.groupEvents.find((event) => event.id === action.payload.eventId)?.rsvpCount || 0) - 1,
            0
          ),
        }),
      };

    case SANGHA_ACTIONS.RSVP_GROUP_EVENT_FAILURE:
    case SANGHA_ACTIONS.CANCEL_GROUP_EVENT_RSVP_FAILURE:
      return {
        ...state,
        actionPendingIds: removePending(
          state.actionPendingIds,
          action.payload.eventId
        ),
        error: action.payload.error,
      };

    case SANGHA_ACTIONS.FETCH_NOTIFICATIONS_REQUEST:
      return {
        ...state,
        error: null,
        notificationsLoading: true,
      };

    case SANGHA_ACTIONS.FETCH_NOTIFICATIONS_SUCCESS:
      return {
        ...state,
        error: null,
        notifications: action.payload.append
          ? mergeById(
              state.notifications,
              action.payload.notifications
            )
          : action.payload.notifications,
        notificationsLoading: false,
        notificationsPagination: action.payload.pagination,
      };

    case SANGHA_ACTIONS.FETCH_NOTIFICATIONS_FAILURE:
      return {
        ...state,
        error: action.payload,
        notificationsLoading: false,
      };

    case SANGHA_ACTIONS.MARK_NOTIFICATIONS_READ_REQUEST:
      return {
        ...state,
        error: null,
      };

    case SANGHA_ACTIONS.MARK_NOTIFICATIONS_READ_SUCCESS:
      return {
        ...state,
        notifications: state.notifications.map((item) =>
          action.payload.notificationIds.includes(item.id)
            ? {
                ...item,
                isRead: true,
                readAt: item.readAt || new Date().toISOString(),
              }
            : item
        ),
      };

    case SANGHA_ACTIONS.MARK_NOTIFICATIONS_READ_FAILURE:
      return {
        ...state,
        error: action.payload,
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

    case SANGHA_ACTIONS.START_CONVERSATION_REQUEST:
      return {
        ...state,
        actionPendingIds: {
          ...state.actionPendingIds,
          [action.payload.participantUserId]: true,
        },
        error: null,
      };

    case SANGHA_ACTIONS.START_CONVERSATION_SUCCESS:
      return {
        ...state,
        activeConversation: action.payload,
        actionPendingIds: action.payload.participantUserId
          ? removePending(
              state.actionPendingIds,
              action.payload.participantUserId
            )
          : state.actionPendingIds,
        error: null,
      };

    case SANGHA_ACTIONS.START_CONVERSATION_FAILURE:
      return {
        ...state,
        actionPendingIds: removePending(
          state.actionPendingIds,
          action.payload.participantUserId
        ),
        error: action.payload.error,
      };

    case SANGHA_ACTIONS.FETCH_CONVERSATION_MESSAGES_REQUEST:
      return {
        ...state,
        conversationMessagesLoadingIds: {
          ...state.conversationMessagesLoadingIds,
          [action.payload.conversationId]: true,
        },
        error: null,
      };

    case SANGHA_ACTIONS.FETCH_CONVERSATION_MESSAGES_SUCCESS:
      return {
        ...state,
        conversationMessageCursors: {
          ...state.conversationMessageCursors,
          [action.payload.conversationId]:
            action.payload.nextCursor ?? null,
        },
        conversationMessagesById: {
          ...state.conversationMessagesById,
          [action.payload.conversationId]: action.payload.append
            ? mergeMessages(
                state.conversationMessagesById[action.payload.conversationId],
                action.payload.messages
              )
            : action.payload.messages,
        },
        conversationMessagesLoadingIds: removePending(
          state.conversationMessagesLoadingIds,
          action.payload.conversationId
        ),
      };

    case SANGHA_ACTIONS.SEND_CONVERSATION_MESSAGE_SUCCESS:
      return {
        ...state,
        conversationMessagesById: {
          ...state.conversationMessagesById,
          [action.payload.conversationId]: [
            ...(state.conversationMessagesById[action.payload.conversationId] || []),
            action.payload.message,
          ],
        },
      };

    case SANGHA_ACTIONS.MARK_CONVERSATION_READ_SUCCESS:
      return {
        ...state,
        activeConversation: state.activeConversation
          && state.activeConversation.id === action.payload.conversationId
            ? {
                ...state.activeConversation,
                unreadCount: 0,
              }
            : state.activeConversation,
      };

    case SANGHA_ACTIONS.FETCH_CONVERSATION_MESSAGES_FAILURE:
    case SANGHA_ACTIONS.SEND_CONVERSATION_MESSAGE_FAILURE:
    case SANGHA_ACTIONS.MARK_CONVERSATION_READ_FAILURE:
      return {
        ...state,
        conversationMessagesLoadingIds: removePending(
          state.conversationMessagesLoadingIds,
          action.payload.conversationId
        ),
        error: action.payload.error,
      };

    default:
      return state;
  }
}
