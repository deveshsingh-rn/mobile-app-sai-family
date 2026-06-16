import {
  call,
  put,
  takeLatest,
} from "redux-saga/effects";

import {
  apiAddEventComment,
  apiCancelEventRsvp,
  apiCreateEvent,
  apiDeleteEvent,
  apiFetchEventCalendar,
  apiFetchEventComments,
  apiFetchEventDetail,
  apiFetchEvents,
  apiFetchMyEvents,
  apiFetchMyRsvps,
  apiRsvpEvent,
  apiUpdateEvent,
  apiUploadEventMedia,
} from "@/services/events";

import {
  addEventCommentFailure,
  addEventCommentSuccess,
  cancelEventRsvpFailure,
  cancelEventRsvpSuccess,
  createEventFailure,
  createEventSuccess,
  deleteEventFailure,
  deleteEventSuccess,
  fetchEventCalendarFailure,
  fetchEventCalendarSuccess,
  fetchEventCommentsFailure,
  fetchEventCommentsSuccess,
  fetchEventDetailFailure,
  fetchEventDetailSuccess,
  fetchEventsFailure,
  fetchEventsSuccess,
  fetchMyEventsFailure,
  fetchMyEventsSuccess,
  fetchMyRsvpsFailure,
  fetchMyRsvpsSuccess,
  rsvpEventFailure,
  rsvpEventSuccess,
  updateEventFailure,
  updateEventSuccess,
  uploadEventMediaFailure,
  uploadEventMediaSuccess,
} from "./actions";

import {
  EVENTS_ACTIONS,
  EventCalendarDay,
  EventCalendarResult,
  EventsAction,
  EventCommentsResult,
  EventListResult,
  EventPagination,
  SaiEvent,
} from "./types";
import {
  getFirstValidationError,
  validateCreateEventPayload,
  validateEventCommentContent,
  validateEventMediaFiles,
  validateUpdateEventPayload,
} from "./validation";

function getErrorMessage(error: any) {
  return (
    error?.response?.data?.error
      ?.message ||
    error?.response?.data?.message ||
    error?.message ||
    "Something went wrong."
  );
}

function normalizeEvent(event: any): SaiEvent {
  const source =
    event?.event || event;
  const counts = source?._count || {};

  return {
    ...source,
    bookmarkedByMe:
      source?.bookmarkedByMe ??
      source?.isBookmarked ??
      false,
    bookmarks:
      counts.bookmarks ??
      source?.bookmarksCount ??
      source?.bookmarks ??
      0,
    checkIns:
      counts.checkIns ??
      source?.checkInsCount ??
      source?.checkIns,
    comments:
      counts.comments ??
      source?.commentsCount ??
      source?.comments ??
      0,
    ownerId:
      source?.ownerId ||
      source?.authorId ||
      source?.owner?.id ||
      source?.author?.id,
    ownerName:
      source?.ownerName ||
      source?.authorName ||
      source?.owner?.name ||
      source?.author?.name ||
      null,
    ownerProfileImageUrl:
      source?.ownerProfileImageUrl ||
      source?.authorProfileImageUrl ||
      source?.owner?.profileImageUrl ||
      source?.author?.profileImageUrl ||
      null,
    photos:
      counts.photos ??
      source?.photosCount ??
      source?.photos,
    reviews:
      counts.reviews ??
      source?.reviewsCount ??
      source?.reviews,
    rsvpedByMe:
      source?.rsvpedByMe ??
      source?.isRsvped ??
      source?.hasRsvped ??
      false,
    rsvps:
      counts.rsvps ??
      source?.rsvpsCount ??
      source?.rsvps ??
      0,
    shares:
      counts.shares ??
      source?.sharesCount ??
      source?.shares,
    views:
      counts.views ??
      source?.viewsCount ??
      source?.views,
  };
}

function getEventFromResponse(response: any) {
  return normalizeEvent(
    response?.event ||
      response?.data?.event ||
      response?.data ||
      response
  );
}

function normalizePagination(
  pagination: any
): EventPagination | null {
  if (!pagination) {
    return null;
  }

  return {
    hasMore:
      pagination.hasMore ??
      pagination.nextOffset != null,
    limit: Number(pagination.limit || 20),
    nextOffset:
      pagination.nextOffset ?? null,
    offset: Number(pagination.offset || 0),
    page:
      pagination.page !== undefined
        ? Number(pagination.page)
        : undefined,
    total:
      pagination.total !== undefined
        ? Number(pagination.total)
        : undefined,
    totalPages:
      pagination.totalPages !== undefined
        ? Number(pagination.totalPages)
        : undefined,
  };
}

function getEventListFromResponse(
  response: any
): EventListResult {
  const source =
    response?.events ||
    response?.bookmarks ||
    response?.rsvps ||
    response?.items ||
    response?.results ||
    response?.calendar ||
    response?.data?.events ||
    response?.data?.rsvps ||
    response?.data?.items ||
    response?.data?.results ||
    response?.data?.bookmarks ||
    response?.data ||
    [];

  if (!Array.isArray(source)) {
    return {
      events: [],
      pagination:
        normalizePagination(
          response?.pagination ||
            response?.data?.pagination
        ),
    };
  }

  return {
    events: source.map((item) =>
      normalizeEvent(
        item?.event || item
      )
    ),
    pagination:
      normalizePagination(
        response?.pagination ||
          response?.data?.pagination
      ),
  };
}

function getCalendarFromResponse(
  response: any
): EventCalendarResult {
  const days = Array.isArray(response?.days)
    ? response.days.map(
        (day: any): EventCalendarDay => ({
          ...day,
          events: Array.isArray(day.events)
            ? day.events.map((event: any) =>
                normalizeEvent(event)
              )
            : [],
        })
      )
    : [];

  return {
    days,
    events: days.flatMap(
      (day: EventCalendarDay) =>
        day.events
    ),
    summary:
      response?.summary ||
      response?.data?.summary ||
      null,
  };
}

function normalizeComment(comment: any) {
  return {
    ...comment,
    author:
      comment?.author ||
      comment?.user ||
      undefined,
  };
}

function getCommentsFromResponse(
  response: any
): EventCommentsResult {
  const source =
    response?.comments ||
    response?.items ||
    response?.results ||
    response?.data?.comments ||
    response?.data?.items ||
    response?.data?.results ||
    response?.data ||
    [];

  if (!Array.isArray(source)) {
    return {
      comments: [],
      pagination:
        normalizePagination(
          response?.pagination ||
            response?.data?.pagination
        ),
    };
  }

  return {
    comments: source.map(normalizeComment),
    pagination:
      normalizePagination(
        response?.pagination ||
          response?.data?.pagination
      ),
  };
}

function getRsvpCount(response: any, fallback = 0) {
  return (
    response?.rsvps ??
    response?.event?.rsvps ??
    response?._count?.rsvps ??
    response?.event?._count?.rsvps ??
    fallback
  );
}

function getUploadResult(response: any) {
  const mediaUrls =
    response?.media
      ?.map((file: any) => file.url)
      .filter(Boolean) ||
    response?.data?.media
      ?.map((file: any) => file.url)
      .filter(Boolean);

  const urls =
    response?.urls ||
    response?.files?.map(
      (file: any) => file.url
    ) ||
    response?.data?.urls ||
    mediaUrls;

  return {
    url:
      response?.url ||
      response?.file?.url ||
      response?.media?.[0]?.url ||
      response?.data?.url ||
      response?.data?.media?.[0]?.url ||
      urls?.[0],
    urls,
  };
}

function* fetchEventsWorker(
  action: EventsAction
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiFetchEvents,
      action.payload || {}
    );

    yield put(
      fetchEventsSuccess(
        getEventListFromResponse(response)
      )
    );
  } catch (error) {
    yield put(
      fetchEventsFailure(
        getErrorMessage(error)
      )
    );
  }
}

function* fetchEventDetailWorker(
  action: EventsAction
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiFetchEventDetail,
      action.payload.id
    );

    yield put(
      fetchEventDetailSuccess(
        getEventFromResponse(response)
      )
    );
  } catch (error) {
    yield put(
      fetchEventDetailFailure(
        getErrorMessage(error)
      )
    );
  }
}

function* createEventWorker(
  action: EventsAction
): Generator<any, void, any> {
  try {
    const validation =
      validateCreateEventPayload(
        action.payload
      );

    if (!validation.isValid) {
      yield put(
        createEventFailure(
          getFirstValidationError(
            validation
          )
        )
      );
      return;
    }

    const response = yield call(
      apiCreateEvent,
      action.payload
    );

    yield put(
      createEventSuccess(
        getEventFromResponse(response)
      )
    );
  } catch (error) {
    yield put(
      createEventFailure(
        getErrorMessage(error)
      )
    );
  }
}

function* updateEventWorker(
  action: EventsAction
): Generator<any, void, any> {
  try {
    const validation =
      validateUpdateEventPayload(
        action.payload
      );

    if (!validation.isValid) {
      yield put(
        updateEventFailure(
          getFirstValidationError(
            validation
          )
        )
      );
      return;
    }

    const { id, ...payload } =
      action.payload;

    const response = yield call(
      apiUpdateEvent,
      id,
      payload
    );

    yield put(
      updateEventSuccess(
        getEventFromResponse(response)
      )
    );
  } catch (error) {
    yield put(
      updateEventFailure(
        getErrorMessage(error)
      )
    );
  }
}

function* deleteEventWorker(
  action: EventsAction
): Generator<any, void, any> {
  try {
    yield call(
      apiDeleteEvent,
      action.payload.id
    );

    yield put(
      deleteEventSuccess(
        action.payload.id
      )
    );
  } catch (error) {
    yield put(
      deleteEventFailure(
        getErrorMessage(error)
      )
    );
  }
}

function* rsvpEventWorker(
  action: EventsAction
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiRsvpEvent,
      action.payload.id,
      action.payload.rsvp || {
        status: "going",
      }
    );

    yield put(
      rsvpEventSuccess(
        action.payload.id,
        getRsvpCount(response)
      )
    );
  } catch (error) {
    yield put(
      rsvpEventFailure(
        action.payload.id,
        getErrorMessage(error)
      )
    );
  }
}

function* cancelEventRsvpWorker(
  action: EventsAction
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiCancelEventRsvp,
      action.payload.id
    );

    yield put(
      cancelEventRsvpSuccess(
        action.payload.id,
        getRsvpCount(response)
      )
    );
  } catch (error) {
    yield put(
      cancelEventRsvpFailure(
        action.payload.id,
        getErrorMessage(error)
      )
    );
  }
}

function* fetchMyRsvpsWorker(
  action: EventsAction
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiFetchMyRsvps,
      action.payload || {}
    );

    yield put(
      fetchMyRsvpsSuccess(
        getEventListFromResponse(response)
      )
    );
  } catch (error) {
    yield put(
      fetchMyRsvpsFailure(
        getErrorMessage(error)
      )
    );
  }
}

function* fetchMyEventsWorker(
  action: EventsAction
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiFetchMyEvents,
      action.payload || {}
    );

    yield put(
      fetchMyEventsSuccess(
        getEventListFromResponse(response)
      )
    );
  } catch (error) {
    yield put(
      fetchMyEventsFailure(
        getErrorMessage(error)
      )
    );
  }
}

function* fetchEventCalendarWorker(
  action: EventsAction
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiFetchEventCalendar,
      action.payload.month
    );

    yield put(
      fetchEventCalendarSuccess(
        getCalendarFromResponse(response)
      )
    );
  } catch (error) {
    yield put(
      fetchEventCalendarFailure(
        getErrorMessage(error)
      )
    );
  }
}

function* fetchEventCommentsWorker(
  action: EventsAction
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiFetchEventComments,
      action.payload.id,
      action.payload.params || {}
    );

    yield put(
      fetchEventCommentsSuccess(
        getCommentsFromResponse(response)
      )
    );
  } catch (error) {
    yield put(
      fetchEventCommentsFailure(
        getErrorMessage(error)
      )
    );
  }
}

function* addEventCommentWorker(
  action: EventsAction
): Generator<any, void, any> {
  try {
    const validation =
      validateEventCommentContent(
        action.payload.content
      );

    if (!validation.isValid) {
      yield put(
        addEventCommentFailure(
          getFirstValidationError(
            validation
          )
        )
      );
      return;
    }

    const response = yield call(
      apiAddEventComment,
      action.payload.id,
      action.payload.content
    );

    yield put(
      addEventCommentSuccess(
        normalizeComment(
          response?.comment ||
            response?.data?.comment ||
            response
        )
      )
    );
  } catch (error) {
    yield put(
      addEventCommentFailure(
        getErrorMessage(error)
      )
    );
  }
}

function* uploadEventMediaWorker(
  action: EventsAction
): Generator<any, void, any> {
  try {
    if (action.payload.files) {
      const validation =
        validateEventMediaFiles(
          action.payload.files
        );

      if (!validation.isValid) {
        yield put(
          uploadEventMediaFailure(
            getFirstValidationError(
              validation
            )
          )
        );
        return;
      }
    }

    const response = yield call(
      apiUploadEventMedia,
      action.payload.formData
    );

    yield put(
      uploadEventMediaSuccess(
        getUploadResult(response)
      )
    );
  } catch (error) {
    yield put(
      uploadEventMediaFailure(
        getErrorMessage(error)
      )
    );
  }
}

export function* eventsSaga() {
  yield takeLatest(
    EVENTS_ACTIONS.FETCH_FEED_REQUEST,
    fetchEventsWorker
  );
  yield takeLatest(
    EVENTS_ACTIONS.FETCH_DETAIL_REQUEST,
    fetchEventDetailWorker
  );
  yield takeLatest(
    EVENTS_ACTIONS.CREATE_REQUEST,
    createEventWorker
  );
  yield takeLatest(
    EVENTS_ACTIONS.UPDATE_REQUEST,
    updateEventWorker
  );
  yield takeLatest(
    EVENTS_ACTIONS.DELETE_REQUEST,
    deleteEventWorker
  );
  yield takeLatest(
    EVENTS_ACTIONS.RSVP_REQUEST,
    rsvpEventWorker
  );
  yield takeLatest(
    EVENTS_ACTIONS.CANCEL_RSVP_REQUEST,
    cancelEventRsvpWorker
  );
  yield takeLatest(
    EVENTS_ACTIONS.FETCH_MY_RSVPS_REQUEST,
    fetchMyRsvpsWorker
  );
  yield takeLatest(
    EVENTS_ACTIONS.FETCH_MY_EVENTS_REQUEST,
    fetchMyEventsWorker
  );
  yield takeLatest(
    EVENTS_ACTIONS.FETCH_CALENDAR_REQUEST,
    fetchEventCalendarWorker
  );
  yield takeLatest(
    EVENTS_ACTIONS.FETCH_COMMENTS_REQUEST,
    fetchEventCommentsWorker
  );
  yield takeLatest(
    EVENTS_ACTIONS.ADD_COMMENT_REQUEST,
    addEventCommentWorker
  );
  yield takeLatest(
    EVENTS_ACTIONS.UPLOAD_MEDIA_REQUEST,
    uploadEventMediaWorker
  );
}
