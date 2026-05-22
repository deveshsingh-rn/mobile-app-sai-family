import {
  CreateEventPayload,
  EVENTS_ACTIONS,
  EventComment,
  SaiEvent,
  UpdateEventPayload,
} from "./types";

export const fetchEventsRequest = (
  payload: {
    lat?: number;
    limit?: number;
    lng?: number;
    page?: number;
    radius?: number;
    type?: string;
  } = {}
) =>
  ({
    payload,
    type: EVENTS_ACTIONS.FETCH_FEED_REQUEST,
  } as const);

export const fetchEventsSuccess = (
  payload: SaiEvent[]
) =>
  ({
    payload,
    type: EVENTS_ACTIONS.FETCH_FEED_SUCCESS,
  } as const);

export const fetchEventsFailure = (
  payload: string
) =>
  ({
    payload,
    type: EVENTS_ACTIONS.FETCH_FEED_FAILURE,
  } as const);

export const fetchEventDetailRequest = (
  id: string
) =>
  ({
    payload: { id },
    type: EVENTS_ACTIONS.FETCH_DETAIL_REQUEST,
  } as const);

export const fetchEventDetailSuccess = (
  payload: SaiEvent
) =>
  ({
    payload,
    type: EVENTS_ACTIONS.FETCH_DETAIL_SUCCESS,
  } as const);

export const fetchEventDetailFailure = (
  payload: string
) =>
  ({
    payload,
    type: EVENTS_ACTIONS.FETCH_DETAIL_FAILURE,
  } as const);

export const createEventRequest = (
  payload: CreateEventPayload
) =>
  ({
    payload,
    type: EVENTS_ACTIONS.CREATE_REQUEST,
  } as const);

export const createEventSuccess = (
  payload: SaiEvent
) =>
  ({
    payload,
    type: EVENTS_ACTIONS.CREATE_SUCCESS,
  } as const);

export const createEventFailure = (
  payload: string
) =>
  ({
    payload,
    type: EVENTS_ACTIONS.CREATE_FAILURE,
  } as const);

export const updateEventRequest = (
  payload: UpdateEventPayload
) =>
  ({
    payload,
    type: EVENTS_ACTIONS.UPDATE_REQUEST,
  } as const);

export const deleteEventRequest = (
  id: string
) =>
  ({
    payload: { id },
    type: EVENTS_ACTIONS.DELETE_REQUEST,
  } as const);

export const rsvpEventRequest = (id: string) =>
  ({
    payload: { id },
    type: EVENTS_ACTIONS.RSVP_REQUEST,
  } as const);

export const cancelEventRsvpRequest = (
  id: string
) =>
  ({
    payload: { id },
    type: EVENTS_ACTIONS.CANCEL_RSVP_REQUEST,
  } as const);

export const fetchMyRsvpsRequest = (
  payload: {
    limit?: number;
    offset?: number;
  } = {}
) =>
  ({
    payload,
    type: EVENTS_ACTIONS.FETCH_MY_RSVPS_REQUEST,
  } as const);

export const fetchMyEventsRequest = (
  payload: {
    limit?: number;
    offset?: number;
  } = {}
) =>
  ({
    payload,
    type: EVENTS_ACTIONS.FETCH_MY_EVENTS_REQUEST,
  } as const);

export const fetchEventCalendarRequest = (
  month: string
) =>
  ({
    payload: { month },
    type: EVENTS_ACTIONS.FETCH_CALENDAR_REQUEST,
  } as const);

export const fetchEventCommentsRequest = (
  id: string,
  params: {
    limit?: number;
    offset?: number;
  } = {}
) =>
  ({
    payload: { id, params },
    type: EVENTS_ACTIONS.FETCH_COMMENTS_REQUEST,
  } as const);

export const fetchEventCommentsSuccess = (
  payload: EventComment[]
) =>
  ({
    payload,
    type: EVENTS_ACTIONS.FETCH_COMMENTS_SUCCESS,
  } as const);

export const addEventCommentRequest = (
  id: string,
  content: string
) =>
  ({
    payload: { content, id },
    type: EVENTS_ACTIONS.ADD_COMMENT_REQUEST,
  } as const);
