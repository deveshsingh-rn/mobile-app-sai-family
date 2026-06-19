import { RootState } from "../types";

export const selectDirectoryState = (
  state: RootState
) => state.directory;

export const selectDirectoryCategories = (
  state: RootState
) => selectDirectoryState(state).categories;

export const selectDirectoryCategoriesLoading = (
  state: RootState
) => selectDirectoryState(state).categoriesLoading;

export const selectDirectoryHome = (
  state: RootState
) => selectDirectoryState(state).home;

export const selectDirectoryHomeLoading = (
  state: RootState
) => selectDirectoryState(state).homeLoading;

export const selectDirectoryListings = (
  state: RootState
) => selectDirectoryState(state).listings;

export const selectDirectoryListingsLoading = (
  state: RootState
) => selectDirectoryState(state).listingsLoading;

export const selectDirectoryListingsPagination = (
  state: RootState
) => selectDirectoryState(state).listingsPagination;

export const selectDirectoryDetail = (
  state: RootState
) => selectDirectoryState(state).detail;

export const selectDirectoryDetailReviewSummary = (
  state: RootState
) => selectDirectoryState(state).reviewSummary;

export const selectDirectoryDetailRecentReviews = (
  state: RootState
) => selectDirectoryState(state).recentReviews;

export const selectDirectorySearchResults = (
  state: RootState
) => selectDirectoryState(state).searchResults;

export const selectDirectorySearchLoading = (
  state: RootState
) => selectDirectoryState(state).searchLoading;

export const selectDirectorySearchSuggestions = (
  state: RootState
) => selectDirectoryState(state).suggestions;

export const selectDirectorySuggestionsLoading = (
  state: RootState
) => selectDirectoryState(state).suggestionsLoading;

export const selectDirectoryRecentSearches = (
  state: RootState
) => selectDirectoryState(state).recentSearches;

export const selectDirectoryRecentSearchesLoading = (
  state: RootState
) => selectDirectoryState(state).recentSearchesLoading;

export const selectIsCreatingDirectoryListing = (
  state: RootState
) => selectDirectoryState(state).creating;

export const selectDirectoryUploadedMedia = (
  state: RootState
) => selectDirectoryState(state).uploadedMedia;

export const selectIsUploadingDirectoryMedia = (
  state: RootState
) => selectDirectoryState(state).uploadingMedia;

export const selectIsSavingDirectoryDraft = (
  state: RootState
) => selectDirectoryState(state).draftSaving;

export const selectCurrentDirectoryDraft = (
  state: RootState
) => {
  const directoryState = selectDirectoryState(state);
  const draftId = directoryState.currentDraftId;

  return draftId
    ? directoryState.draftsById[draftId] || null
    : null;
};

export const selectMyDirectoryListings = (
  state: RootState
) => selectDirectoryState(state).myListings;

export const selectMyDirectoryListingsLoading = (
  state: RootState
) => selectDirectoryState(state).myListingsLoading;

export const selectDirectoryBookmarks = (
  state: RootState
) => selectDirectoryState(state).bookmarks;

export const selectDirectoryBookmarksLoading = (
  state: RootState
) => selectDirectoryState(state).bookmarksLoading;

export const selectDirectoryReviews = (
  state: RootState,
  listingId?: string
) =>
  listingId
    ? selectDirectoryState(state).reviewsByListingId[
        listingId
      ] || null
    : null;

export const selectDirectoryReviewsLoading = (
  state: RootState,
  listingId?: string
) =>
  listingId
    ? Boolean(
        selectDirectoryState(state)
          .reviewsLoadingIds[listingId]
      )
    : false;

export const selectIsDirectoryListingActionPending = (
  state: RootState,
  listingId?: string
) =>
  listingId
    ? Boolean(
        selectDirectoryState(state)
          .listingActionPendingIds[listingId]
      )
    : false;

export const selectIsDirectoryContactPending = (
  state: RootState,
  listingId?: string
) =>
  listingId
    ? Boolean(
        selectDirectoryState(state)
          .contactPendingIds[listingId]
      )
    : false;

export const selectDirectoryError = (
  state: RootState
) => selectDirectoryState(state).error;
