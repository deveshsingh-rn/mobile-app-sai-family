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
