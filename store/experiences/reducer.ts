import {
  CREATE_EXPERIENCE_FAILURE,
  CREATE_EXPERIENCE_REQUEST,
  CREATE_EXPERIENCE_SUCCESS,
  ADD_EXPERIENCE_COMMENT_FAILURE,
  ADD_EXPERIENCE_COMMENT_REQUEST,
  ADD_EXPERIENCE_COMMENT_SUCCESS,
  CLEAR_EXPERIENCE_SEARCH,
  DEFAULT_EXPERIENCE_CATEGORIES,
  FETCH_EXPERIENCE_CATEGORIES_FAILURE,
  FETCH_EXPERIENCE_CATEGORIES_REQUEST,
  FETCH_EXPERIENCE_CATEGORIES_SUCCESS,
  FETCH_EXPERIENCE_DETAIL_FAILURE,
  FETCH_EXPERIENCE_DETAIL_REQUEST,
  FETCH_EXPERIENCE_DETAIL_SUCCESS,
  FETCH_EXPERIENCES_FAILURE,
  FETCH_EXPERIENCES_REQUEST,
  FETCH_EXPERIENCES_SUCCESS,
  SEARCH_EXPERIENCES_FAILURE,
  SEARCH_EXPERIENCES_REQUEST,
  SEARCH_EXPERIENCES_SUCCESS,
  ExperiencesActionTypes,
  ExperiencesState,
  TOGGLE_LIKE_SUCCESS,
  UPDATE_EXPERIENCE_SUCCESS,
  DELETE_EXPERIENCE_SUCCESS,
} from "./types";

const initialState: ExperiencesState = {
  addingComment: false,
  categories: DEFAULT_EXPERIENCE_CATEGORIES,
  categoriesLoading: false,
  comments: [],
  detail: null,
  feed: [],
  searchError: null,
  searchHasMore: false,
  searchLoading: false,
  searchResults: [],
  loading: false,
  creating: false,
  error: null,
};

export const experiencesReducer = (
  state = initialState,
  action: ExperiencesActionTypes
): ExperiencesState => {
  switch (action.type) {
    case FETCH_EXPERIENCES_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case FETCH_EXPERIENCES_SUCCESS:
      return {
        ...state,
        loading: false,
        feed: action.payload,
      };

    case FETCH_EXPERIENCES_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case FETCH_EXPERIENCE_CATEGORIES_REQUEST:
      return {
        ...state,
        categoriesLoading: true,
      };

    case FETCH_EXPERIENCE_CATEGORIES_SUCCESS:
      return {
        ...state,
        categories:
          action.payload.length > 0
            ? action.payload
            : state.categories,
        categoriesLoading: false,
      };

    case FETCH_EXPERIENCE_CATEGORIES_FAILURE:
      return {
        ...state,
        categoriesLoading: false,
      };

    case FETCH_EXPERIENCE_DETAIL_REQUEST:
      return {
        ...state,
        detail: null,
        comments: [],
        loading: true,
        error: null,
      };

    case FETCH_EXPERIENCE_DETAIL_SUCCESS:
      return {
        ...state,
        detail: action.payload.experience,
        comments: action.payload.comments,
        loading: false,
      };

    case FETCH_EXPERIENCE_DETAIL_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case SEARCH_EXPERIENCES_REQUEST:
      return {
        ...state,
        searchError: null,
        searchLoading: true,
        searchHasMore:
          action.payload.offset &&
          action.payload.offset > 0
            ? state.searchHasMore
            : false,
        searchResults:
          action.payload.offset &&
          action.payload.offset > 0
            ? state.searchResults
            : [],
      };

    case SEARCH_EXPERIENCES_SUCCESS:
      return {
        ...state,
        searchHasMore:
          action.payload.hasMore,
        searchLoading: false,
        searchResults:
          action.payload.offset > 0
            ? [
                ...state.searchResults,
                ...action.payload.results,
              ]
            : action.payload.results,
      };

    case SEARCH_EXPERIENCES_FAILURE:
      return {
        ...state,
        searchError: action.payload,
        searchLoading: false,
      };

    case CLEAR_EXPERIENCE_SEARCH:
      return {
        ...state,
        searchError: null,
        searchHasMore: false,
        searchLoading: false,
        searchResults: [],
      };

    case ADD_EXPERIENCE_COMMENT_REQUEST:
      return {
        ...state,
        addingComment: true,
        error: null,
      };

    case ADD_EXPERIENCE_COMMENT_SUCCESS:
      return {
        ...state,
        addingComment: false,
        comments: [
          action.payload,
          ...state.comments,
        ],
        detail: state.detail
          ? {
              ...state.detail,
              comments:
                state.detail.comments + 1,
            }
          : state.detail,
      };

    case ADD_EXPERIENCE_COMMENT_FAILURE:
      return {
        ...state,
        addingComment: false,
        error: action.payload,
      };

    case CREATE_EXPERIENCE_REQUEST:
      return {
        ...state,
        creating: true,
        error: null,
      };

    case CREATE_EXPERIENCE_SUCCESS:
      return {
        ...state,
        creating: false,
        feed: [
          action.payload,
          ...state.feed,
        ],
      };

    case CREATE_EXPERIENCE_FAILURE:
      return {
        ...state,
        creating: false,
        error: action.payload,
      };

    case TOGGLE_LIKE_SUCCESS:
      return {
        ...state,

        feed: state.feed.map((exp) =>
          exp.id ===
          action.payload.experienceId
            ? {
                ...exp,
                likes:
                  action.payload.likes,
                likedByMe:
                  action.payload.likedByMe,
              }
            : exp
        ),
        searchResults: state.searchResults.map((exp) =>
          exp.id ===
          action.payload.experienceId
            ? {
                ...exp,
                likes:
                  action.payload.likes,
                likedByMe:
                  action.payload.likedByMe,
              }
            : exp
        ),
        detail:
          state.detail?.id ===
          action.payload.experienceId
            ? {
                ...state.detail,
                likes: action.payload.likes,
                likedByMe:
                  action.payload.likedByMe,
              }
            : state.detail,
      };

      case UPDATE_EXPERIENCE_SUCCESS:
  return {
    ...state,

    feed: state.feed.map((exp) =>
      exp.id === action.payload.id
        ? action.payload
        : exp
    ),
  };

  case DELETE_EXPERIENCE_SUCCESS:
  return {
    ...state,

    feed: state.feed.filter(
      (exp) =>
        exp.id !== action.payload.id
    ),
  };

    default:
      return state;
  }
};
