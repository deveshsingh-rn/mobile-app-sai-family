import {
  call,
  put,
  takeLatest,
} from "redux-saga/effects";

import {
  apiAddEventComment,
  apiAddEventReview,
  apiBookmarkEvent,
  apiCancelEventRsvp,
  apiCheckInEventAttendee,
  apiCreateEvent,
  apiDeleteEvent,
  apiFetchEventAnalytics,
  apiFetchEventAttendees,
  apiFetchEventCalendar,
  apiFetchEventComments,
  apiFetchEventDetail,
  apiFetchEventPhotos,
  apiFetchEventRecommendations,
  apiFetchEventReviews,
  apiFetchEvents,
  apiFetchEventsHome,
  apiFetchCalendarPreferences,
  apiFetchCommunityCalendars,
  apiFetchMyEvents,
  apiFetchMyRsvps,
  apiFetchNearbyEvents,
  apiExportCalendarIcs,
  apiReportEvent,
  apiRsvpEvent,
  apiShareEvent,
  apiSubscribeCommunityCalendar,
  apiUnbookmarkEvent,
  apiUpdateEvent,
  apiUpdateCalendarPreferences,
  apiUploadEventPhotos,
  apiUploadEventMedia,
  apiUnsubscribeCommunityCalendar,
} from "@/services/events";

import {
  addEventCommentFailure,
  addEventCommentSuccess,
  addEventReviewFailure,
  addEventReviewSuccess,
  bookmarkEventFailure,
  bookmarkEventSuccess,
  cancelEventRsvpFailure,
  cancelEventRsvpSuccess,
  checkInEventAttendeeFailure,
  checkInEventAttendeeSuccess,
  createEventFailure,
  createEventSuccess,
  deleteEventFailure,
  deleteEventSuccess,
  fetchEventAnalyticsFailure,
  fetchEventAnalyticsSuccess,
  fetchEventCalendarFailure,
  fetchEventCalendarSuccess,
  fetchEventAttendeesFailure,
  fetchEventAttendeesSuccess,
  fetchCalendarPreferencesFailure,
  fetchCalendarPreferencesSuccess,
  fetchCommunityCalendarsFailure,
  fetchCommunityCalendarsSuccess,
  fetchEventCommentsFailure,
  fetchEventCommentsSuccess,
  fetchEventDetailFailure,
  fetchEventDetailSuccess,
  fetchEventPhotosFailure,
  fetchEventPhotosSuccess,
  fetchEventRecommendationsFailure,
  fetchEventRecommendationsSuccess,
  fetchEventReviewsFailure,
  fetchEventReviewsSuccess,
  fetchEventsFailure,
  fetchEventsSuccess,
  fetchEventsHomeFailure,
  fetchEventsHomeSuccess,
  fetchMyEventsFailure,
  fetchMyEventsSuccess,
  fetchMyRsvpsFailure,
  fetchMyRsvpsSuccess,
  fetchNearbyEventsFailure,
  fetchNearbyEventsSuccess,
  reportEventFailure,
  reportEventSuccess,
  rsvpEventFailure,
  rsvpEventSuccess,
  shareEventFailure,
  shareEventSuccess,
  exportCalendarFailure,
  exportCalendarSuccess,
  subscribeCommunityCalendarFailure,
  subscribeCommunityCalendarSuccess,
  updateEventFailure,
  updateEventSuccess,
  updateCalendarPreferencesFailure,
  updateCalendarPreferencesSuccess,
  unbookmarkEventFailure,
  unbookmarkEventSuccess,
  unsubscribeCommunityCalendarFailure,
  unsubscribeCommunityCalendarSuccess,
  uploadEventPhotosFailure,
  uploadEventPhotosSuccess,
  uploadEventMediaFailure,
  uploadEventMediaSuccess,
} from "./actions";

import {
  EVENTS_ACTIONS,
  EventCalendarDay,
  EventCalendarResult,
  EventAttendeesResult,
  EventsAction,
  EventCommentsResult,
  EventReview,
  EventPhotosResult,
  EventListResult,
  EventPagination,
  EventRecommendationResult,
  EventReviewsResult,
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

function getHomeFromResponse(response: any) {
  return {
    eventTypeGuide:
      response?.eventTypeGuide ||
      response?.data?.eventTypeGuide ||
      [],
    sections:
      response?.sections ||
      response?.data?.sections ||
      {},
    stats:
      response?.stats ||
      response?.data?.stats ||
      null,
    topOrganisers:
      response?.topOrganisers ||
      response?.data?.topOrganisers ||
      [],
    trendingSections:
      response?.trendingSections ||
      response?.data?.trendingSections ||
      {},
    trendingThisWeek:
      response?.trendingThisWeek ||
      response?.data?.trendingThisWeek ||
      [],
    weeklySchedule:
      response?.weeklySchedule ||
      response?.data?.weeklySchedule ||
      [],
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
  const calendarSource =
    response?.calendar ||
    response?.events ||
    response?.data?.calendar ||
    response?.data?.events ||
    [];
  const calendarEvents = Array.isArray(calendarSource)
    ? calendarSource.map(normalizeEvent)
    : [];

  return {
    days,
    events: days.length
      ? days.flatMap(
          (day: EventCalendarDay) =>
            day.events
        )
      : calendarEvents,
    summary:
      response?.summary ||
      response?.data?.summary ||
      null,
  };
}

function getRecommendationsFromResponse(
  response: any
): EventRecommendationResult {
  const source =
    response?.events ||
    response?.data?.events ||
    [];

  return {
    basis:
      response?.basis ||
      response?.data?.basis ||
      null,
    events: Array.isArray(source)
      ? source.map(normalizeEvent)
      : [],
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

function getReviewsFromResponse(
  response: any
): EventReviewsResult {
  const source =
    response?.reviews ||
    response?.items ||
    response?.results ||
    response?.data?.reviews ||
    response?.data?.items ||
    response?.data?.results ||
    [];

  return {
    pagination:
      normalizePagination(
        response?.pagination ||
          response?.data?.pagination
      ),
    reviews: Array.isArray(source)
      ? source.map((review: any) => ({
          ...review,
          author:
            review?.author ||
            review?.user ||
            undefined,
        }))
      : [],
    summary:
      response?.summary ||
      response?.data?.summary ||
      null,
  };
}

function normalizePhoto(photo: any) {
  if (!photo) {
    return undefined;
  }

  return {
    ...photo,
    author:
      photo?.author ||
      photo?.user ||
      undefined,
    id:
      photo?.id ||
      photo?.url ||
      `${Date.now()}`,
    thumbnailUrl:
      photo?.thumbnailUrl ||
      photo?.thumbnail ||
      photo?.url,
    url:
      photo?.url ||
      photo?.imageUrl ||
      photo?.mediaUrl,
  };
}

function getPhotosFromResponse(
  response: any
): EventPhotosResult {
  const source =
    response?.photos ||
    response?.items ||
    response?.results ||
    response?.data?.photos ||
    response?.data?.items ||
    response?.data?.results ||
    [];

  return {
    pagination:
      normalizePagination(
        response?.pagination ||
          response?.data?.pagination
      ),
    photos: Array.isArray(source)
      ? source
          .map(normalizePhoto)
          .filter(Boolean)
      : [],
  };
}

function getUploadedPhotosFromResponse(
  response: any
) {
  const result = getPhotosFromResponse(response);

  return {
    ...result,
    count:
      response?._count ||
      response?.count ||
      response?.data?._count ||
      response?.data?.count ||
      null,
  };
}

function normalizeReview(review: any): EventReview | undefined {
  if (!review) {
    return undefined;
  }

  return {
    ...review,
    author:
      review?.author ||
      review?.user ||
      undefined,
  };
}

function getAttendeesFromResponse(
  response: any
): EventAttendeesResult {
  const source =
    response?.attendees ||
    response?.items ||
    response?.results ||
    response?.data?.attendees ||
    response?.data?.items ||
    response?.data?.results ||
    [];

  return {
    attendees: Array.isArray(source)
      ? source
      : [],
    pagination:
      normalizePagination(
        response?.pagination ||
          response?.data?.pagination
      ),
    summary:
      response?.summary ||
      response?.data?.summary ||
      null,
  };
}

function getReviewCreatePayload(response: any) {
  return {
    review: normalizeReview(
      response?.review ||
        response?.data?.review
    ),
    summary:
      response?.summary ||
      response?.data?.summary ||
      null,
  };
}

function getCheckInPayload(response: any) {
  return {
    count:
      response?._count ||
      response?.count ||
      response?.data?._count ||
      response?.data?.count ||
      null,
    rsvp:
      response?.rsvp ||
      response?.data?.rsvp,
  };
}

function getBookmarkPayload(response: any) {
  const event =
    response?.event ||
    response?.data?.event;

  return {
    bookmarked:
      response?.bookmarked ??
      response?.data?.bookmarked ??
      event?.bookmarkedByMe,
    bookmarks:
      response?._count?.bookmarks ??
      response?.data?._count?.bookmarks ??
      event?.bookmarks,
    event: event ? normalizeEvent(event) : undefined,
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

function* fetchEventsHomeWorker(
  action: EventsAction
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiFetchEventsHome,
      action.payload || {}
    );

    yield put(
      fetchEventsHomeSuccess(
        getHomeFromResponse(response)
      )
    );
  } catch (error) {
    yield put(
      fetchEventsHomeFailure(
        getErrorMessage(error)
      )
    );
  }
}

function* fetchNearbyEventsWorker(
  action: EventsAction
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiFetchNearbyEvents,
      action.payload || {}
    );

    yield put(
      fetchNearbyEventsSuccess({
        center:
          response?.center ||
          response?.data?.center ||
          null,
        events:
          response?.events ||
          response?.data?.events ||
          [],
        radiusKm:
          response?.radiusKm ||
          response?.data?.radiusKm,
      })
    );
  } catch (error) {
    yield put(
      fetchNearbyEventsFailure(
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

function* bookmarkEventWorker(
  action: EventsAction
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiBookmarkEvent,
      action.payload.id
    );

    yield put(
      bookmarkEventSuccess(
        action.payload.id,
        getBookmarkPayload(response)
      )
    );
  } catch (error) {
    yield put(
      bookmarkEventFailure(
        action.payload.id,
        getErrorMessage(error)
      )
    );
  }
}

function* unbookmarkEventWorker(
  action: EventsAction
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiUnbookmarkEvent,
      action.payload.id
    );

    yield put(
      unbookmarkEventSuccess(
        action.payload.id,
        getBookmarkPayload(response)
      )
    );
  } catch (error) {
    yield put(
      unbookmarkEventFailure(
        action.payload.id,
        getErrorMessage(error)
      )
    );
  }
}

function* shareEventWorker(
  action: EventsAction
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiShareEvent,
      action.payload.id,
      action.payload.channel
    );

    yield put(
      shareEventSuccess(
        action.payload.id,
        response?.shares
      )
    );
  } catch (error) {
    yield put(
      shareEventFailure(
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

function* fetchEventRecommendationsWorker(
  action: EventsAction
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiFetchEventRecommendations,
      action.payload || {}
    );

    yield put(
      fetchEventRecommendationsSuccess(
        getRecommendationsFromResponse(response)
      )
    );
  } catch (error) {
    yield put(
      fetchEventRecommendationsFailure(
        getErrorMessage(error)
      )
    );
  }
}

function* fetchCalendarPreferencesWorker(): Generator<any, void, any> {
  try {
    const response = yield call(
      apiFetchCalendarPreferences
    );

    yield put(
      fetchCalendarPreferencesSuccess(
        response?.preference ||
          response?.data?.preference ||
          response
      )
    );
  } catch (error) {
    yield put(
      fetchCalendarPreferencesFailure(
        getErrorMessage(error)
      )
    );
  }
}

function* updateCalendarPreferencesWorker(
  action: EventsAction
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiUpdateCalendarPreferences,
      action.payload || {}
    );

    yield put(
      updateCalendarPreferencesSuccess(
        response?.preference ||
          response?.data?.preference ||
          response
      )
    );
  } catch (error) {
    yield put(
      updateCalendarPreferencesFailure(
        getErrorMessage(error)
      )
    );
  }
}

function* exportCalendarWorker(): Generator<any, void, any> {
  try {
    const response = yield call(
      apiExportCalendarIcs
    );

    yield put(
      exportCalendarSuccess(response)
    );
  } catch (error) {
    yield put(
      exportCalendarFailure(
        getErrorMessage(error)
      )
    );
  }
}

function* fetchCommunityCalendarsWorker(
  action: EventsAction
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiFetchCommunityCalendars,
      action.payload || {}
    );

    yield put(
      fetchCommunityCalendarsSuccess(
        response?.calendars ||
          response?.data?.calendars ||
          []
      )
    );
  } catch (error) {
    yield put(
      fetchCommunityCalendarsFailure(
        getErrorMessage(error)
      )
    );
  }
}

function* subscribeCommunityCalendarWorker(
  action: EventsAction
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiSubscribeCommunityCalendar,
      action.payload.id
    );

    yield put(
      subscribeCommunityCalendarSuccess(
        response?.calendar ||
          response?.data?.calendar
      )
    );
  } catch (error) {
    yield put(
      subscribeCommunityCalendarFailure(
        action.payload.id,
        getErrorMessage(error)
      )
    );
  }
}

function* unsubscribeCommunityCalendarWorker(
  action: EventsAction
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiUnsubscribeCommunityCalendar,
      action.payload.id
    );

    yield put(
      unsubscribeCommunityCalendarSuccess(
        response?.calendar ||
          response?.data?.calendar
      )
    );
  } catch (error) {
    yield put(
      unsubscribeCommunityCalendarFailure(
        action.payload.id,
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

function* fetchEventReviewsWorker(
  action: EventsAction
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiFetchEventReviews,
      action.payload.id,
      action.payload.params || {}
    );

    yield put(
      fetchEventReviewsSuccess(
        action.payload.id,
        getReviewsFromResponse(response)
      )
    );
  } catch (error) {
    yield put(
      fetchEventReviewsFailure(
        action.payload.id,
        getErrorMessage(error)
      )
    );
  }
}

function* fetchEventPhotosWorker(
  action: EventsAction
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiFetchEventPhotos,
      action.payload.id,
      action.payload.params || {}
    );

    yield put(
      fetchEventPhotosSuccess(
        action.payload.id,
        getPhotosFromResponse(response)
      )
    );
  } catch (error) {
    yield put(
      fetchEventPhotosFailure(
        action.payload.id,
        getErrorMessage(error)
      )
    );
  }
}

function* uploadEventPhotosWorker(
  action: EventsAction
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiUploadEventPhotos,
      action.payload.id,
      action.payload.formData
    );

    yield put(
      uploadEventPhotosSuccess(
        action.payload.id,
        getUploadedPhotosFromResponse(response)
      )
    );
  } catch (error) {
    yield put(
      uploadEventPhotosFailure(
        action.payload.id,
        getErrorMessage(error)
      )
    );
  }
}

function* addEventReviewWorker(
  action: EventsAction
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiAddEventReview,
      action.payload.id,
      action.payload.review
    );

    yield put(
      addEventReviewSuccess(
        action.payload.id,
        getReviewCreatePayload(response)
      )
    );
  } catch (error) {
    yield put(
      addEventReviewFailure(
        action.payload.id,
        getErrorMessage(error)
      )
    );
  }
}

function* fetchEventAttendeesWorker(
  action: EventsAction
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiFetchEventAttendees,
      action.payload.id,
      action.payload.params || {}
    );

    yield put(
      fetchEventAttendeesSuccess(
        action.payload.id,
        getAttendeesFromResponse(response)
      )
    );
  } catch (error) {
    yield put(
      fetchEventAttendeesFailure(
        action.payload.id,
        getErrorMessage(error)
      )
    );
  }
}

function* fetchEventAnalyticsWorker(
  action: EventsAction
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiFetchEventAnalytics,
      action.payload.id
    );

    yield put(
      fetchEventAnalyticsSuccess(
        action.payload.id,
        {
          analytics:
            response?.analytics ||
            response?.data?.analytics ||
            {},
          event:
            response?.event ||
            response?.data?.event,
        }
      )
    );
  } catch (error) {
    yield put(
      fetchEventAnalyticsFailure(
        action.payload.id,
        getErrorMessage(error)
      )
    );
  }
}

function* checkInEventAttendeeWorker(
  action: EventsAction
): Generator<any, void, any> {
  try {
    const response = yield call(
      apiCheckInEventAttendee,
      action.payload.id,
      action.payload.userId
    );

    yield put(
      checkInEventAttendeeSuccess(
        action.payload.id,
        action.payload.userId,
        getCheckInPayload(response)
      )
    );
  } catch (error) {
    yield put(
      checkInEventAttendeeFailure(
        action.payload.id,
        action.payload.userId,
        getErrorMessage(error)
      )
    );
  }
}

function* reportEventWorker(
  action: EventsAction
): Generator<any, void, any> {
  try {
    yield call(
      apiReportEvent,
      action.payload.id,
      action.payload.report
    );

    yield put(
      reportEventSuccess(action.payload.id)
    );
  } catch (error) {
    yield put(
      reportEventFailure(
        action.payload.id,
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
    EVENTS_ACTIONS.FETCH_HOME_REQUEST,
    fetchEventsHomeWorker
  );
  yield takeLatest(
    EVENTS_ACTIONS.FETCH_NEARBY_REQUEST,
    fetchNearbyEventsWorker
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
    EVENTS_ACTIONS.BOOKMARK_REQUEST,
    bookmarkEventWorker
  );
  yield takeLatest(
    EVENTS_ACTIONS.UNBOOKMARK_REQUEST,
    unbookmarkEventWorker
  );
  yield takeLatest(
    EVENTS_ACTIONS.SHARE_REQUEST,
    shareEventWorker
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
    EVENTS_ACTIONS.FETCH_RECOMMENDATIONS_REQUEST,
    fetchEventRecommendationsWorker
  );
  yield takeLatest(
    EVENTS_ACTIONS.FETCH_CALENDAR_PREFERENCES_REQUEST,
    fetchCalendarPreferencesWorker
  );
  yield takeLatest(
    EVENTS_ACTIONS.UPDATE_CALENDAR_PREFERENCES_REQUEST,
    updateCalendarPreferencesWorker
  );
  yield takeLatest(
    EVENTS_ACTIONS.EXPORT_CALENDAR_REQUEST,
    exportCalendarWorker
  );
  yield takeLatest(
    EVENTS_ACTIONS.FETCH_COMMUNITY_CALENDARS_REQUEST,
    fetchCommunityCalendarsWorker
  );
  yield takeLatest(
    EVENTS_ACTIONS.SUBSCRIBE_COMMUNITY_CALENDAR_REQUEST,
    subscribeCommunityCalendarWorker
  );
  yield takeLatest(
    EVENTS_ACTIONS.UNSUBSCRIBE_COMMUNITY_CALENDAR_REQUEST,
    unsubscribeCommunityCalendarWorker
  );
  yield takeLatest(
    EVENTS_ACTIONS.FETCH_COMMENTS_REQUEST,
    fetchEventCommentsWorker
  );
  yield takeLatest(
    EVENTS_ACTIONS.FETCH_REVIEWS_REQUEST,
    fetchEventReviewsWorker
  );
  yield takeLatest(
    EVENTS_ACTIONS.FETCH_PHOTOS_REQUEST,
    fetchEventPhotosWorker
  );
  yield takeLatest(
    EVENTS_ACTIONS.UPLOAD_PHOTOS_REQUEST,
    uploadEventPhotosWorker
  );
  yield takeLatest(
    EVENTS_ACTIONS.ADD_REVIEW_REQUEST,
    addEventReviewWorker
  );
  yield takeLatest(
    EVENTS_ACTIONS.FETCH_ATTENDEES_REQUEST,
    fetchEventAttendeesWorker
  );
  yield takeLatest(
    EVENTS_ACTIONS.FETCH_ANALYTICS_REQUEST,
    fetchEventAnalyticsWorker
  );
  yield takeLatest(
    EVENTS_ACTIONS.CHECK_IN_REQUEST,
    checkInEventAttendeeWorker
  );
  yield takeLatest(
    EVENTS_ACTIONS.REPORT_REQUEST,
    reportEventWorker
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
