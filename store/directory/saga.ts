import {
  call,
  put,
  takeEvery,
  takeLatest,
} from "redux-saga/effects";

import {
  apiAddDirectoryRecentSearch,
  apiBookmarkDirectoryListing,
  apiClearDirectoryRecentSearches,
  apiContactDirectoryListing,
  apiCreateDirectoryDraft,
  apiCreateDirectoryListing,
  apiCreateDirectoryReview,
  apiDeleteDirectoryListing,
  apiFetchDirectoryBookmarks,
  apiFetchDirectoryCategories,
  apiFetchDirectoryHome,
  apiFetchDirectoryListingDetail,
  apiFetchDirectoryListings,
  apiFetchDirectoryRecentSearches,
  apiFetchDirectoryReviews,
  apiFetchDirectorySearchSuggestions,
  apiFetchMyDirectoryListings,
  apiPublishDirectoryDraft,
  apiRecommendDirectoryListing,
  apiReportDirectoryListing,
  apiSearchDirectoryListings,
  apiShareDirectoryListing,
  apiTrackDirectoryListingView,
  apiUnbookmarkDirectoryListing,
  apiUnrecommendDirectoryListing,
  apiUpdateDirectoryDraft,
  apiUpdateDirectoryListing,
  apiUploadDirectoryMedia,
  apiVoteDirectoryReview,
} from "@/services/directory";

import {
  addDirectoryRecentSearchFailure,
  addDirectoryRecentSearchSuccess,
  bookmarkDirectoryListingFailure,
  bookmarkDirectoryListingSuccess,
  clearDirectoryRecentSearchesFailure,
  clearDirectoryRecentSearchesSuccess,
  contactDirectoryListingFailure,
  contactDirectoryListingSuccess,
  createDirectoryDraftFailure,
  createDirectoryDraftSuccess,
  createDirectoryListingFailure,
  createDirectoryListingSuccess,
  deleteDirectoryListingFailure,
  deleteDirectoryListingSuccess,
  fetchDirectoryBookmarksFailure,
  fetchDirectoryBookmarksSuccess,
  fetchDirectoryCategoriesFailure,
  fetchDirectoryCategoriesSuccess,
  fetchDirectoryDetailFailure,
  fetchDirectoryDetailSuccess,
  fetchDirectoryHomeFailure,
  fetchDirectoryHomeSuccess,
  fetchDirectoryListingsFailure,
  fetchDirectoryListingsSuccess,
  fetchDirectoryRecentSearchesFailure,
  fetchDirectoryRecentSearchesSuccess,
  fetchDirectoryReviewsFailure,
  fetchDirectoryReviewsSuccess,
  fetchDirectorySuggestionsFailure,
  fetchDirectorySuggestionsSuccess,
  fetchMyDirectoryListingsFailure,
  fetchMyDirectoryListingsSuccess,
  publishDirectoryDraftFailure,
  publishDirectoryDraftSuccess,
  recommendDirectoryListingFailure,
  recommendDirectoryListingSuccess,
  reportDirectoryListingFailure,
  reportDirectoryListingSuccess,
  searchDirectoryFailure,
  searchDirectorySuccess,
  shareDirectoryListingFailure,
  shareDirectoryListingSuccess,
  submitDirectoryReviewFailure,
  submitDirectoryReviewSuccess,
  unbookmarkDirectoryListingFailure,
  unbookmarkDirectoryListingSuccess,
  unrecommendDirectoryListingFailure,
  unrecommendDirectoryListingSuccess,
  updateDirectoryDraftFailure,
  updateDirectoryDraftSuccess,
  updateDirectoryListingFailure,
  updateDirectoryListingSuccess,
  uploadDirectoryMediaFailure,
  uploadDirectoryMediaSuccess,
  viewDirectoryListingFailure,
  viewDirectoryListingSuccess,
  voteDirectoryReviewFailure,
  voteDirectoryReviewSuccess,
} from "./actions";

import {
  DIRECTORY_ACTIONS,
  DirectoryListing,
  DirectoryReviewsResult,
} from "./types";

function getErrorMessage(error: any, fallback: string) {
  return (
    error?.response?.data?.error?.message ||
    error?.message ||
    fallback
  );
}

function getListingFromResponse(
  response: any,
  fallbackId?: string
): DirectoryListing {
  return (
    response?.listing ||
    response?.data?.listing ||
    response?.business ||
    response?.data?.business ||
    (fallbackId
      ? {
          businessName: "",
          id: fallbackId,
        }
      : null)
  );
}

function normalizeListResult(response: any) {
  return {
    listings:
      response?.listings ||
      response?.results ||
      response?.bookmarks ||
      response?.data?.listings ||
      response?.data?.results ||
      [],
    pagination:
      response?.pagination ||
      response?.data?.pagination ||
      null,
    results:
      response?.results ||
      response?.data?.results ||
      undefined,
  };
}

function normalizeReviewsResult(
  response: any
): DirectoryReviewsResult {
  return {
    pagination: response?.pagination || null,
    reviews: response?.reviews || [],
    summary: response?.summary || null,
  };
}

function* handleFetchCategories(
  action: any
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiFetchDirectoryCategories,
      action.payload
    );

    yield put(
      fetchDirectoryCategoriesSuccess(
        response.categories || []
      )
    );
  } catch (error) {
    yield put(
      fetchDirectoryCategoriesFailure(
        getErrorMessage(
          error,
          "Failed to fetch directory categories."
        )
      )
    );
  }
}

function* handleFetchHome(
  action: any
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiFetchDirectoryHome,
      action.payload
    );

    yield put(fetchDirectoryHomeSuccess(response));
  } catch (error) {
    yield put(
      fetchDirectoryHomeFailure(
        getErrorMessage(
          error,
          "Failed to fetch directory home."
        )
      )
    );
  }
}

function* handleFetchListings(
  action: any
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiFetchDirectoryListings,
      action.payload
    );

    yield put(
      fetchDirectoryListingsSuccess(
        normalizeListResult(response)
      )
    );
  } catch (error) {
    yield put(
      fetchDirectoryListingsFailure(
        getErrorMessage(
          error,
          "Failed to fetch directory listings."
        )
      )
    );
  }
}

function* handleFetchDetail(
  action: any
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiFetchDirectoryListingDetail,
      action.payload.id
    );

    yield put(fetchDirectoryDetailSuccess(response));
  } catch (error) {
    yield put(
      fetchDirectoryDetailFailure(
        getErrorMessage(
          error,
          "Failed to fetch listing detail."
        )
      )
    );
  }
}

function* handleSearch(
  action: any
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiSearchDirectoryListings,
      action.payload
    );

    yield put(searchDirectorySuccess(response));
  } catch (error) {
    yield put(
      searchDirectoryFailure(
        getErrorMessage(
          error,
          "Failed to search directory."
        )
      )
    );
  }
}

function* handleFetchSuggestions(
  action: any
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiFetchDirectorySearchSuggestions,
      action.payload
    );

    yield put(
      fetchDirectorySuggestionsSuccess(
        response.suggestions || []
      )
    );
  } catch (error) {
    yield put(
      fetchDirectorySuggestionsFailure(
        getErrorMessage(
          error,
          "Failed to fetch search suggestions."
        )
      )
    );
  }
}

function* handleFetchRecentSearches(
  action: any
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiFetchDirectoryRecentSearches,
      action.payload
    );

    yield put(
      fetchDirectoryRecentSearchesSuccess(
        response.searches || []
      )
    );
  } catch (error) {
    yield put(
      fetchDirectoryRecentSearchesFailure(
        getErrorMessage(
          error,
          "Failed to fetch recent searches."
        )
      )
    );
  }
}

function* handleAddRecentSearch(
  action: any
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiAddDirectoryRecentSearch,
      action.payload
    );

    yield put(
      addDirectoryRecentSearchSuccess(
        response.searches ||
          (response.search ? [response.search] : [])
      )
    );
  } catch (error) {
    yield put(
      addDirectoryRecentSearchFailure(
        getErrorMessage(
          error,
          "Failed to save recent search."
        )
      )
    );
  }
}

function* handleClearRecentSearches(): Generator<
  any,
  void,
  any
> {
  try {
    yield call(apiClearDirectoryRecentSearches);
    yield put(clearDirectoryRecentSearchesSuccess());
  } catch (error) {
    yield put(
      clearDirectoryRecentSearchesFailure(
        getErrorMessage(
          error,
          "Failed to clear recent searches."
        )
      )
    );
  }
}

function* handleCreateListing(
  action: any
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiCreateDirectoryListing,
      action.payload
    );

    yield put(
      createDirectoryListingSuccess(response.listing)
    );
  } catch (error) {
    yield put(
      createDirectoryListingFailure(
        getErrorMessage(
          error,
          "Failed to create listing."
        )
      )
    );
  }
}

function* handleUpdateListing(
  action: any
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiUpdateDirectoryListing,
      action.payload.id,
      action.payload.payload
    );

    yield put(
      updateDirectoryListingSuccess(response.listing)
    );
  } catch (error) {
    yield put(
      updateDirectoryListingFailure(
        getErrorMessage(
          error,
          "Failed to update listing."
        )
      )
    );
  }
}

function* handleDeleteListing(
  action: any
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiDeleteDirectoryListing,
      action.payload.id
    );

    yield put(
      deleteDirectoryListingSuccess({
        id: response.id || action.payload.id,
        status: response.status,
      })
    );
  } catch (error) {
    yield put(
      deleteDirectoryListingFailure(
        getErrorMessage(
          error,
          "Failed to delete listing."
        )
      )
    );
  }
}

function* handleUploadMedia(
  action: any
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiUploadDirectoryMedia,
      action.payload
    );

    yield put(uploadDirectoryMediaSuccess(response));
  } catch (error) {
    yield put(
      uploadDirectoryMediaFailure(
        getErrorMessage(
          error,
          "Failed to upload listing media."
        )
      )
    );
  }
}

function* handleCreateDraft(
  action: any
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiCreateDirectoryDraft,
      action.payload
    );

    yield put(createDirectoryDraftSuccess(response.draft));
  } catch (error) {
    yield put(
      createDirectoryDraftFailure(
        getErrorMessage(
          error,
          "Failed to save listing draft."
        )
      )
    );
  }
}

function* handleUpdateDraft(
  action: any
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiUpdateDirectoryDraft,
      action.payload.id,
      action.payload.payload
    );

    yield put(updateDirectoryDraftSuccess(response.draft));
  } catch (error) {
    yield put(
      updateDirectoryDraftFailure(
        getErrorMessage(
          error,
          "Failed to update listing draft."
        )
      )
    );
  }
}

function* handlePublishDraft(
  action: any
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiPublishDirectoryDraft,
      action.payload.id
    );

    yield put(publishDirectoryDraftSuccess(response.listing));
  } catch (error) {
    yield put(
      publishDirectoryDraftFailure(
        getErrorMessage(
          error,
          "Failed to publish listing draft."
        )
      )
    );
  }
}

function* handleFetchMyListings(
  action: any
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiFetchMyDirectoryListings,
      action.payload
    );

    yield put(
      fetchMyDirectoryListingsSuccess(
        normalizeListResult(response)
      )
    );
  } catch (error) {
    yield put(
      fetchMyDirectoryListingsFailure(
        getErrorMessage(
          error,
          "Failed to fetch my listings."
        )
      )
    );
  }
}

function* handleFetchBookmarks(
  action: any
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiFetchDirectoryBookmarks,
      action.payload
    );

    yield put(
      fetchDirectoryBookmarksSuccess(
        normalizeListResult(response)
      )
    );
  } catch (error) {
    yield put(
      fetchDirectoryBookmarksFailure(
        getErrorMessage(
          error,
          "Failed to fetch saved listings."
        )
      )
    );
  }
}

function* handleListingAction(
  action: any
): Generator<any, void, any> {
  try {
    const id = action.payload.id;
    let response: any;

    switch (action.type) {
      case DIRECTORY_ACTIONS.BOOKMARK_REQUEST:
        response = yield call(apiBookmarkDirectoryListing, id);
        yield put(
          bookmarkDirectoryListingSuccess(
            getListingFromResponse(response, id)
          )
        );
        return;
      case DIRECTORY_ACTIONS.UNBOOKMARK_REQUEST:
        response = yield call(apiUnbookmarkDirectoryListing, id);
        yield put(
          unbookmarkDirectoryListingSuccess(
            getListingFromResponse(response, id)
          )
        );
        return;
      case DIRECTORY_ACTIONS.RECOMMEND_REQUEST:
        response = yield call(apiRecommendDirectoryListing, id);
        yield put(
          recommendDirectoryListingSuccess(
            getListingFromResponse(response, id)
          )
        );
        return;
      case DIRECTORY_ACTIONS.UNRECOMMEND_REQUEST:
        response = yield call(apiUnrecommendDirectoryListing, id);
        yield put(
          unrecommendDirectoryListingSuccess(
            getListingFromResponse(response, id)
          )
        );
        return;
      case DIRECTORY_ACTIONS.SHARE_REQUEST:
        response = yield call(apiShareDirectoryListing, id, {
          channel: action.payload.channel,
        });
        yield put(
          shareDirectoryListingSuccess(
            getListingFromResponse(response, id)
          )
        );
        return;
      default:
        return;
    }
  } catch (error) {
    const message = getErrorMessage(
      error,
      "Directory listing action failed."
    );

    switch (action.type) {
      case DIRECTORY_ACTIONS.BOOKMARK_REQUEST:
        yield put(bookmarkDirectoryListingFailure(message));
        return;
      case DIRECTORY_ACTIONS.UNBOOKMARK_REQUEST:
        yield put(unbookmarkDirectoryListingFailure(message));
        return;
      case DIRECTORY_ACTIONS.RECOMMEND_REQUEST:
        yield put(recommendDirectoryListingFailure(message));
        return;
      case DIRECTORY_ACTIONS.UNRECOMMEND_REQUEST:
        yield put(unrecommendDirectoryListingFailure(message));
        return;
      case DIRECTORY_ACTIONS.SHARE_REQUEST:
        yield put(shareDirectoryListingFailure(message));
        return;
      default:
        return;
    }
  }
}

function* handleContact(
  action: any
): Generator<any, void, any> {
  try {
    yield call(
      apiContactDirectoryListing,
      action.payload.id,
      action.payload.payload
    );

    yield put(
      contactDirectoryListingSuccess({
        id: action.payload.id,
      })
    );
  } catch (error) {
    yield put(
      contactDirectoryListingFailure(
        getErrorMessage(
          error,
          "Failed to contact listing."
        )
      )
    );
  }
}

function* handleView(
  action: any
): Generator<any, void, any> {
  try {
    yield call(
      apiTrackDirectoryListingView,
      action.payload.id
    );

    yield put(
      viewDirectoryListingSuccess({
        id: action.payload.id,
      })
    );
  } catch (error) {
    yield put(
      viewDirectoryListingFailure(
        getErrorMessage(
          error,
          "Failed to track listing view."
        )
      )
    );
  }
}

function* handleReport(
  action: any
): Generator<any, void, any> {
  try {
    yield call(
      apiReportDirectoryListing,
      action.payload.id,
      action.payload.payload
    );

    yield put(
      reportDirectoryListingSuccess({
        id: action.payload.id,
      })
    );
  } catch (error) {
    yield put(
      reportDirectoryListingFailure(
        getErrorMessage(
          error,
          "Failed to report listing."
        )
      )
    );
  }
}

function* handleFetchReviews(
  action: any
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiFetchDirectoryReviews,
      action.payload.id,
      action.payload.params
    );

    yield put(
      fetchDirectoryReviewsSuccess(
        action.payload.id,
        normalizeReviewsResult(response)
      )
    );
  } catch (error) {
    yield put(
      fetchDirectoryReviewsFailure(
        getErrorMessage(
          error,
          "Failed to fetch listing reviews."
        )
      )
    );
  }
}

function* handleSubmitReview(
  action: any
): Generator<any, void, any> {
  try {
    yield call(
      apiCreateDirectoryReview,
      action.payload.id,
      action.payload.payload
    );

    const response = yield call(
      apiFetchDirectoryReviews,
      action.payload.id,
      {
        limit: 20,
        offset: 0,
        sort: "newest",
      }
    );

    yield put(
      submitDirectoryReviewSuccess(
        action.payload.id,
        normalizeReviewsResult(response)
      )
    );
  } catch (error) {
    yield put(
      submitDirectoryReviewFailure(
        getErrorMessage(
          error,
          "Failed to submit review."
        )
      )
    );
  }
}

function* handleVoteReview(
  action: any
): Generator<any, void, any> {
  try {
    yield call(
      apiVoteDirectoryReview,
      action.payload.id,
      action.payload.payload
    );

    yield put(voteDirectoryReviewSuccess());
  } catch (error) {
    yield put(
      voteDirectoryReviewFailure(
        getErrorMessage(
          error,
          "Failed to vote on review."
        )
      )
    );
  }
}

export function* directorySaga() {
  yield takeLatest(
    DIRECTORY_ACTIONS.FETCH_CATEGORIES_REQUEST,
    handleFetchCategories
  );
  yield takeLatest(
    DIRECTORY_ACTIONS.FETCH_HOME_REQUEST,
    handleFetchHome
  );
  yield takeLatest(
    DIRECTORY_ACTIONS.FETCH_LISTINGS_REQUEST,
    handleFetchListings
  );
  yield takeLatest(
    DIRECTORY_ACTIONS.FETCH_DETAIL_REQUEST,
    handleFetchDetail
  );
  yield takeLatest(
    DIRECTORY_ACTIONS.SEARCH_REQUEST,
    handleSearch
  );
  yield takeLatest(
    DIRECTORY_ACTIONS.FETCH_SUGGESTIONS_REQUEST,
    handleFetchSuggestions
  );
  yield takeLatest(
    DIRECTORY_ACTIONS.FETCH_RECENT_SEARCHES_REQUEST,
    handleFetchRecentSearches
  );
  yield takeLatest(
    DIRECTORY_ACTIONS.ADD_RECENT_SEARCH_REQUEST,
    handleAddRecentSearch
  );
  yield takeLatest(
    DIRECTORY_ACTIONS.CLEAR_RECENT_SEARCHES_REQUEST,
    handleClearRecentSearches
  );
  yield takeLatest(
    DIRECTORY_ACTIONS.CREATE_LISTING_REQUEST,
    handleCreateListing
  );
  yield takeLatest(
    DIRECTORY_ACTIONS.UPDATE_LISTING_REQUEST,
    handleUpdateListing
  );
  yield takeLatest(
    DIRECTORY_ACTIONS.DELETE_LISTING_REQUEST,
    handleDeleteListing
  );
  yield takeLatest(
    DIRECTORY_ACTIONS.UPLOAD_MEDIA_REQUEST,
    handleUploadMedia
  );
  yield takeLatest(
    DIRECTORY_ACTIONS.CREATE_DRAFT_REQUEST,
    handleCreateDraft
  );
  yield takeLatest(
    DIRECTORY_ACTIONS.UPDATE_DRAFT_REQUEST,
    handleUpdateDraft
  );
  yield takeLatest(
    DIRECTORY_ACTIONS.PUBLISH_DRAFT_REQUEST,
    handlePublishDraft
  );
  yield takeLatest(
    DIRECTORY_ACTIONS.FETCH_MY_LISTINGS_REQUEST,
    handleFetchMyListings
  );
  yield takeLatest(
    DIRECTORY_ACTIONS.FETCH_BOOKMARKS_REQUEST,
    handleFetchBookmarks
  );
  yield takeEvery(
    DIRECTORY_ACTIONS.BOOKMARK_REQUEST,
    handleListingAction
  );
  yield takeEvery(
    DIRECTORY_ACTIONS.UNBOOKMARK_REQUEST,
    handleListingAction
  );
  yield takeEvery(
    DIRECTORY_ACTIONS.RECOMMEND_REQUEST,
    handleListingAction
  );
  yield takeEvery(
    DIRECTORY_ACTIONS.UNRECOMMEND_REQUEST,
    handleListingAction
  );
  yield takeEvery(
    DIRECTORY_ACTIONS.SHARE_REQUEST,
    handleListingAction
  );
  yield takeEvery(
    DIRECTORY_ACTIONS.CONTACT_REQUEST,
    handleContact
  );
  yield takeEvery(
    DIRECTORY_ACTIONS.VIEW_REQUEST,
    handleView
  );
  yield takeEvery(
    DIRECTORY_ACTIONS.REPORT_REQUEST,
    handleReport
  );
  yield takeLatest(
    DIRECTORY_ACTIONS.FETCH_REVIEWS_REQUEST,
    handleFetchReviews
  );
  yield takeLatest(
    DIRECTORY_ACTIONS.SUBMIT_REVIEW_REQUEST,
    handleSubmitReview
  );
  yield takeEvery(
    DIRECTORY_ACTIONS.REVIEW_VOTE_REQUEST,
    handleVoteReview
  );
}
