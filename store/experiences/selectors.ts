export const selectExperiencesFeed = (state: any) => state.experiences?.feed || [];
export const selectExperiencesSearchResults = (state: any) => state.experiences?.searchResults || [];
export const selectExperiencesBookmarks = (state: any) => state.experiences?.bookmarks || [];
export const selectExperiencesLoading = (state: any) => state.experiences?.loading || false;
export const selectExperiencesError = (state: any) => state.experiences?.error || null;