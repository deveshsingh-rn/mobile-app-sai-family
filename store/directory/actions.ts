import {
  DIRECTORY_ACTIONS,
  DirectoryContactPayload,
  DirectoryCreateListingPayload,
  DirectoryDetailResult,
  DirectoryDraft,
  DirectoryHomeResult,
  DirectoryListParams,
  DirectoryListResult,
  DirectoryListing,
  DirectoryRecentSearch,
  DirectoryReportPayload,
  DirectoryReviewPayload,
  DirectoryReviewsResult,
  DirectoryReviewVotePayload,
  DirectorySearchSuggestion,
  DirectoryUpdateListingPayload,
  DirectoryUploadMediaPayload,
  DirectoryUploadMediaResult,
} from "./types";

export const fetchDirectoryCategoriesRequest = (
  payload: { includeCounts?: boolean } = {}
) =>
  ({
    payload,
    type: DIRECTORY_ACTIONS.FETCH_CATEGORIES_REQUEST,
  } as const);

export const fetchDirectoryCategoriesSuccess = (
  payload: any[]
) =>
  ({
    payload,
    type: DIRECTORY_ACTIONS.FETCH_CATEGORIES_SUCCESS,
  } as const);

export const fetchDirectoryCategoriesFailure = (
  payload: string
) =>
  ({
    payload,
    type: DIRECTORY_ACTIONS.FETCH_CATEGORIES_FAILURE,
  } as const);

export const fetchDirectoryHomeRequest = (
  payload: {
    city?: string;
    lat?: number;
    limit?: number;
    lng?: number;
  } = {}
) =>
  ({
    payload,
    type: DIRECTORY_ACTIONS.FETCH_HOME_REQUEST,
  } as const);

export const fetchDirectoryHomeSuccess = (
  payload: DirectoryHomeResult
) =>
  ({
    payload,
    type: DIRECTORY_ACTIONS.FETCH_HOME_SUCCESS,
  } as const);

export const fetchDirectoryHomeFailure = (
  payload: string
) =>
  ({
    payload,
    type: DIRECTORY_ACTIONS.FETCH_HOME_FAILURE,
  } as const);

export const fetchDirectoryListingsRequest = (
  payload: DirectoryListParams = {}
) =>
  ({
    payload,
    type: DIRECTORY_ACTIONS.FETCH_LISTINGS_REQUEST,
  } as const);

export const fetchDirectoryListingsSuccess = (
  payload: DirectoryListResult
) =>
  ({
    payload,
    type: DIRECTORY_ACTIONS.FETCH_LISTINGS_SUCCESS,
  } as const);

export const fetchDirectoryListingsFailure = (
  payload: string
) =>
  ({
    payload,
    type: DIRECTORY_ACTIONS.FETCH_LISTINGS_FAILURE,
  } as const);

export const fetchDirectoryDetailRequest = (
  id: string
) =>
  ({
    payload: { id },
    type: DIRECTORY_ACTIONS.FETCH_DETAIL_REQUEST,
  } as const);

export const fetchDirectoryDetailSuccess = (
  payload: DirectoryDetailResult
) =>
  ({
    payload,
    type: DIRECTORY_ACTIONS.FETCH_DETAIL_SUCCESS,
  } as const);

export const fetchDirectoryDetailFailure = (
  payload: string
) =>
  ({
    payload,
    type: DIRECTORY_ACTIONS.FETCH_DETAIL_FAILURE,
  } as const);

export const searchDirectoryRequest = (
  payload: DirectoryListParams & { q: string }
) =>
  ({
    payload,
    type: DIRECTORY_ACTIONS.SEARCH_REQUEST,
  } as const);

export const searchDirectorySuccess = (
  payload: DirectoryListResult & {
    suggestions?: DirectorySearchSuggestion[];
  }
) =>
  ({
    payload,
    type: DIRECTORY_ACTIONS.SEARCH_SUCCESS,
  } as const);

export const searchDirectoryFailure = (
  payload: string
) =>
  ({
    payload,
    type: DIRECTORY_ACTIONS.SEARCH_FAILURE,
  } as const);

export const fetchDirectorySuggestionsRequest = (
  payload: { limit?: number; q: string }
) =>
  ({
    payload,
    type: DIRECTORY_ACTIONS.FETCH_SUGGESTIONS_REQUEST,
  } as const);

export const fetchDirectorySuggestionsSuccess = (
  payload: DirectorySearchSuggestion[]
) =>
  ({
    payload,
    type: DIRECTORY_ACTIONS.FETCH_SUGGESTIONS_SUCCESS,
  } as const);

export const fetchDirectorySuggestionsFailure = (
  payload: string
) =>
  ({
    payload,
    type: DIRECTORY_ACTIONS.FETCH_SUGGESTIONS_FAILURE,
  } as const);

export const fetchDirectoryRecentSearchesRequest = (
  payload: { limit?: number } = {}
) =>
  ({
    payload,
    type: DIRECTORY_ACTIONS.FETCH_RECENT_SEARCHES_REQUEST,
  } as const);

export const fetchDirectoryRecentSearchesSuccess = (
  payload: DirectoryRecentSearch[]
) =>
  ({
    payload,
    type: DIRECTORY_ACTIONS.FETCH_RECENT_SEARCHES_SUCCESS,
  } as const);

export const fetchDirectoryRecentSearchesFailure = (
  payload: string
) =>
  ({
    payload,
    type: DIRECTORY_ACTIONS.FETCH_RECENT_SEARCHES_FAILURE,
  } as const);

export const addDirectoryRecentSearchRequest = (
  payload: {
    categoryId?: string;
    city?: string;
    query: string;
  }
) =>
  ({
    payload,
    type: DIRECTORY_ACTIONS.ADD_RECENT_SEARCH_REQUEST,
  } as const);

export const addDirectoryRecentSearchSuccess = (
  payload: DirectoryRecentSearch[]
) =>
  ({
    payload,
    type: DIRECTORY_ACTIONS.ADD_RECENT_SEARCH_SUCCESS,
  } as const);

export const addDirectoryRecentSearchFailure = (
  payload: string
) =>
  ({
    payload,
    type: DIRECTORY_ACTIONS.ADD_RECENT_SEARCH_FAILURE,
  } as const);

export const clearDirectoryRecentSearchesRequest = () =>
  ({
    type: DIRECTORY_ACTIONS.CLEAR_RECENT_SEARCHES_REQUEST,
  } as const);

export const clearDirectoryRecentSearchesSuccess = () =>
  ({
    type: DIRECTORY_ACTIONS.CLEAR_RECENT_SEARCHES_SUCCESS,
  } as const);

export const clearDirectoryRecentSearchesFailure = (
  payload: string
) =>
  ({
    payload,
    type: DIRECTORY_ACTIONS.CLEAR_RECENT_SEARCHES_FAILURE,
  } as const);

export const createDirectoryListingRequest = (
  payload: DirectoryCreateListingPayload
) =>
  ({
    payload,
    type: DIRECTORY_ACTIONS.CREATE_LISTING_REQUEST,
  } as const);

export const createDirectoryListingSuccess = (
  payload: DirectoryListing
) =>
  ({
    payload,
    type: DIRECTORY_ACTIONS.CREATE_LISTING_SUCCESS,
  } as const);

export const createDirectoryListingFailure = (
  payload: string
) =>
  ({
    payload,
    type: DIRECTORY_ACTIONS.CREATE_LISTING_FAILURE,
  } as const);

export const updateDirectoryListingRequest = (
  id: string,
  payload: DirectoryUpdateListingPayload
) =>
  ({
    payload: { id, payload },
    type: DIRECTORY_ACTIONS.UPDATE_LISTING_REQUEST,
  } as const);

export const updateDirectoryListingSuccess = (
  payload: DirectoryListing
) =>
  ({
    payload,
    type: DIRECTORY_ACTIONS.UPDATE_LISTING_SUCCESS,
  } as const);

export const updateDirectoryListingFailure = (
  payload: string
) =>
  ({
    payload,
    type: DIRECTORY_ACTIONS.UPDATE_LISTING_FAILURE,
  } as const);

export const deleteDirectoryListingRequest = (
  id: string
) =>
  ({
    payload: { id },
    type: DIRECTORY_ACTIONS.DELETE_LISTING_REQUEST,
  } as const);

export const deleteDirectoryListingSuccess = (
  payload: { id: string; status?: string }
) =>
  ({
    payload,
    type: DIRECTORY_ACTIONS.DELETE_LISTING_SUCCESS,
  } as const);

export const deleteDirectoryListingFailure = (
  payload: string
) =>
  ({
    payload,
    type: DIRECTORY_ACTIONS.DELETE_LISTING_FAILURE,
  } as const);

export const uploadDirectoryMediaRequest = (
  payload: DirectoryUploadMediaPayload
) =>
  ({
    payload,
    type: DIRECTORY_ACTIONS.UPLOAD_MEDIA_REQUEST,
  } as const);

export const uploadDirectoryMediaSuccess = (
  payload: DirectoryUploadMediaResult
) =>
  ({
    payload,
    type: DIRECTORY_ACTIONS.UPLOAD_MEDIA_SUCCESS,
  } as const);

export const uploadDirectoryMediaFailure = (
  payload: string
) =>
  ({
    payload,
    type: DIRECTORY_ACTIONS.UPLOAD_MEDIA_FAILURE,
  } as const);

export const createDirectoryDraftRequest = (
  payload: Partial<DirectoryCreateListingPayload>
) =>
  ({
    payload,
    type: DIRECTORY_ACTIONS.CREATE_DRAFT_REQUEST,
  } as const);

export const createDirectoryDraftSuccess = (
  payload: DirectoryDraft
) =>
  ({
    payload,
    type: DIRECTORY_ACTIONS.CREATE_DRAFT_SUCCESS,
  } as const);

export const createDirectoryDraftFailure = (
  payload: string
) =>
  ({
    payload,
    type: DIRECTORY_ACTIONS.CREATE_DRAFT_FAILURE,
  } as const);

export const updateDirectoryDraftRequest = (
  id: string,
  payload: Partial<DirectoryCreateListingPayload>
) =>
  ({
    payload: { id, payload },
    type: DIRECTORY_ACTIONS.UPDATE_DRAFT_REQUEST,
  } as const);

export const updateDirectoryDraftSuccess = (
  payload: DirectoryDraft
) =>
  ({
    payload,
    type: DIRECTORY_ACTIONS.UPDATE_DRAFT_SUCCESS,
  } as const);

export const updateDirectoryDraftFailure = (
  payload: string
) =>
  ({
    payload,
    type: DIRECTORY_ACTIONS.UPDATE_DRAFT_FAILURE,
  } as const);

export const publishDirectoryDraftRequest = (
  id: string
) =>
  ({
    payload: { id },
    type: DIRECTORY_ACTIONS.PUBLISH_DRAFT_REQUEST,
  } as const);

export const publishDirectoryDraftSuccess = (
  payload: DirectoryListing
) =>
  ({
    payload,
    type: DIRECTORY_ACTIONS.PUBLISH_DRAFT_SUCCESS,
  } as const);

export const publishDirectoryDraftFailure = (
  payload: string
) =>
  ({
    payload,
    type: DIRECTORY_ACTIONS.PUBLISH_DRAFT_FAILURE,
  } as const);

export const fetchMyDirectoryListingsRequest = (
  payload: DirectoryListParams = {}
) =>
  ({
    payload,
    type: DIRECTORY_ACTIONS.FETCH_MY_LISTINGS_REQUEST,
  } as const);

export const fetchMyDirectoryListingsSuccess = (
  payload: DirectoryListResult
) =>
  ({
    payload,
    type: DIRECTORY_ACTIONS.FETCH_MY_LISTINGS_SUCCESS,
  } as const);

export const fetchMyDirectoryListingsFailure = (
  payload: string
) =>
  ({
    payload,
    type: DIRECTORY_ACTIONS.FETCH_MY_LISTINGS_FAILURE,
  } as const);

export const fetchDirectoryBookmarksRequest = (
  payload: DirectoryListParams = {}
) =>
  ({
    payload,
    type: DIRECTORY_ACTIONS.FETCH_BOOKMARKS_REQUEST,
  } as const);

export const fetchDirectoryBookmarksSuccess = (
  payload: DirectoryListResult
) =>
  ({
    payload,
    type: DIRECTORY_ACTIONS.FETCH_BOOKMARKS_SUCCESS,
  } as const);

export const fetchDirectoryBookmarksFailure = (
  payload: string
) =>
  ({
    payload,
    type: DIRECTORY_ACTIONS.FETCH_BOOKMARKS_FAILURE,
  } as const);

export const bookmarkDirectoryListingRequest = (
  id: string
) =>
  ({
    payload: { id },
    type: DIRECTORY_ACTIONS.BOOKMARK_REQUEST,
  } as const);

export const bookmarkDirectoryListingSuccess = (
  payload: DirectoryListing
) =>
  ({
    payload,
    type: DIRECTORY_ACTIONS.BOOKMARK_SUCCESS,
  } as const);

export const bookmarkDirectoryListingFailure = (
  payload: string
) =>
  ({
    payload,
    type: DIRECTORY_ACTIONS.BOOKMARK_FAILURE,
  } as const);

export const unbookmarkDirectoryListingRequest = (
  id: string
) =>
  ({
    payload: { id },
    type: DIRECTORY_ACTIONS.UNBOOKMARK_REQUEST,
  } as const);

export const unbookmarkDirectoryListingSuccess = (
  payload: DirectoryListing
) =>
  ({
    payload,
    type: DIRECTORY_ACTIONS.UNBOOKMARK_SUCCESS,
  } as const);

export const unbookmarkDirectoryListingFailure = (
  payload: string
) =>
  ({
    payload,
    type: DIRECTORY_ACTIONS.UNBOOKMARK_FAILURE,
  } as const);

export const recommendDirectoryListingRequest = (
  id: string
) =>
  ({
    payload: { id },
    type: DIRECTORY_ACTIONS.RECOMMEND_REQUEST,
  } as const);

export const recommendDirectoryListingSuccess = (
  payload: DirectoryListing
) =>
  ({
    payload,
    type: DIRECTORY_ACTIONS.RECOMMEND_SUCCESS,
  } as const);

export const recommendDirectoryListingFailure = (
  payload: string
) =>
  ({
    payload,
    type: DIRECTORY_ACTIONS.RECOMMEND_FAILURE,
  } as const);

export const unrecommendDirectoryListingRequest = (
  id: string
) =>
  ({
    payload: { id },
    type: DIRECTORY_ACTIONS.UNRECOMMEND_REQUEST,
  } as const);

export const unrecommendDirectoryListingSuccess = (
  payload: DirectoryListing
) =>
  ({
    payload,
    type: DIRECTORY_ACTIONS.UNRECOMMEND_SUCCESS,
  } as const);

export const unrecommendDirectoryListingFailure = (
  payload: string
) =>
  ({
    payload,
    type: DIRECTORY_ACTIONS.UNRECOMMEND_FAILURE,
  } as const);

export const contactDirectoryListingRequest = (
  id: string,
  payload: DirectoryContactPayload
) =>
  ({
    payload: { id, payload },
    type: DIRECTORY_ACTIONS.CONTACT_REQUEST,
  } as const);

export const contactDirectoryListingSuccess = (
  payload: { id: string }
) =>
  ({
    payload,
    type: DIRECTORY_ACTIONS.CONTACT_SUCCESS,
  } as const);

export const contactDirectoryListingFailure = (
  payload: string
) =>
  ({
    payload,
    type: DIRECTORY_ACTIONS.CONTACT_FAILURE,
  } as const);

export const shareDirectoryListingRequest = (
  id: string,
  channel = "system"
) =>
  ({
    payload: { channel, id },
    type: DIRECTORY_ACTIONS.SHARE_REQUEST,
  } as const);

export const shareDirectoryListingSuccess = (
  payload: DirectoryListing
) =>
  ({
    payload,
    type: DIRECTORY_ACTIONS.SHARE_SUCCESS,
  } as const);

export const shareDirectoryListingFailure = (
  payload: string
) =>
  ({
    payload,
    type: DIRECTORY_ACTIONS.SHARE_FAILURE,
  } as const);

export const viewDirectoryListingRequest = (
  id: string
) =>
  ({
    payload: { id },
    type: DIRECTORY_ACTIONS.VIEW_REQUEST,
  } as const);

export const viewDirectoryListingSuccess = (
  payload: { id: string }
) =>
  ({
    payload,
    type: DIRECTORY_ACTIONS.VIEW_SUCCESS,
  } as const);

export const viewDirectoryListingFailure = (
  payload: string
) =>
  ({
    payload,
    type: DIRECTORY_ACTIONS.VIEW_FAILURE,
  } as const);

export const reportDirectoryListingRequest = (
  id: string,
  payload: DirectoryReportPayload
) =>
  ({
    payload: { id, payload },
    type: DIRECTORY_ACTIONS.REPORT_REQUEST,
  } as const);

export const reportDirectoryListingSuccess = (
  payload: { id: string }
) =>
  ({
    payload,
    type: DIRECTORY_ACTIONS.REPORT_SUCCESS,
  } as const);

export const reportDirectoryListingFailure = (
  payload: string
) =>
  ({
    payload,
    type: DIRECTORY_ACTIONS.REPORT_FAILURE,
  } as const);

export const fetchDirectoryReviewsRequest = (
  id: string,
  params: {
    limit?: number;
    offset?: number;
    rating?: number;
    sort?: "newest" | "highest" | "lowest" | "helpful";
  } = {}
) =>
  ({
    payload: { id, params },
    type: DIRECTORY_ACTIONS.FETCH_REVIEWS_REQUEST,
  } as const);

export const fetchDirectoryReviewsSuccess = (
  id: string,
  payload: DirectoryReviewsResult
) =>
  ({
    payload: { id, result: payload },
    type: DIRECTORY_ACTIONS.FETCH_REVIEWS_SUCCESS,
  } as const);

export const fetchDirectoryReviewsFailure = (
  payload: string
) =>
  ({
    payload,
    type: DIRECTORY_ACTIONS.FETCH_REVIEWS_FAILURE,
  } as const);

export const submitDirectoryReviewRequest = (
  id: string,
  payload: DirectoryReviewPayload
) =>
  ({
    payload: { id, payload },
    type: DIRECTORY_ACTIONS.SUBMIT_REVIEW_REQUEST,
  } as const);

export const submitDirectoryReviewSuccess = (
  id: string,
  payload: DirectoryReviewsResult
) =>
  ({
    payload: { id, result: payload },
    type: DIRECTORY_ACTIONS.SUBMIT_REVIEW_SUCCESS,
  } as const);

export const submitDirectoryReviewFailure = (
  payload: string
) =>
  ({
    payload,
    type: DIRECTORY_ACTIONS.SUBMIT_REVIEW_FAILURE,
  } as const);

export const voteDirectoryReviewRequest = (
  id: string,
  payload: DirectoryReviewVotePayload,
  listingId?: string
) =>
  ({
    payload: { id, listingId, payload },
    type: DIRECTORY_ACTIONS.REVIEW_VOTE_REQUEST,
  } as const);

export const voteDirectoryReviewSuccess = () =>
  ({
    type: DIRECTORY_ACTIONS.REVIEW_VOTE_SUCCESS,
  } as const);

export const voteDirectoryReviewFailure = (
  payload: string
) =>
  ({
    payload,
    type: DIRECTORY_ACTIONS.REVIEW_VOTE_FAILURE,
  } as const);

export const clearDirectoryReviewVoteRequest = (
  id: string,
  listingId?: string
) =>
  ({
    payload: { id, listingId },
    type: DIRECTORY_ACTIONS.REVIEW_VOTE_CLEAR_REQUEST,
  } as const);

export const clearDirectoryReviewVoteSuccess = () =>
  ({
    type: DIRECTORY_ACTIONS.REVIEW_VOTE_CLEAR_SUCCESS,
  } as const);

export const clearDirectoryReviewVoteFailure = (
  payload: string
) =>
  ({
    payload,
    type: DIRECTORY_ACTIONS.REVIEW_VOTE_CLEAR_FAILURE,
  } as const);

export const updateDirectoryReviewRequest = (
  id: string,
  payload: Partial<DirectoryReviewPayload>,
  listingId?: string
) =>
  ({
    payload: { id, listingId, payload },
    type: DIRECTORY_ACTIONS.REVIEW_UPDATE_REQUEST,
  } as const);

export const updateDirectoryReviewSuccess = (
  id: string,
  payload: DirectoryReviewsResult
) =>
  ({
    payload: { id, result: payload },
    type: DIRECTORY_ACTIONS.REVIEW_UPDATE_SUCCESS,
  } as const);

export const updateDirectoryReviewFailure = (
  payload: string
) =>
  ({
    payload,
    type: DIRECTORY_ACTIONS.REVIEW_UPDATE_FAILURE,
  } as const);

export const deleteDirectoryReviewRequest = (
  id: string,
  listingId?: string
) =>
  ({
    payload: { id, listingId },
    type: DIRECTORY_ACTIONS.REVIEW_DELETE_REQUEST,
  } as const);

export const deleteDirectoryReviewSuccess = (
  id: string,
  payload: DirectoryReviewsResult
) =>
  ({
    payload: { id, result: payload },
    type: DIRECTORY_ACTIONS.REVIEW_DELETE_SUCCESS,
  } as const);

export const deleteDirectoryReviewFailure = (
  payload: string
) =>
  ({
    payload,
    type: DIRECTORY_ACTIONS.REVIEW_DELETE_FAILURE,
  } as const);
