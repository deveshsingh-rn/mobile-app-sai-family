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
  groupDetail: null,
  groupDetailLoading: false,
  groupEvents: [],
  groupEventsLoading: false,
  groupEventsPagination: null,
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
