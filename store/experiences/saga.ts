import {
  call,
  put,
  takeLatest,
} from "redux-saga/effects";

import {
  apiCreateExperience,
  apiDeleteExperience,
  apiFetchExperiences,
  apiToggleBookmark,
  apiToggleLike,
  apiToggleRepost,
  apiUpdateExperience,
} from "@/services/experiences";

import {
  createExperienceFailure,
  createExperienceSuccess,
  deleteExperienceFailure,
  deleteExperienceSuccess,
  fetchExperiencesFailure,
  fetchExperiencesSuccess,
  toggleLikeSuccess,
  updateExperienceFailure,
  updateExperienceSuccess,
} from "./actions";

import {
  CREATE_EXPERIENCE_REQUEST,
  DELETE_EXPERIENCE_REQUEST,
  FETCH_EXPERIENCES_REQUEST,
  TOGGLE_BOOKMARK_REQUEST,
  TOGGLE_LIKE_REQUEST,
  TOGGLE_REPOST_REQUEST,
  UPDATE_EXPERIENCE_REQUEST,
} from "./types";

function flattenExperience(exp: any) {
  return {
    ...exp,

    authorName:
      exp.author?.name || null,

    authorHandle:
      exp.author?.handle || null,

    authorProfileImageUrl:
      exp.author?.profileImageUrl ||
      null,

    likes:
      exp._count?.likes || 0,

    comments:
      exp._count?.comments || 0,

    reposts:
      exp._count?.reposts || 0,

    bookmarks:
      exp._count?.bookmarks || 0,
  };
}

function* handleFetchExperiences(
  action: any
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiFetchExperiences,
      action.payload
    );

    const flattened =
      response.experiences.map(
        flattenExperience
      );

    yield put(
      fetchExperiencesSuccess(
        flattened
      )
    );
  } catch (error: any) {
    const message =
      error.response?.data?.error
        ?.message ||
      error.message ||
      "Failed to fetch experiences.";

    yield put(
      fetchExperiencesFailure(
        message
      )
    );
  }
}

function* handleCreateExperience(
  action: any
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiCreateExperience,
      action.payload
    );

    const flattened =
      flattenExperience(
        response.experience
      );

    yield put(
      createExperienceSuccess(
        flattened
      )
    );
  } catch (error: any) {
    const message =
      error.response?.data?.error
        ?.message ||
      error.message ||
      "Failed to create experience.";

    yield put(
      createExperienceFailure(
        message
      )
    );
  }
}



function* handleUpdateExperience(
  action: any
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiUpdateExperience,
      action.payload
    );

    const flattened =
      flattenExperience(
        response.experience
      );

    yield put(
      updateExperienceSuccess(
        flattened
      )
    );
  } catch (error: any) {
    const message =
      error.response?.data?.error
        ?.message ||
      error.message ||
      "Failed to update post.";

    yield put(
      updateExperienceFailure(
        message
      )
    );
  }
}


function* handleDeleteExperience(
  action: any
): Generator<any, void, any> {
  try {
    yield call(
      apiDeleteExperience,
      action.payload.id
    );

    yield put(
      deleteExperienceSuccess(
        action.payload.id
      )
    );
  } catch (error: any) {
    const message =
      error.response?.data?.error
        ?.message ||
      error.message ||
      "Failed to delete post.";

    yield put(
      deleteExperienceFailure(
        message
      )
    );
  }
}

function* handleToggleLike(
  action: any
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiToggleLike,
      action.payload.experienceId
    );

    yield put(
      toggleLikeSuccess(
        action.payload.experienceId,
        response.likes ?? response.experience?.likes ?? 0
      )
    );
  } catch {
    // Keep optimistic UI work for the next pass.
  }
}

function* handleToggleBookmark(
  action: any
): Generator<any, void, any> {
  try {
    yield call(
      apiToggleBookmark,
      action.payload.experienceId
    );
  } catch {
    // Keep optimistic UI work for the next pass.
  }
}

function* handleToggleRepost(
  action: any
): Generator<any, void, any> {
  try {
    yield call(
      apiToggleRepost,
      action.payload.experienceId
    );
  } catch {
    // Keep optimistic UI work for the next pass.
  }
}

export function* experiencesSaga() {
  yield takeLatest(
    FETCH_EXPERIENCES_REQUEST,
    handleFetchExperiences
  );

  yield takeLatest(
    CREATE_EXPERIENCE_REQUEST,
    handleCreateExperience
  );
  yield takeLatest(
    TOGGLE_LIKE_REQUEST,
    handleToggleLike
  );
  yield takeLatest(
    TOGGLE_BOOKMARK_REQUEST,
    handleToggleBookmark
  );
  yield takeLatest(
    TOGGLE_REPOST_REQUEST,
    handleToggleRepost
  );
  yield takeLatest(
  UPDATE_EXPERIENCE_REQUEST,
  handleUpdateExperience
);

yield takeLatest(
  DELETE_EXPERIENCE_REQUEST,
  handleDeleteExperience
);
}
