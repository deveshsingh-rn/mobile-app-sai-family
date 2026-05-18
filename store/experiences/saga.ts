import {
  call,
  put,
  takeLatest,
} from "redux-saga/effects";

import {
  apiCreateExperience,
  apiDeleteExperience,
  apiFetchExperiences,
  apiUpdateExperience,
} from "@/services/experiences";

import {
  createExperienceFailure,
  createExperienceSuccess,
  deleteExperienceFailure,
  deleteExperienceSuccess,
  fetchExperiencesFailure,
  fetchExperiencesSuccess,
  updateExperienceFailure,
  updateExperienceSuccess,
} from "./actions";

import {
  CREATE_EXPERIENCE_REQUEST,
  DELETE_EXPERIENCE_REQUEST,
  FETCH_EXPERIENCES_REQUEST,
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
  UPDATE_EXPERIENCE_REQUEST,
  handleUpdateExperience
);

yield takeLatest(
  DELETE_EXPERIENCE_REQUEST,
  handleDeleteExperience
);
}