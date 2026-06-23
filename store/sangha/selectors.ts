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

export const selectSanghaNearYou = (state: RootState) =>
  selectSanghaHome(state)?.nearYou || [];

export const selectSanghaSuggestedForYou = (
  state: RootState
) => selectSanghaHome(state)?.suggestedForYou || [];

export const selectSanghaError = (state: RootState) =>
  selectSanghaState(state).error;
