import { RootState } from "../types";

export const selectEventsState = (
  state: RootState
) => state.events;

export const selectEventsFeed = (
  state: RootState
) => selectEventsState(state).feed;

export const selectEventsLoading = (
  state: RootState
) => selectEventsState(state).loading;

export const selectIsCreatingEvent = (
  state: RootState
) => selectEventsState(state).creating;

export const selectIsAddingEventComment = (
  state: RootState
) => selectEventsState(state).addingComment;

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

export const selectMyEventRsvps = (
  state: RootState
) => selectEventsState(state).myRsvps;

export const selectMyEvents = (
  state: RootState
) => selectEventsState(state).myEvents;

export const selectEventCalendar = (
  state: RootState
) => selectEventsState(state).calendar;
