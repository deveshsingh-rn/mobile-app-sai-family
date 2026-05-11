import { RootState } from '../types';

export const selectExperiencesState = (state: RootState) => state.experiences;

export const selectExperienceItems = (state: RootState) => selectExperiencesState(state).items;

export const selectExperienceActiveCategory = (state: RootState) =>
  selectExperiencesState(state).activeCategory;

export const selectExperienceFeedLoading = (state: RootState) =>
  selectExperiencesState(state).isLoading;

export const selectExperienceFeedError = (state: RootState) => selectExperiencesState(state).error;
