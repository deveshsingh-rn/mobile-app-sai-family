import { RootState } from "../types";

export const selectSanghaState = (state: RootState) =>
  state.sangha;

export const selectSanghaHome = (state: RootState) =>
  selectSanghaState(state).home;

export const selectSanghaHomeLoading = (
  state: RootState
) => selectSanghaState(state).homeLoading;

export const selectSanghaDiscoverySaving = (
  state: RootState
) => selectSanghaState(state).discoverySaving;

export const selectSanghaDevotees = (state: RootState) =>
  selectSanghaState(state).devotees;

export const selectSanghaDevoteesLoading = (
  state: RootState
) => selectSanghaState(state).devoteesLoading;

export const selectSanghaDevoteesPagination = (
  state: RootState
) => selectSanghaState(state).devoteesPagination;

export const selectSanghaProfile = (state: RootState) =>
  selectSanghaState(state).profile;

export const selectSanghaProfileLoading = (
  state: RootState
) => selectSanghaState(state).profileLoading;

export const selectSanghaGroupsHome = (
  state: RootState
) => selectSanghaState(state).groupsHome;

export const selectSanghaGroupsHomeLoading = (
  state: RootState
) => selectSanghaState(state).groupsHomeLoading;

export const selectSanghaHubInvitations = (
  state: RootState
) => selectSanghaGroupsHome(state)?.invitations || [];

export const selectSanghaHubMyGroups = (
  state: RootState
) => selectSanghaGroupsHome(state)?.myGroups || [];

export const selectSanghaHubPurposeTiles = (
  state: RootState
) => selectSanghaGroupsHome(state)?.purposeTiles || [];

export const selectSanghaSearchGroups = (
  state: RootState
) => selectSanghaState(state).searchGroups;

export const selectSanghaSearchGroupsLoading = (
  state: RootState
) => selectSanghaState(state).searchGroupsLoading;

export const selectSanghaSearchGroupsPagination = (
  state: RootState
) => selectSanghaState(state).searchGroupsPagination;

export const selectSanghaGroupsList = (
  state: RootState
) => selectSanghaState(state).groupsList;

export const selectSanghaGroupsListLoading = (
  state: RootState
) => selectSanghaState(state).groupsListLoading;

export const selectSanghaGroupsListPagination = (
  state: RootState
) => selectSanghaState(state).groupsListPagination;

export const selectSanghaGroupDetail = (
  state: RootState
) => selectSanghaState(state).groupDetail;

export const selectSanghaGroupDetailLoading = (
  state: RootState
) => selectSanghaState(state).groupDetailLoading;

export const selectSanghaGroupPosts = (
  state: RootState
) => selectSanghaState(state).groupPosts;

export const selectSanghaGroupPostsLoading = (
  state: RootState
) => selectSanghaState(state).groupPostsLoading;

export const selectSanghaGroupMembers = (
  state: RootState
) => selectSanghaState(state).groupMembers;

export const selectSanghaGroupMembersLoading = (
  state: RootState
) => selectSanghaState(state).groupMembersLoading;

export const selectSanghaGroupEvents = (
  state: RootState
) => selectSanghaState(state).groupEvents;

export const selectSanghaGroupEventsLoading = (
  state: RootState
) => selectSanghaState(state).groupEventsLoading;

export const selectSanghaGroupPostComments = (
  state: RootState,
  postId?: string
) =>
  postId
    ? selectSanghaState(state).groupPostCommentsById[postId] || []
    : [];

export const selectSanghaGroupPostCommentsLoading = (
  state: RootState,
  postId?: string
) =>
  postId
    ? Boolean(selectSanghaState(state).groupPostCommentsLoadingIds[postId])
    : false;

export const selectSanghaRecentSearches = (
  state: RootState
) => selectSanghaState(state).recentSearches;

export const selectSanghaRecentSearchesLoading = (
  state: RootState
) => selectSanghaState(state).recentSearchesLoading;

export const selectSanghaUserInvitations = (
  state: RootState
) => selectSanghaState(state).userInvitations;

export const selectSanghaUserInvitationsLoading = (
  state: RootState
) => selectSanghaState(state).userInvitationsLoading;

export const selectSanghaUserInvitationsPagination = (
  state: RootState
) => selectSanghaState(state).userInvitationsPagination;

export const selectSanghaNotifications = (
  state: RootState
) => selectSanghaState(state).notifications;

export const selectSanghaNotificationsLoading = (
  state: RootState
) => selectSanghaState(state).notificationsLoading;

export const selectSanghaNotificationsPagination = (
  state: RootState
) => selectSanghaState(state).notificationsPagination;

export const selectSanghaUnreadNotificationCount = (
  state: RootState
) =>
  selectSanghaNotifications(state).filter(
    (notification) => !notification.isRead
  ).length;

export const selectIsSanghaActionPending = (
  state: RootState,
  id?: string
) =>
  id
    ? Boolean(
        selectSanghaState(state).actionPendingIds[id]
      )
    : false;

export const selectSanghaNearYou = (state: RootState) =>
  selectSanghaHome(state)?.nearYou || [];

export const selectSanghaSuggestedForYou = (
  state: RootState
) => selectSanghaHome(state)?.suggestedForYou || [];

export const selectSanghaError = (state: RootState) =>
  selectSanghaState(state).error;
