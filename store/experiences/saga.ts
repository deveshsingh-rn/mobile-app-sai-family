import { call, put, takeLatest, all, fork } from 'redux-saga/effects';
import { Platform } from 'react-native';
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
    console.log('[Saga] handleFetchExperiences started', {
      platform: Platform.OS,
      payload: action.payload,
    });
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
    console.log('[Saga] Experiences fetched successfully:', { count: flattenedData.length });
    yield put(fetchExperiencesSuccess(flattenedData));
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to load experiences.';
    const isNetworkError = !error.response;
    
    console.error('[Saga] handleFetchExperiences failed', {
      message: errorMessage,
      isNetworkError,
      status: error.response?.status,
      code: error.code,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      fullURL: `${error.config?.baseURL}${error.config?.url}`,
      platform: Platform.OS,
    });

    if (isNetworkError) {
      console.error('[Saga] Network Error - Backend is unreachable!');
      console.error('[Saga] Please ensure:');
      console.error('1. Backend API is running: npm run dev (in backend-api folder)');
      console.error('2. Backend is listening on port 4000');
      if (Platform.OS === 'android') {
        console.error('3. Using correct URL for Android emulator: http://10.0.2.2:4000');
        console.error('   (If using physical device on same WiFi, use your machine IP instead)');
      } else if (Platform.OS === 'ios') {
        console.error('3. Using localhost:4000 for iOS simulator');
        console.error('   (If using physical device on same WiFi, use your machine IP instead)');
      }
      console.error('4. Update app.json if needed with the correct baseURL');
      console.error('5. Check TROUBLESHOOTING.md for more help');
    }

    yield put(fetchExperiencesFailure(errorMessage));
  }
}

function* handleToggleLike(action: any): Generator<any, void, any> {
  try {
    const { experienceId, userId } = action.payload;
    const data = yield call(apiToggleLike, experienceId, userId);
    yield put(toggleLikeSuccess(experienceId, data.likes || 0)); // update count from API response
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to toggle like.';
    const isNetworkError = !error.response;
    
    console.error('[Saga] handleToggleLike failed', {
      message: errorMessage,
      isNetworkError,
      status: error.response?.status,
      platform: Platform.OS,
    });

    if (isNetworkError) {
      console.error('[Saga] Network Error - Backend unreachable for like toggle');
    }
  }
}

export function* experiencesSaga() {
  yield takeLatest(FETCH_EXPERIENCES_REQUEST, handleFetchExperiences);
  yield takeLatest(TOGGLE_LIKE_REQUEST, handleToggleLike);
  // Add takeLatest hooks for other actions here
}