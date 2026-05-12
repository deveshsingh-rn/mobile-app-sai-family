import { 
  FETCH_EXPERIENCES_REQUEST, FETCH_EXPERIENCES_SUCCESS, FETCH_EXPERIENCES_FAILURE,
  SEARCH_EXPERIENCES_REQUEST, SEARCH_EXPERIENCES_SUCCESS, SEARCH_EXPERIENCES_FAILURE,
  CREATE_EXPERIENCE_REQUEST, CREATE_EXPERIENCE_SUCCESS, CREATE_EXPERIENCE_FAILURE,
  TOGGLE_LIKE_REQUEST, TOGGLE_LIKE_SUCCESS, TOGGLE_LIKE_FAILURE
} from './types';

export const fetchExperiencesRequest = (params: { limit?: number; offset?: number; category?: string } = {}) => ({
  type: FETCH_EXPERIENCES_REQUEST,
  payload: params,
} as const);

export const fetchExperiencesSuccess = (experiences: any[]) => ({
  type: FETCH_EXPERIENCES_SUCCESS,
  payload: experiences,
} as const);

export const fetchExperiencesFailure = (error: string) => ({
  type: FETCH_EXPERIENCES_FAILURE,
  payload: error,
} as const);

export const toggleLikeRequest = (experienceId: string, userId: string) => ({
  type: TOGGLE_LIKE_REQUEST,
  payload: { experienceId, userId },
} as const);

export const toggleLikeSuccess = (experienceId: string, likes: number) => ({
  type: TOGGLE_LIKE_SUCCESS,
  payload: { experienceId, likes },
} as const);