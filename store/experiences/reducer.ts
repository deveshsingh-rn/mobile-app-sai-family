import {
  CREATE_EXPERIENCE_FAILURE,
  CREATE_EXPERIENCE_REQUEST,
  CREATE_EXPERIENCE_SUCCESS,
  DEFAULT_EXPERIENCE_CATEGORIES,
  FETCH_EXPERIENCE_CATEGORIES_FAILURE,
  FETCH_EXPERIENCE_CATEGORIES_REQUEST,
  FETCH_EXPERIENCE_CATEGORIES_SUCCESS,
  FETCH_EXPERIENCES_FAILURE,
  FETCH_EXPERIENCES_REQUEST,
  FETCH_EXPERIENCES_SUCCESS,
  ExperiencesActionTypes,
  ExperiencesState,
  TOGGLE_LIKE_SUCCESS,
  UPDATE_EXPERIENCE_SUCCESS,
  DELETE_EXPERIENCE_SUCCESS,
} from "./types";

const initialState: ExperiencesState = {
  categories: DEFAULT_EXPERIENCE_CATEGORIES,
  categoriesLoading: false,
  feed: [],
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
              }
            : exp
        ),
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
