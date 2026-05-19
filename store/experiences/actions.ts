// import {
//   CREATE_EXPERIENCE_FAILURE,
//   CREATE_EXPERIENCE_REQUEST,
//   CREATE_EXPERIENCE_SUCCESS,
//   FETCH_EXPERIENCES_FAILURE,
//   FETCH_EXPERIENCES_REQUEST,
//   FETCH_EXPERIENCES_SUCCESS,
//   TOGGLE_LIKE_SUCCESS,
//   CreateExperiencePayload,
//   Experience,
//   DELETE_EXPERIENCE_SUCCESS,
//   DELETE_EXPERIENCE_FAILURE,
//   DELETE_EXPERIENCE_REQUEST,
//   UPDATE_EXPERIENCE_FAILURE,
//   UPDATE_EXPERIENCE_SUCCESS,
//   UPDATE_EXPERIENCE_REQUEST,
//   UpdateExperiencePayload,
// } from "./types";

// export const fetchExperiencesRequest = (
//   params = {}
// ) => ({
//   type: FETCH_EXPERIENCES_REQUEST,
//   payload: params,
// });

// export const fetchExperiencesSuccess = (
//   payload: Experience[]
// ) => ({
//   type: FETCH_EXPERIENCES_SUCCESS,
//   payload,
// });

// export const fetchExperiencesFailure = (
//   payload: string
// ) => ({
//   type: FETCH_EXPERIENCES_FAILURE,
//   payload,
// });

// export const createExperienceRequest = (
//   payload: CreateExperiencePayload
// ) => ({
//   type: CREATE_EXPERIENCE_REQUEST,
//   payload,
// });

// export const createExperienceSuccess = (
//   payload: Experience
// ) => ({
//   type: CREATE_EXPERIENCE_SUCCESS,
//   payload,
// });

// export const createExperienceFailure = (
//   payload: string
// ) => ({
//   type: CREATE_EXPERIENCE_FAILURE,
//   payload,
// });

// export const toggleLikeSuccess = (
//   experienceId: string,
//   likes: number
// ) => ({
//   type: TOGGLE_LIKE_SUCCESS,
//   payload: {
//     experienceId,
//     likes,
//   },
// });

// export const updateExperienceRequest = (
//   payload: UpdateExperiencePayload
// ) => ({
//   type: UPDATE_EXPERIENCE_REQUEST,
//   payload,
// });

// export const updateExperienceSuccess = (
//   payload: Experience
// ) => ({
//   type: UPDATE_EXPERIENCE_SUCCESS,
//   payload,
// });

// export const updateExperienceFailure = (
//   payload: string
// ) => ({
//   type: UPDATE_EXPERIENCE_FAILURE,
//   payload,
// });



// export const deleteExperienceRequest = (
//   id: string
// ) => ({
//   type: DELETE_EXPERIENCE_REQUEST,
//   payload: { id },
// });

// export const deleteExperienceSuccess = (
//   id: string
// ) => ({
//   type: DELETE_EXPERIENCE_SUCCESS,
//   payload: { id },
// });

// export const deleteExperienceFailure = (
//   payload: string
// ) => ({
//   type: DELETE_EXPERIENCE_FAILURE,
//   payload,
// });



import {
  CREATE_EXPERIENCE_FAILURE,
  CREATE_EXPERIENCE_REQUEST,
  CREATE_EXPERIENCE_SUCCESS,
  FETCH_EXPERIENCES_FAILURE,
  FETCH_EXPERIENCES_REQUEST,
  FETCH_EXPERIENCES_SUCCESS,
  FETCH_EXPERIENCE_CATEGORIES_FAILURE,
  FETCH_EXPERIENCE_CATEGORIES_REQUEST,
  FETCH_EXPERIENCE_CATEGORIES_SUCCESS,
  TOGGLE_LIKE_SUCCESS,
  TOGGLE_LIKE_REQUEST,
  TOGGLE_BOOKMARK_REQUEST,
  TOGGLE_REPOST_REQUEST,
  CreateExperiencePayload,
  Experience,
  ExperienceCategory,
  DELETE_EXPERIENCE_SUCCESS,
  DELETE_EXPERIENCE_FAILURE,
  DELETE_EXPERIENCE_REQUEST,
  UPDATE_EXPERIENCE_FAILURE,
  UPDATE_EXPERIENCE_SUCCESS,
  UPDATE_EXPERIENCE_REQUEST,
  UpdateExperiencePayload,
} from "./types";

// ───────────────── FETCH EXPERIENCES ─────────────────

export const fetchExperiencesRequest = (
  params: {
    limit?: number;
    offset?: number;
    category?: string;
  } = {}
) =>
  ({
    type: FETCH_EXPERIENCES_REQUEST,
    payload: params,
  } as const);

export const fetchExperiencesSuccess = (
  payload: Experience[]
) =>
  ({
    type: FETCH_EXPERIENCES_SUCCESS,
    payload,
  } as const);

export const fetchExperiencesFailure = (
  payload: string
) =>
  ({
    type: FETCH_EXPERIENCES_FAILURE,
    payload,
  } as const);

// ───────────────── FETCH CATEGORIES ─────────────────

export const fetchExperienceCategoriesRequest = () =>
  ({
    type: FETCH_EXPERIENCE_CATEGORIES_REQUEST,
  } as const);

export const fetchExperienceCategoriesSuccess = (
  payload: ExperienceCategory[]
) =>
  ({
    type: FETCH_EXPERIENCE_CATEGORIES_SUCCESS,
    payload,
  } as const);

export const fetchExperienceCategoriesFailure = (
  payload: string
) =>
  ({
    type: FETCH_EXPERIENCE_CATEGORIES_FAILURE,
    payload,
  } as const);

// ───────────────── CREATE EXPERIENCE ─────────────────

export const createExperienceRequest = (
  payload: CreateExperiencePayload
) =>
  ({
    type: CREATE_EXPERIENCE_REQUEST,
    payload,
  } as const);

export const createExperienceSuccess = (
  payload: Experience
) =>
  ({
    type: CREATE_EXPERIENCE_SUCCESS,
    payload,
  } as const);

export const createExperienceFailure = (
  payload: string
) =>
  ({
    type: CREATE_EXPERIENCE_FAILURE,
    payload,
  } as const);

// ───────────────── TOGGLE LIKE ─────────────────

export const toggleLikeSuccess = (
  experienceId: string,
  likes: number
) =>
  ({
    type: TOGGLE_LIKE_SUCCESS,
    payload: {
      experienceId,
      likes,
    },
  } as const);

export const toggleLikeRequest = (
  experienceId: string,
  userId?: string
) =>
  ({
    type: TOGGLE_LIKE_REQUEST,
    payload: {
      experienceId,
      userId,
    },
  } as const);

export const toggleBookmarkRequest = (
  experienceId: string,
  userId?: string
) =>
  ({
    type: TOGGLE_BOOKMARK_REQUEST,
    payload: {
      experienceId,
      userId,
    },
  } as const);

export const toggleRepostRequest = (
  experienceId: string,
  userId?: string
) =>
  ({
    type: TOGGLE_REPOST_REQUEST,
    payload: {
      experienceId,
      userId,
    },
  } as const);

// ───────────────── UPDATE EXPERIENCE ─────────────────

export const updateExperienceRequest = (
  payload: UpdateExperiencePayload
) =>
  ({
    type: UPDATE_EXPERIENCE_REQUEST,
    payload,
  } as const);

export const updateExperienceSuccess = (
  payload: Experience
) =>
  ({
    type: UPDATE_EXPERIENCE_SUCCESS,
    payload,
  } as const);

export const updateExperienceFailure = (
  payload: string
) =>
  ({
    type: UPDATE_EXPERIENCE_FAILURE,
    payload,
  } as const);

// ───────────────── DELETE EXPERIENCE ─────────────────

export const deleteExperienceRequest = (
  id: string
) =>
  ({
    type: DELETE_EXPERIENCE_REQUEST,
    payload: { id },
  } as const);

export const deleteExperienceSuccess = (
  id: string
) =>
  ({
    type: DELETE_EXPERIENCE_SUCCESS,
    payload: { id },
  } as const);

export const deleteExperienceFailure = (
  payload: string
) =>
  ({
    type: DELETE_EXPERIENCE_FAILURE,
    payload,
  } as const);

export const fetchExperienceDetailRequest = (
  id: string
) =>
  ({
    type: "FETCH_EXPERIENCE_DETAIL_REQUEST",
    payload: {
      id,
    },
  } as const);

export const addCommentRequest = (
  experienceId: string,
  content: string,
  userId?: string
) =>
  ({
    type: "ADD_EXPERIENCE_COMMENT_REQUEST",
    payload: {
      content,
      experienceId,
      userId,
    },
  } as const);
