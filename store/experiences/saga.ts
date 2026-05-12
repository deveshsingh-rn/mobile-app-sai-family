import { call, put, takeLatest, all, fork } from 'redux-saga/effects';
import { 
  FETCH_EXPERIENCES_REQUEST, 
  TOGGLE_LIKE_REQUEST
} from './types';
import { 
  fetchExperiencesSuccess, 
  fetchExperiencesFailure, 
  toggleLikeSuccess 
} from './actions';
import { apiFetchExperiences, apiToggleLike } from '@/services/experiences';

function* handleFetchExperiences(action: any): Generator<any, void, any> {
  try {
    const response = yield call(apiFetchExperiences, action.payload);
    const experiences = response.experiences || [];

    const flattenedData = experiences.map((exp: any) => ({
      ...exp,
      authorName: exp.author?.name || null,
      authorHandle: exp.author?.handle || null,
      authorProfileImageUrl: exp.author?.profileImageUrl || null,
      likes: exp._count?.likes || 0,
      comments: exp._count?.comments || 0,
      reposts: exp._count?.reposts || 0,
      bookmarks: exp._count?.bookmarks || 0,
    }));
    yield put(fetchExperiencesSuccess(flattenedData));
  } catch (error: any) {
    console.error('SAGA_ERROR: handleFetchExperiences', error);
    yield put(fetchExperiencesFailure(error.message || 'Failed to load experiences.'));
  }
}

function* handleToggleLike(action: any): Generator<any, void, any> {
  try {
    const { experienceId, userId } = action.payload;
    const data = yield call(apiToggleLike, experienceId, userId);
    yield put(toggleLikeSuccess(experienceId, data.likes || 0)); // update count from API response
  } catch (error: any) {
    console.error('SAGA_ERROR: handleToggleLike', error);
  }
}

export function* experiencesSaga() {
  yield takeLatest(FETCH_EXPERIENCES_REQUEST, handleFetchExperiences);
  yield takeLatest(TOGGLE_LIKE_REQUEST, handleToggleLike);
  // Add takeLatest hooks for other actions here
}