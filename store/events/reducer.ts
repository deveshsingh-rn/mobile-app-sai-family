import {
  EVENTS_ACTIONS,
  EventsAction,
  EventsState,
} from "./types";

export const initialEventsState: EventsState = {
  calendar: [],
  comments: [],
  creating: false,
  detail: null,
  error: null,
  feed: [],
  loading: false,
  myEvents: [],
  myRsvps: [],
};

export function eventsReducer(
  state: EventsState = initialEventsState,
  action: EventsAction
): EventsState {
  switch (action.type) {
    case EVENTS_ACTIONS.FETCH_FEED_REQUEST:
    case EVENTS_ACTIONS.FETCH_DETAIL_REQUEST:
    case EVENTS_ACTIONS.FETCH_MY_RSVPS_REQUEST:
    case EVENTS_ACTIONS.FETCH_MY_EVENTS_REQUEST:
    case EVENTS_ACTIONS.FETCH_CALENDAR_REQUEST:
    case EVENTS_ACTIONS.FETCH_COMMENTS_REQUEST:
      return {
        ...state,
        error: null,
        loading: true,
      };

    case EVENTS_ACTIONS.CREATE_REQUEST:
      return {
        ...state,
        creating: true,
        error: null,
      };

    case EVENTS_ACTIONS.FETCH_FEED_SUCCESS:
      return {
        ...state,
        feed: action.payload || [],
        loading: false,
      };

    case EVENTS_ACTIONS.FETCH_DETAIL_SUCCESS:
      return {
        ...state,
        detail: action.payload || null,
        loading: false,
      };

    case EVENTS_ACTIONS.FETCH_COMMENTS_SUCCESS:
      return {
        ...state,
        comments: action.payload || [],
        loading: false,
      };

    case EVENTS_ACTIONS.CREATE_SUCCESS:
      return {
        ...state,
        creating: false,
        feed: action.payload
          ? [action.payload, ...state.feed]
          : state.feed,
      };

    case EVENTS_ACTIONS.FETCH_FEED_FAILURE:
    case EVENTS_ACTIONS.FETCH_DETAIL_FAILURE:
    case EVENTS_ACTIONS.FETCH_MY_RSVPS_FAILURE:
    case EVENTS_ACTIONS.FETCH_MY_EVENTS_FAILURE:
    case EVENTS_ACTIONS.FETCH_CALENDAR_FAILURE:
    case EVENTS_ACTIONS.FETCH_COMMENTS_FAILURE:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    case EVENTS_ACTIONS.CREATE_FAILURE:
      return {
        ...state,
        creating: false,
        error: action.payload,
      };

    default:
      return state;
  }
}
