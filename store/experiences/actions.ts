import {
  CREATE_EXPERIENCE_FAILURE,
  CREATE_EXPERIENCE_REQUEST,
  CREATE_EXPERIENCE_SUCCESS,
  FETCH_EXPERIENCES_FAILURE,
  FETCH_EXPERIENCES_REQUEST,
  FETCH_EXPERIENCES_SUCCESS,
  TOGGLE_LIKE_SUCCESS,
  CreateExperiencePayload,
  Experience,
} from "./types";

export const fetchExperiencesRequest = (
  params = {}
) => ({
  type: FETCH_EXPERIENCES_REQUEST,
  payload: params,
});

export const fetchExperiencesSuccess = (
  payload: Experience[]
) => ({
  type: FETCH_EXPERIENCES_SUCCESS,
  payload,
});

export const fetchExperiencesFailure = (
  payload: string
) => ({
  type: FETCH_EXPERIENCES_FAILURE,
  payload,
});

export const createExperienceRequest = (
  payload: CreateExperiencePayload
) => ({
  type: CREATE_EXPERIENCE_REQUEST,
  payload,
});

export const createExperienceSuccess = (
  payload: Experience
) => ({
  type: CREATE_EXPERIENCE_SUCCESS,
  payload,
});

export const createExperienceFailure = (
  payload: string
) => ({
  type: CREATE_EXPERIENCE_FAILURE,
  payload,
});

export const toggleLikeSuccess = (
  experienceId: string,
  likes: number
) => ({
  type: TOGGLE_LIKE_SUCCESS,
  payload: {
    experienceId,
    likes,
  },
});