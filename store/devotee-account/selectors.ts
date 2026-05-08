import { RootState } from "../types";

export const selectDevoteeAccountState = (state: RootState) => state.devoteeAccount;

export const selectDevoteeAccount = (state: RootState) => selectDevoteeAccountState(state).account;

export const selectDevoteeAccountError = (state: RootState) => selectDevoteeAccountState(state).error;

export const selectHasHydratedDevoteeAccount = (state: RootState) =>
  selectDevoteeAccountState(state).hasHydrated;

export const selectIsCreatingDevoteeAccount = (state: RootState) =>
  selectDevoteeAccountState(state).isCreating;

export const selectIsLoadingSavedDevoteeAccount = (state: RootState) =>
  selectDevoteeAccountState(state).isLoadingSaved;
