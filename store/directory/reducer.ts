import {
  DIRECTORY_ACTIONS,
  DirectoryAction,
  DirectoryListing,
  DirectoryState,
} from "./types";

export const initialDirectoryState: DirectoryState = {
  bookmarks: [],
  bookmarksLoading: false,
  bookmarksPagination: null,
  categories: [],
  categoriesLoading: false,
  contactPendingIds: {},
  creating: false,
  currentDraftId: null,
  detail: null,
  draftsById: {},
  draftSaving: false,
  error: null,
  home: null,
  homeLoading: false,
  listingActionPendingIds: {},
  listings: [],
  listingsLoading: false,
  listingsPagination: null,
  myListings: [],
  myListingsLoading: false,
  myListingsPagination: null,
  recentReviews: [],
  recentSearches: [],
  recentSearchesLoading: false,
  reviewSummary: null,
  reviewsByListingId: {},
  reviewsLoadingIds: {},
  searchLoading: false,
  searchPagination: null,
  searchResults: [],
  similarListings: [],
  suggestions: [],
  suggestionsLoading: false,
  uploadedMedia: null,
  uploadingMedia: false,
};

function shouldAppend(payload: any) {
  return Boolean(
    payload?.pagination?.offset &&
      payload.pagination.offset > 0
  );
}

function getListings(payload: any): DirectoryListing[] {
  return (
    payload?.listings ||
    payload?.results ||
    payload?.data?.listings ||
    payload?.data?.results ||
    []
  );
}

function mergeById(
  current: DirectoryListing[],
  incoming: DirectoryListing[]
) {
  const seen = new Set<string>();

  return [...current, ...incoming].filter((item) => {
    if (!item?.id) {
      return true;
    }

    if (seen.has(item.id)) {
      return false;
    }

    seen.add(item.id);
    return true;
  });
}

function upsertListing(
  list: DirectoryListing[],
  listing?: DirectoryListing | null
) {
  if (!listing?.id) {
    return list;
  }

  const exists = list.some(
    (item) => item.id === listing.id
  );

  return exists
    ? list.map((item) =>
        item.id === listing.id
          ? { ...item, ...listing }
          : item
      )
    : [listing, ...list];
}

function updateListingFlag(
  list: DirectoryListing[],
  id: string,
  changes: Partial<DirectoryListing>
) {
  return list.map((item) =>
    item.id === id
      ? {
          ...item,
          ...changes,
        }
      : item
  );
}

function removePending(
  current: Record<string, boolean>,
  id?: string
) {
  const next = { ...current };

  if (id) {
    delete next[id];
  }

  return next;
}

export function directoryReducer(
  state: DirectoryState = initialDirectoryState,
  action: DirectoryAction
): DirectoryState {
  switch (action.type) {
    case DIRECTORY_ACTIONS.FETCH_CATEGORIES_REQUEST:
      return {
        ...state,
        categoriesLoading: true,
        error: null,
      };

    case DIRECTORY_ACTIONS.FETCH_HOME_REQUEST:
      return {
        ...state,
        error: null,
        homeLoading: true,
      };

    case DIRECTORY_ACTIONS.FETCH_LISTINGS_REQUEST:
      return {
        ...state,
        error: null,
        listings:
          !action.payload?.offset ||
          action.payload.offset === 0
            ? []
            : state.listings,
        listingsPagination:
          !action.payload?.offset ||
          action.payload.offset === 0
            ? null
            : state.listingsPagination,
        listingsLoading: true,
      };

    case DIRECTORY_ACTIONS.FETCH_DETAIL_REQUEST:
      return {
        ...state,
        error: null,
        listingsLoading: true,
      };

    case DIRECTORY_ACTIONS.SEARCH_REQUEST:
      return {
        ...state,
        error: null,
        searchLoading: true,
      };

    case DIRECTORY_ACTIONS.FETCH_SUGGESTIONS_REQUEST:
      return {
        ...state,
        error: null,
        suggestionsLoading: true,
      };

    case DIRECTORY_ACTIONS.FETCH_RECENT_SEARCHES_REQUEST:
    case DIRECTORY_ACTIONS.ADD_RECENT_SEARCH_REQUEST:
    case DIRECTORY_ACTIONS.CLEAR_RECENT_SEARCHES_REQUEST:
      return {
        ...state,
        error: null,
        recentSearchesLoading: true,
      };

    case DIRECTORY_ACTIONS.CREATE_LISTING_REQUEST:
    case DIRECTORY_ACTIONS.UPDATE_LISTING_REQUEST:
      return {
        ...state,
        creating: true,
        error: null,
      };

    case DIRECTORY_ACTIONS.UPLOAD_MEDIA_REQUEST:
      return {
        ...state,
        error: null,
        uploadingMedia: true,
      };

    case DIRECTORY_ACTIONS.CREATE_DRAFT_REQUEST:
    case DIRECTORY_ACTIONS.UPDATE_DRAFT_REQUEST:
    case DIRECTORY_ACTIONS.PUBLISH_DRAFT_REQUEST:
      return {
        ...state,
        draftSaving: true,
        error: null,
      };

    case DIRECTORY_ACTIONS.FETCH_MY_LISTINGS_REQUEST:
      return {
        ...state,
        error: null,
        myListingsLoading: true,
      };

    case DIRECTORY_ACTIONS.FETCH_BOOKMARKS_REQUEST:
      return {
        ...state,
        bookmarksLoading: true,
        error: null,
      };

    case DIRECTORY_ACTIONS.BOOKMARK_REQUEST:
    case DIRECTORY_ACTIONS.UNBOOKMARK_REQUEST:
    case DIRECTORY_ACTIONS.RECOMMEND_REQUEST:
    case DIRECTORY_ACTIONS.UNRECOMMEND_REQUEST:
    case DIRECTORY_ACTIONS.SHARE_REQUEST:
    case DIRECTORY_ACTIONS.REPORT_REQUEST:
    case DIRECTORY_ACTIONS.DELETE_LISTING_REQUEST:
      return {
        ...state,
        error: null,
        listingActionPendingIds: {
          ...state.listingActionPendingIds,
          [action.payload?.id]: true,
        },
      };

    case DIRECTORY_ACTIONS.CONTACT_REQUEST:
      return {
        ...state,
        contactPendingIds: {
          ...state.contactPendingIds,
          [action.payload?.id]: true,
        },
        error: null,
      };

    case DIRECTORY_ACTIONS.FETCH_REVIEWS_REQUEST:
    case DIRECTORY_ACTIONS.SUBMIT_REVIEW_REQUEST:
    case DIRECTORY_ACTIONS.REVIEW_UPDATE_REQUEST:
    case DIRECTORY_ACTIONS.REVIEW_DELETE_REQUEST:
      return {
        ...state,
        error: null,
        reviewsLoadingIds: {
          ...state.reviewsLoadingIds,
          [action.payload?.id]: true,
        },
      };

    case DIRECTORY_ACTIONS.FETCH_CATEGORIES_SUCCESS:
      return {
        ...state,
        categories: action.payload || [],
        categoriesLoading: false,
      };

    case DIRECTORY_ACTIONS.FETCH_HOME_SUCCESS:
      return {
        ...state,
        home: action.payload,
        homeLoading: false,
      };

    case DIRECTORY_ACTIONS.FETCH_LISTINGS_SUCCESS: {
      const listings = getListings(action.payload);

      return {
        ...state,
        listings: shouldAppend(action.payload)
          ? mergeById(state.listings, listings)
          : listings,
        listingsLoading: false,
        listingsPagination:
          action.payload?.pagination || null,
      };
    }

    case DIRECTORY_ACTIONS.FETCH_DETAIL_SUCCESS:
      return {
        ...state,
        detail: action.payload?.listing || null,
        listingsLoading: false,
        recentReviews:
          action.payload?.recentReviews || [],
        reviewSummary:
          action.payload?.reviewSummary || null,
        similarListings:
          action.payload?.similarListings || [],
      };

    case DIRECTORY_ACTIONS.SEARCH_SUCCESS: {
      const listings = getListings(action.payload);

      return {
        ...state,
        searchLoading: false,
        searchPagination:
          action.payload?.pagination || null,
        searchResults: shouldAppend(action.payload)
          ? mergeById(state.searchResults, listings)
          : listings,
        suggestions:
          action.payload?.suggestions ||
          state.suggestions,
      };
    }

    case DIRECTORY_ACTIONS.FETCH_SUGGESTIONS_SUCCESS:
      return {
        ...state,
        suggestions: action.payload || [],
        suggestionsLoading: false,
      };

    case DIRECTORY_ACTIONS.FETCH_RECENT_SEARCHES_SUCCESS:
    case DIRECTORY_ACTIONS.ADD_RECENT_SEARCH_SUCCESS:
      return {
        ...state,
        recentSearches: action.payload || [],
        recentSearchesLoading: false,
      };

    case DIRECTORY_ACTIONS.CLEAR_RECENT_SEARCHES_SUCCESS:
      return {
        ...state,
        recentSearches: [],
        recentSearchesLoading: false,
      };

    case DIRECTORY_ACTIONS.CREATE_LISTING_SUCCESS:
    case DIRECTORY_ACTIONS.UPDATE_LISTING_SUCCESS:
    case DIRECTORY_ACTIONS.PUBLISH_DRAFT_SUCCESS:
      return {
        ...state,
        creating: false,
        detail: action.payload,
        draftSaving: false,
        listings: upsertListing(
          state.listings,
          action.payload
        ),
        myListings: upsertListing(
          state.myListings,
          action.payload
        ),
      };

    case DIRECTORY_ACTIONS.DELETE_LISTING_SUCCESS:
      return {
        ...state,
        listingActionPendingIds: removePending(
          state.listingActionPendingIds,
          action.payload?.id
        ),
        listings: state.listings.filter(
          (item) => item.id !== action.payload?.id
        ),
        myListings: state.myListings.filter(
          (item) => item.id !== action.payload?.id
        ),
      };

    case DIRECTORY_ACTIONS.UPLOAD_MEDIA_SUCCESS:
      return {
        ...state,
        uploadedMedia: action.payload,
        uploadingMedia: false,
      };

    case DIRECTORY_ACTIONS.CREATE_DRAFT_SUCCESS:
    case DIRECTORY_ACTIONS.UPDATE_DRAFT_SUCCESS:
      return {
        ...state,
        currentDraftId: action.payload?.id || null,
        draftSaving: false,
        draftsById: action.payload?.id
          ? {
              ...state.draftsById,
              [action.payload.id]: action.payload,
            }
          : state.draftsById,
      };

    case DIRECTORY_ACTIONS.FETCH_MY_LISTINGS_SUCCESS: {
      const listings = getListings(action.payload);

      return {
        ...state,
        myListings: shouldAppend(action.payload)
          ? mergeById(state.myListings, listings)
          : listings,
        myListingsLoading: false,
        myListingsPagination:
          action.payload?.pagination || null,
      };
    }

    case DIRECTORY_ACTIONS.FETCH_BOOKMARKS_SUCCESS: {
      const listings = getListings(action.payload);

      return {
        ...state,
        bookmarks: shouldAppend(action.payload)
          ? mergeById(state.bookmarks, listings)
          : listings,
        bookmarksLoading: false,
        bookmarksPagination:
          action.payload?.pagination || null,
      };
    }

    case DIRECTORY_ACTIONS.BOOKMARK_SUCCESS:
    case DIRECTORY_ACTIONS.UNBOOKMARK_SUCCESS:
    case DIRECTORY_ACTIONS.RECOMMEND_SUCCESS:
    case DIRECTORY_ACTIONS.UNRECOMMEND_SUCCESS:
    case DIRECTORY_ACTIONS.SHARE_SUCCESS:
      return {
        ...state,
        detail:
          state.detail?.id === action.payload?.id
            ? {
                ...state.detail,
                ...action.payload,
              }
            : state.detail,
        listingActionPendingIds: removePending(
          state.listingActionPendingIds,
          action.payload?.id
        ),
        listings: updateListingFlag(
          state.listings,
          action.payload?.id,
          action.payload
        ),
        searchResults: updateListingFlag(
          state.searchResults,
          action.payload?.id,
          action.payload
        ),
      };

    case DIRECTORY_ACTIONS.CONTACT_SUCCESS:
      return {
        ...state,
        contactPendingIds: removePending(
          state.contactPendingIds,
          action.payload?.id
        ),
      };

    case DIRECTORY_ACTIONS.REPORT_SUCCESS:
      return {
        ...state,
        listingActionPendingIds: removePending(
          state.listingActionPendingIds,
          action.payload?.id
        ),
      };

    case DIRECTORY_ACTIONS.FETCH_REVIEWS_SUCCESS:
    case DIRECTORY_ACTIONS.SUBMIT_REVIEW_SUCCESS:
    case DIRECTORY_ACTIONS.REVIEW_UPDATE_SUCCESS:
    case DIRECTORY_ACTIONS.REVIEW_DELETE_SUCCESS:
      return {
        ...state,
        reviewsByListingId: {
          ...state.reviewsByListingId,
          [action.payload?.id]: action.payload?.result,
        },
        reviewsLoadingIds: removePending(
          state.reviewsLoadingIds,
          action.payload?.id
        ),
      };

    case DIRECTORY_ACTIONS.VIEW_SUCCESS:
    case DIRECTORY_ACTIONS.REVIEW_VOTE_SUCCESS:
    case DIRECTORY_ACTIONS.REVIEW_VOTE_CLEAR_SUCCESS:
      return state;

    case DIRECTORY_ACTIONS.FETCH_CATEGORIES_FAILURE:
    case DIRECTORY_ACTIONS.FETCH_HOME_FAILURE:
    case DIRECTORY_ACTIONS.FETCH_LISTINGS_FAILURE:
    case DIRECTORY_ACTIONS.FETCH_DETAIL_FAILURE:
    case DIRECTORY_ACTIONS.SEARCH_FAILURE:
    case DIRECTORY_ACTIONS.FETCH_SUGGESTIONS_FAILURE:
    case DIRECTORY_ACTIONS.FETCH_RECENT_SEARCHES_FAILURE:
    case DIRECTORY_ACTIONS.ADD_RECENT_SEARCH_FAILURE:
    case DIRECTORY_ACTIONS.CLEAR_RECENT_SEARCHES_FAILURE:
    case DIRECTORY_ACTIONS.CREATE_LISTING_FAILURE:
    case DIRECTORY_ACTIONS.UPDATE_LISTING_FAILURE:
    case DIRECTORY_ACTIONS.DELETE_LISTING_FAILURE:
    case DIRECTORY_ACTIONS.UPLOAD_MEDIA_FAILURE:
    case DIRECTORY_ACTIONS.CREATE_DRAFT_FAILURE:
    case DIRECTORY_ACTIONS.UPDATE_DRAFT_FAILURE:
    case DIRECTORY_ACTIONS.PUBLISH_DRAFT_FAILURE:
    case DIRECTORY_ACTIONS.FETCH_MY_LISTINGS_FAILURE:
    case DIRECTORY_ACTIONS.FETCH_BOOKMARKS_FAILURE:
    case DIRECTORY_ACTIONS.BOOKMARK_FAILURE:
    case DIRECTORY_ACTIONS.UNBOOKMARK_FAILURE:
    case DIRECTORY_ACTIONS.RECOMMEND_FAILURE:
    case DIRECTORY_ACTIONS.UNRECOMMEND_FAILURE:
    case DIRECTORY_ACTIONS.CONTACT_FAILURE:
    case DIRECTORY_ACTIONS.SHARE_FAILURE:
    case DIRECTORY_ACTIONS.VIEW_FAILURE:
    case DIRECTORY_ACTIONS.REPORT_FAILURE:
    case DIRECTORY_ACTIONS.FETCH_REVIEWS_FAILURE:
    case DIRECTORY_ACTIONS.SUBMIT_REVIEW_FAILURE:
    case DIRECTORY_ACTIONS.REVIEW_UPDATE_FAILURE:
    case DIRECTORY_ACTIONS.REVIEW_DELETE_FAILURE:
    case DIRECTORY_ACTIONS.REVIEW_VOTE_FAILURE:
    case DIRECTORY_ACTIONS.REVIEW_VOTE_CLEAR_FAILURE:
      return {
        ...state,
        bookmarksLoading: false,
        categoriesLoading: false,
        creating: false,
        draftSaving: false,
        error: action.payload || "Directory request failed.",
        homeLoading: false,
        listingsLoading: false,
        myListingsLoading: false,
        recentSearchesLoading: false,
        searchLoading: false,
        suggestionsLoading: false,
        uploadingMedia: false,
      };

    default:
      return state;
  }
}
