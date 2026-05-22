export const selectExperiencesFeed = (
  state: any
) => state.experiences.feed;

export const selectExperiencesLoading = (
  state: any
) => state.experiences.loading;

export const selectCreateExperienceLoading =
  (state: any) =>
    state.experiences.creating;

export const selectExperienceCategories =
  (state: any) =>
    state.experiences.categories;

export const selectExperienceCategoriesLoading =
  (state: any) =>
    state.experiences.categoriesLoading;

export const selectExperiencesError = (
  state: any
) => state.experiences.error;

export const selectBookmarkedExperiencesFeed = (
  state: any
) => state.experiences.bookmarkedFeed;

export const selectBookmarkedExperiencesLoading = (
  state: any
) => state.experiences.bookmarksLoading;

export const selectBookmarkedExperiencesHasMore = (
  state: any
) => state.experiences.bookmarksHasMore;

export const selectBookmarkedExperiencesError = (
  state: any
) => state.experiences.bookmarksError;

export const selectExperienceSearchResults = (
  state: any
) => state.experiences.searchResults;

export const selectExperienceSearchLoading = (
  state: any
) => state.experiences.searchLoading;

export const selectExperienceSearchHasMore = (
  state: any
) => state.experiences.searchHasMore;

export const selectExperienceSearchError = (
  state: any
) => state.experiences.searchError;

export const selectExperienceDetail = (
  state: any
) => state.experiences.detail;

export const selectExperienceComments = (
  state: any
) => state.experiences.comments || [];

export const selectExperienceDetailLoading = (
  state: any
) => state.experiences.loading;

export const selectIsAddingExperienceComment =
  (state: any) =>
    state.experiences.addingComment;

export const selectExperienceDetailError = (
  state: any
) => state.experiences.error;
