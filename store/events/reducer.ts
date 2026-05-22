import {
  EVENTS_ACTIONS,
  EventsAction,
  EventsState,
} from "./types";

export const initialEventsState: EventsState = {
  addingComment: false,
  calendar: [],
  commentsError: null,
  commentsLoading: false,
  comments: [],
  creating: false,
  detail: null,
  error: null,
  feed: [],
  loading: false,
  myEvents: [],
  myRsvps: [],
  rsvpPendingIds: {},
  uploadedMedia: null,
  uploadingMedia: false,
};

export function eventsReducer(
  state: EventsState = initialEventsState,
  action: EventsAction
): EventsState {
  switch (action.type) {
    case EVENTS_ACTIONS.FETCH_COMMENTS_REQUEST:
      return {
        ...state,
        commentsError: null,
        commentsLoading: true,
      };

    case EVENTS_ACTIONS.FETCH_FEED_REQUEST:
    case EVENTS_ACTIONS.FETCH_DETAIL_REQUEST:
    case EVENTS_ACTIONS.FETCH_MY_RSVPS_REQUEST:
    case EVENTS_ACTIONS.FETCH_MY_EVENTS_REQUEST:
    case EVENTS_ACTIONS.FETCH_CALENDAR_REQUEST:
      return {
        ...state,
        error: null,
        loading: true,
      };

    case EVENTS_ACTIONS.CREATE_REQUEST:
    case EVENTS_ACTIONS.UPDATE_REQUEST:
      return {
        ...state,
        creating: true,
        error: null,
      };

    case EVENTS_ACTIONS.DELETE_REQUEST:
      return {
        ...state,
        error: null,
      };

    case EVENTS_ACTIONS.RSVP_REQUEST:
    case EVENTS_ACTIONS.CANCEL_RSVP_REQUEST:
      return {
        ...state,
        error: null,
        rsvpPendingIds: {
          ...state.rsvpPendingIds,
          [action.payload?.id]: true,
        },
      };

    case EVENTS_ACTIONS.ADD_COMMENT_REQUEST:
      return {
        ...state,
        addingComment: true,
        commentsError: null,
        error: null,
      };

    case EVENTS_ACTIONS.UPLOAD_MEDIA_REQUEST:
      return {
        ...state,
        error: null,
        uploadedMedia: null,
        uploadingMedia: true,
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
        commentsLoading: false,
      };

    case EVENTS_ACTIONS.FETCH_MY_RSVPS_SUCCESS:
      return {
        ...state,
        loading: false,
        myRsvps: action.payload || [],
      };

    case EVENTS_ACTIONS.FETCH_MY_EVENTS_SUCCESS:
      return {
        ...state,
        loading: false,
        myEvents: action.payload || [],
      };

    case EVENTS_ACTIONS.FETCH_CALENDAR_SUCCESS:
      return {
        ...state,
        calendar: action.payload || [],
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

    case EVENTS_ACTIONS.UPDATE_SUCCESS:
      return {
        ...state,
        creating: false,
        detail:
          state.detail?.id === action.payload?.id
            ? action.payload
            : state.detail,
        feed: state.feed.map((event) =>
          event.id === action.payload?.id
            ? action.payload
            : event
        ),
        myEvents: state.myEvents.map((event) =>
          event.id === action.payload?.id
            ? action.payload
            : event
        ),
      };

    case EVENTS_ACTIONS.DELETE_SUCCESS:
      return {
        ...state,
        detail:
          state.detail?.id === action.payload?.id
            ? null
            : state.detail,
        feed: state.feed.filter(
          (event) =>
            event.id !== action.payload?.id
        ),
        myEvents: state.myEvents.filter(
          (event) =>
            event.id !== action.payload?.id
        ),
        myRsvps: state.myRsvps.filter(
          (event) =>
            event.id !== action.payload?.id
        ),
      };

    case EVENTS_ACTIONS.RSVP_SUCCESS:
    case EVENTS_ACTIONS.CANCEL_RSVP_SUCCESS: {
      const rsvpedByMe =
        action.type ===
        EVENTS_ACTIONS.RSVP_SUCCESS;

      const updateEvent = (event: any) =>
        event.id === action.payload?.id
          ? {
              ...event,
              rsvpedByMe,
              rsvps:
                action.payload?.rsvps ??
                event.rsvps,
            }
          : event;
      const {
        [action.payload?.id]: _,
        ...remainingPendingIds
      } = state.rsvpPendingIds;

      return {
        ...state,
        detail:
          state.detail?.id === action.payload?.id
            ? updateEvent(state.detail)
            : state.detail,
        feed: state.feed.map(updateEvent),
        myRsvps: rsvpedByMe
          ? state.myRsvps.some(
              (event) =>
                event.id === action.payload?.id
            )
            ? state.myRsvps.map(updateEvent)
            : state.detail?.id ===
                action.payload?.id
              ? [
                  updateEvent(state.detail),
                  ...state.myRsvps,
                ]
              : state.myRsvps
          : state.myRsvps.filter(
              (event) =>
                event.id !== action.payload?.id
            ),
        rsvpPendingIds: remainingPendingIds,
      };
    }

    case EVENTS_ACTIONS.ADD_COMMENT_SUCCESS:
      return {
        ...state,
        addingComment: false,
        commentsError: null,
        comments: [
          action.payload,
          ...state.comments,
        ],
        detail: state.detail
          ? {
              ...state.detail,
              comments:
                (state.detail.comments || 0) + 1,
            }
          : state.detail,
      };

    case EVENTS_ACTIONS.UPLOAD_MEDIA_SUCCESS:
      return {
        ...state,
        uploadedMedia: action.payload || null,
        uploadingMedia: false,
      };

    case EVENTS_ACTIONS.FETCH_COMMENTS_FAILURE:
      return {
        ...state,
        commentsError: action.payload,
        commentsLoading: false,
      };

    case EVENTS_ACTIONS.FETCH_FEED_FAILURE:
    case EVENTS_ACTIONS.FETCH_DETAIL_FAILURE:
    case EVENTS_ACTIONS.FETCH_MY_RSVPS_FAILURE:
    case EVENTS_ACTIONS.FETCH_MY_EVENTS_FAILURE:
    case EVENTS_ACTIONS.FETCH_CALENDAR_FAILURE:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    case EVENTS_ACTIONS.CREATE_FAILURE:
    case EVENTS_ACTIONS.UPDATE_FAILURE:
      return {
        ...state,
        creating: false,
        error: action.payload,
      };

    case EVENTS_ACTIONS.RSVP_FAILURE:
    case EVENTS_ACTIONS.CANCEL_RSVP_FAILURE: {
        const {
          [action.payload?.id]: _,
          ...remainingPendingIds
        } = state.rsvpPendingIds;

        return {
          ...state,
          error:
            action.payload?.error ||
            "Unable to update RSVP.",
          rsvpPendingIds:
            remainingPendingIds,
        };
      }

    case EVENTS_ACTIONS.DELETE_FAILURE:
      return {
        ...state,
        error: action.payload,
      };

    case EVENTS_ACTIONS.ADD_COMMENT_FAILURE:
      return {
        ...state,
        addingComment: false,
        commentsError: action.payload,
        error: action.payload,
      };

    case EVENTS_ACTIONS.UPLOAD_MEDIA_FAILURE:
      return {
        ...state,
        error: action.payload,
        uploadingMedia: false,
      };

    default:
      return state;
  }
}
