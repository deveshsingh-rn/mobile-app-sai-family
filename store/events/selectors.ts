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
