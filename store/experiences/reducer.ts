import {
  CREATE_EXPERIENCE_FAILURE,
  CREATE_EXPERIENCE_REQUEST,
  CREATE_EXPERIENCE_SUCCESS,
  FETCH_EXPERIENCES_FAILURE,
  FETCH_EXPERIENCES_REQUEST,
  FETCH_EXPERIENCES_SUCCESS,
  ExperiencesActionTypes,
  ExperiencesState,
  TOGGLE_LIKE_SUCCESS,
} from "./types";

const initialState: ExperiencesState = {
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

    default:
      return state;
  }
};