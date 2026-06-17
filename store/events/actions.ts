import {
  CreateEventPayload,
  EVENTS_ACTIONS,
  CalendarPreferences,
  CommunityCalendar,
  EventCalendarResult,
  EventComment,
  EventCommentsResult,
  EventListParams,
  EventListResult,
  EventRecommendationResult,
  EventRsvpPayload,
  SaiEvent,
  UpdateEventPayload,
  UploadEventMediaPayload,
  UploadEventMediaResult,
} from "./types";

export const fetchEventsRequest = (
  payload: EventListParams = {}
) =>
  ({
    payload,
    type: EVENTS_ACTIONS.FETCH_FEED_REQUEST,
  } as const);

export const fetchEventsSuccess = (
  payload: EventListResult
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

export const updateEventSuccess = (
  payload: SaiEvent
) =>
  ({
    payload,
    type: EVENTS_ACTIONS.UPDATE_SUCCESS,
  } as const);

export const updateEventFailure = (
  payload: string
) =>
  ({
    payload,
    type: EVENTS_ACTIONS.UPDATE_FAILURE,
  } as const);

export const deleteEventRequest = (
  id: string
) =>
  ({
    payload: { id },
    type: EVENTS_ACTIONS.DELETE_REQUEST,
  } as const);

export const deleteEventSuccess = (
  id: string
) =>
  ({
    payload: { id },
    type: EVENTS_ACTIONS.DELETE_SUCCESS,
  } as const);

export const deleteEventFailure = (
  payload: string
) =>
  ({
    payload,
    type: EVENTS_ACTIONS.DELETE_FAILURE,
  } as const);

export const rsvpEventRequest = (
  id: string,
  rsvp: EventRsvpPayload = {
    status: "going",
  }
) =>
  ({
    payload: { id, rsvp },
    type: EVENTS_ACTIONS.RSVP_REQUEST,
  } as const);

export const rsvpEventSuccess = (
  id: string,
  rsvps: number
) =>
  ({
    payload: { id, rsvps },
    type: EVENTS_ACTIONS.RSVP_SUCCESS,
  } as const);

export const rsvpEventFailure = (
  id: string,
  error: string
) =>
  ({
    payload: { error, id },
    type: EVENTS_ACTIONS.RSVP_FAILURE,
  } as const);

export const cancelEventRsvpRequest = (
  id: string
) =>
  ({
    payload: { id },
    type: EVENTS_ACTIONS.CANCEL_RSVP_REQUEST,
  } as const);

export const cancelEventRsvpSuccess = (
  id: string,
  rsvps: number
) =>
  ({
    payload: { id, rsvps },
    type: EVENTS_ACTIONS.CANCEL_RSVP_SUCCESS,
  } as const);

export const cancelEventRsvpFailure = (
  id: string,
  error: string
) =>
  ({
    payload: { error, id },
    type: EVENTS_ACTIONS.CANCEL_RSVP_FAILURE,
  } as const);

export const fetchMyRsvpsRequest = (
  payload: EventListParams = {}
) =>
  ({
    payload,
    type: EVENTS_ACTIONS.FETCH_MY_RSVPS_REQUEST,
  } as const);

export const fetchMyRsvpsSuccess = (
  payload: EventListResult
) =>
  ({
    payload,
    type: EVENTS_ACTIONS.FETCH_MY_RSVPS_SUCCESS,
  } as const);

export const fetchMyRsvpsFailure = (
  payload: string
) =>
  ({
    payload,
    type: EVENTS_ACTIONS.FETCH_MY_RSVPS_FAILURE,
  } as const);

export const fetchMyEventsRequest = (
  payload: EventListParams = {}
) =>
  ({
    payload,
    type: EVENTS_ACTIONS.FETCH_MY_EVENTS_REQUEST,
  } as const);

export const fetchMyEventsSuccess = (
  payload: EventListResult
) =>
  ({
    payload,
    type: EVENTS_ACTIONS.FETCH_MY_EVENTS_SUCCESS,
  } as const);

export const fetchMyEventsFailure = (
  payload: string
) =>
  ({
    payload,
    type: EVENTS_ACTIONS.FETCH_MY_EVENTS_FAILURE,
  } as const);

export const fetchEventCalendarRequest = (
  month: string
) =>
  ({
    payload: { month },
    type: EVENTS_ACTIONS.FETCH_CALENDAR_REQUEST,
  } as const);

export const fetchEventCalendarSuccess = (
  payload: EventCalendarResult
) =>
  ({
    payload,
    type: EVENTS_ACTIONS.FETCH_CALENDAR_SUCCESS,
  } as const);

export const fetchEventCalendarFailure = (
  payload: string
) =>
  ({
    payload,
    type: EVENTS_ACTIONS.FETCH_CALENDAR_FAILURE,
  } as const);

export const fetchEventRecommendationsRequest = (
  payload: {
    limit?: number;
  } = {}
) =>
  ({
    payload,
    type: EVENTS_ACTIONS.FETCH_RECOMMENDATIONS_REQUEST,
  } as const);

export const fetchEventRecommendationsSuccess = (
  payload: EventRecommendationResult
) =>
  ({
    payload,
    type: EVENTS_ACTIONS.FETCH_RECOMMENDATIONS_SUCCESS,
  } as const);

export const fetchEventRecommendationsFailure = (
  payload: string
) =>
  ({
    payload,
    type: EVENTS_ACTIONS.FETCH_RECOMMENDATIONS_FAILURE,
  } as const);

export const fetchCalendarPreferencesRequest = () =>
  ({
    type: EVENTS_ACTIONS.FETCH_CALENDAR_PREFERENCES_REQUEST,
  } as const);

export const fetchCalendarPreferencesSuccess = (
  payload: CalendarPreferences
) =>
  ({
    payload,
    type: EVENTS_ACTIONS.FETCH_CALENDAR_PREFERENCES_SUCCESS,
  } as const);

export const fetchCalendarPreferencesFailure = (
  payload: string
) =>
  ({
    payload,
    type: EVENTS_ACTIONS.FETCH_CALENDAR_PREFERENCES_FAILURE,
  } as const);

export const updateCalendarPreferencesRequest = (
  payload: Partial<CalendarPreferences>
) =>
  ({
    payload,
    type: EVENTS_ACTIONS.UPDATE_CALENDAR_PREFERENCES_REQUEST,
  } as const);

export const updateCalendarPreferencesSuccess = (
  payload: CalendarPreferences
) =>
  ({
    payload,
    type: EVENTS_ACTIONS.UPDATE_CALENDAR_PREFERENCES_SUCCESS,
  } as const);

export const updateCalendarPreferencesFailure = (
  payload: string
) =>
  ({
    payload,
    type: EVENTS_ACTIONS.UPDATE_CALENDAR_PREFERENCES_FAILURE,
  } as const);

export const exportCalendarRequest = () =>
  ({
    type: EVENTS_ACTIONS.EXPORT_CALENDAR_REQUEST,
  } as const);

export const exportCalendarSuccess = (
  payload: string
) =>
  ({
    payload,
    type: EVENTS_ACTIONS.EXPORT_CALENDAR_SUCCESS,
  } as const);

export const exportCalendarFailure = (
  payload: string
) =>
  ({
    payload,
    type: EVENTS_ACTIONS.EXPORT_CALENDAR_FAILURE,
  } as const);

export const fetchCommunityCalendarsRequest = (
  payload: {
    city?: string;
    type?: string;
  } = {}
) =>
  ({
    payload,
    type: EVENTS_ACTIONS.FETCH_COMMUNITY_CALENDARS_REQUEST,
  } as const);

export const fetchCommunityCalendarsSuccess = (
  payload: CommunityCalendar[]
) =>
  ({
    payload,
    type: EVENTS_ACTIONS.FETCH_COMMUNITY_CALENDARS_SUCCESS,
  } as const);

export const fetchCommunityCalendarsFailure = (
  payload: string
) =>
  ({
    payload,
    type: EVENTS_ACTIONS.FETCH_COMMUNITY_CALENDARS_FAILURE,
  } as const);

export const subscribeCommunityCalendarRequest = (
  id: string
) =>
  ({
    payload: { id },
    type: EVENTS_ACTIONS.SUBSCRIBE_COMMUNITY_CALENDAR_REQUEST,
  } as const);

export const subscribeCommunityCalendarSuccess = (
  payload: CommunityCalendar
) =>
  ({
    payload,
    type: EVENTS_ACTIONS.SUBSCRIBE_COMMUNITY_CALENDAR_SUCCESS,
  } as const);

export const subscribeCommunityCalendarFailure = (
  id: string,
  error: string
) =>
  ({
    payload: { error, id },
    type: EVENTS_ACTIONS.SUBSCRIBE_COMMUNITY_CALENDAR_FAILURE,
  } as const);

export const unsubscribeCommunityCalendarRequest = (
  id: string
) =>
  ({
    payload: { id },
    type: EVENTS_ACTIONS.UNSUBSCRIBE_COMMUNITY_CALENDAR_REQUEST,
  } as const);

export const unsubscribeCommunityCalendarSuccess = (
  payload: CommunityCalendar
) =>
  ({
    payload,
    type: EVENTS_ACTIONS.UNSUBSCRIBE_COMMUNITY_CALENDAR_SUCCESS,
  } as const);

export const unsubscribeCommunityCalendarFailure = (
  id: string,
  error: string
) =>
  ({
    payload: { error, id },
    type: EVENTS_ACTIONS.UNSUBSCRIBE_COMMUNITY_CALENDAR_FAILURE,
  } as const);

export const fetchEventCommentsRequest = (
  id: string,
  params: EventListParams = {}
) =>
  ({
    payload: { id, params },
    type: EVENTS_ACTIONS.FETCH_COMMENTS_REQUEST,
  } as const);

export const fetchEventCommentsSuccess = (
  payload: EventCommentsResult
) =>
  ({
    payload,
    type: EVENTS_ACTIONS.FETCH_COMMENTS_SUCCESS,
  } as const);

export const fetchEventCommentsFailure = (
  payload: string
) =>
  ({
    payload,
    type: EVENTS_ACTIONS.FETCH_COMMENTS_FAILURE,
  } as const);

export const addEventCommentRequest = (
  id: string,
  content: string
) =>
  ({
    payload: { content, id },
    type: EVENTS_ACTIONS.ADD_COMMENT_REQUEST,
  } as const);

export const addEventCommentSuccess = (
  payload: EventComment
) =>
  ({
    payload,
    type: EVENTS_ACTIONS.ADD_COMMENT_SUCCESS,
  } as const);

export const addEventCommentFailure = (
  payload: string
) =>
  ({
    payload,
    type: EVENTS_ACTIONS.ADD_COMMENT_FAILURE,
  } as const);

export const uploadEventMediaRequest = (
  payload: UploadEventMediaPayload
) =>
  ({
    payload,
    type: EVENTS_ACTIONS.UPLOAD_MEDIA_REQUEST,
  } as const);

export const uploadEventMediaSuccess = (
  payload: UploadEventMediaResult
) =>
  ({
    payload,
    type: EVENTS_ACTIONS.UPLOAD_MEDIA_SUCCESS,
  } as const);

export const uploadEventMediaFailure = (
  payload: string
) =>
  ({
    payload,
    type: EVENTS_ACTIONS.UPLOAD_MEDIA_FAILURE,
  } as const);
