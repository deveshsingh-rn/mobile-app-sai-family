import { RootState } from "../types";

export const selectEventsState = (
  state: RootState
) => state.events;

export const selectEventsFeed = (
  state: RootState
) => selectEventsState(state).feed;

export const selectEventsFeedPagination = (
  state: RootState
) => selectEventsState(state).feedPagination;

export const selectEventsLoading = (
  state: RootState
) => selectEventsState(state).loading;

export const selectIsCreatingEvent = (
  state: RootState
) => selectEventsState(state).creating;

export const selectIsAddingEventComment = (
  state: RootState
) => selectEventsState(state).addingComment;

export const selectEventCommentsLoading = (
  state: RootState
) => selectEventsState(state).commentsLoading;

export const selectEventCommentsError = (
  state: RootState
) => selectEventsState(state).commentsError;

export const selectIsEventRsvpPending = (
  state: RootState,
  eventId?: string
) =>
  eventId
    ? Boolean(
        selectEventsState(state)
          .rsvpPendingIds[eventId]
      )
    : false;

export const selectIsEventBookmarkPending = (
  state: RootState,
  eventId?: string
) =>
  eventId
    ? Boolean(
        selectEventsState(state)
          .bookmarkPendingIds[eventId]
      )
    : false;

export const selectIsEventSharePending = (
  state: RootState,
  eventId?: string
) =>
  eventId
    ? Boolean(
        selectEventsState(state)
          .sharePendingIds[eventId]
      )
    : false;

export const selectIsEventReportPending = (
  state: RootState,
  eventId?: string
) =>
  eventId
    ? Boolean(
        selectEventsState(state)
          .reportPendingIds[eventId]
      )
    : false;

export const selectEventReviews = (
  state: RootState,
  eventId?: string
) =>
  eventId
    ? selectEventsState(state).reviewsByEventId[
        eventId
      ] || null
    : null;

export const selectEventReviewsLoading = (
  state: RootState,
  eventId?: string
) =>
  eventId
    ? Boolean(
        selectEventsState(state)
          .reviewsLoadingIds[eventId]
      )
    : false;

export const selectIsAddingEventReview = (
  state: RootState,
  eventId?: string
) =>
  eventId
    ? Boolean(
        selectEventsState(state)
          .addingReviewIds[eventId]
      )
    : false;

export const selectEventAttendees = (
  state: RootState,
  eventId?: string
) =>
  eventId
    ? selectEventsState(state).attendeesByEventId[
        eventId
      ] || null
    : null;

export const selectEventAttendeesLoading = (
  state: RootState,
  eventId?: string
) =>
  eventId
    ? Boolean(
        selectEventsState(state)
          .attendeesLoadingIds[eventId]
      )
    : false;

export const selectEventAnalytics = (
  state: RootState,
  eventId?: string
) =>
  eventId
    ? selectEventsState(state).analyticsByEventId[
        eventId
      ] || null
    : null;

export const selectEventAnalyticsMap = (
  state: RootState
) => selectEventsState(state).analyticsByEventId;

export const selectEventAnalyticsLoading = (
  state: RootState,
  eventId?: string
) =>
  eventId
    ? Boolean(
        selectEventsState(state)
          .analyticsLoadingIds[eventId]
      )
    : false;

export const selectIsCheckingInEventAttendee = (
  state: RootState,
  eventId?: string,
  userId?: string
) =>
  eventId && userId
    ? Boolean(
        selectEventsState(state)
          .checkInPendingIds[
            `${eventId}:${userId}`
          ]
      )
    : false;

export const selectEventCheckInPendingIds = (
  state: RootState
) => selectEventsState(state).checkInPendingIds;

export const selectIsUploadingEventMedia = (
  state: RootState
) => selectEventsState(state).uploadingMedia;

export const selectUploadedEventMedia = (
  state: RootState
) => selectEventsState(state).uploadedMedia;

export const selectEventsError = (
  state: RootState
) => selectEventsState(state).error;

export const selectEventDetail = (
  state: RootState
) => selectEventsState(state).detail;

export const selectEventComments = (
  state: RootState
) => selectEventsState(state).comments;

export const selectEventCommentsPagination = (
  state: RootState
) => selectEventsState(state).commentsPagination;

export const selectMyEventRsvps = (
  state: RootState
) => selectEventsState(state).myRsvps;

export const selectMyEventRsvpsPagination = (
  state: RootState
) => selectEventsState(state).myRsvpsPagination;

export const selectMyEvents = (
  state: RootState
) => selectEventsState(state).myEvents;

export const selectMyEventsPagination = (
  state: RootState
) => selectEventsState(state).myEventsPagination;

export const selectEventCalendar = (
  state: RootState
) => selectEventsState(state).calendar;

export const selectEventCalendarDays = (
  state: RootState
) => selectEventsState(state).calendarDays;

export const selectEventCalendarSummary = (
  state: RootState
) => selectEventsState(state).calendarSummary;

export const selectEventRecommendations = (
  state: RootState
) => selectEventsState(state).recommendations;

export const selectEventRecommendationsLoading = (
  state: RootState
) => selectEventsState(state).recommendationsLoading;

export const selectCalendarPreferences = (
  state: RootState
) => selectEventsState(state).calendarPreferences;

export const selectCalendarPreferencesLoading = (
  state: RootState
) => selectEventsState(state).calendarPreferencesLoading;

export const selectCalendarExporting = (
  state: RootState
) => selectEventsState(state).calendarExporting;

export const selectCalendarExportError = (
  state: RootState
) => selectEventsState(state).calendarExportError;

export const selectCommunityCalendars = (
  state: RootState
) => selectEventsState(state).communityCalendars;

export const selectCommunityCalendarsLoading = (
  state: RootState
) => selectEventsState(state).communityCalendarsLoading;

export const selectIsCommunityCalendarPending = (
  state: RootState,
  calendarId?: string
) =>
  calendarId
    ? Boolean(
        selectEventsState(state)
          .communityCalendarPendingIds[calendarId]
      )
    : false;
