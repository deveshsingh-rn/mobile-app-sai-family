import {
  EVENTS_ACTIONS,
  EventsAction,
  EventsState,
} from "./types";

export const initialEventsState: EventsState = {
  addingComment: false,
  calendar: [],
  calendarDays: [],
  calendarSummary: null,
  commentsError: null,
  commentsLoading: false,
  comments: [],
  commentsPagination: null,
  communityCalendarPendingIds: {},
  communityCalendars: [],
  communityCalendarsLoading: false,
  creating: false,
  detail: null,
  error: null,
  feed: [],
  feedPagination: null,
  loading: false,
  myEvents: [],
  myEventsPagination: null,
  myRsvps: [],
  myRsvpsPagination: null,
  calendarExportError: null,
  calendarExporting: false,
  calendarPreferences: null,
  calendarPreferencesLoading: false,
  recommendations: [],
  recommendationsBasis: null,
  recommendationsLoading: false,
  rsvpPendingIds: {},
  uploadedMedia: null,
  uploadingMedia: false,
};

function shouldAppend(payload: any) {
  return Boolean(
    payload?.pagination?.offset &&
      payload.pagination.offset > 0
  );
}

function mergeById(
  current: any[],
  incoming: any[]
) {
  const seen = new Set<string>();

  return [...current, ...incoming].filter(
    (item) => {
      if (!item?.id) {
        return true;
      }

      if (seen.has(item.id)) {
        return false;
      }

      seen.add(item.id);
      return true;
    }
  );
}

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

    case EVENTS_ACTIONS.FETCH_RECOMMENDATIONS_REQUEST:
      return {
        ...state,
        error: null,
        recommendationsLoading: true,
      };

    case EVENTS_ACTIONS.FETCH_CALENDAR_PREFERENCES_REQUEST:
    case EVENTS_ACTIONS.UPDATE_CALENDAR_PREFERENCES_REQUEST:
      return {
        ...state,
        calendarPreferencesLoading: true,
        error: null,
      };

    case EVENTS_ACTIONS.EXPORT_CALENDAR_REQUEST:
      return {
        ...state,
        calendarExportError: null,
        calendarExporting: true,
      };

    case EVENTS_ACTIONS.FETCH_COMMUNITY_CALENDARS_REQUEST:
      return {
        ...state,
        communityCalendarsLoading: true,
        error: null,
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

    case EVENTS_ACTIONS.SUBSCRIBE_COMMUNITY_CALENDAR_REQUEST:
    case EVENTS_ACTIONS.UNSUBSCRIBE_COMMUNITY_CALENDAR_REQUEST:
      return {
        ...state,
        communityCalendarPendingIds: {
          ...state.communityCalendarPendingIds,
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
        feed: shouldAppend(action.payload)
          ? mergeById(
              state.feed,
              action.payload?.events || []
            )
          : action.payload?.events || [],
        feedPagination:
          action.payload?.pagination || null,
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
        comments: shouldAppend(action.payload)
          ? mergeById(
              state.comments,
              action.payload?.comments || []
            )
          : action.payload?.comments || [],
        commentsPagination:
          action.payload?.pagination || null,
        commentsLoading: false,
      };

    case EVENTS_ACTIONS.FETCH_MY_RSVPS_SUCCESS:
      return {
        ...state,
        loading: false,
        myRsvps: shouldAppend(action.payload)
          ? mergeById(
              state.myRsvps,
              action.payload?.events || []
            )
          : action.payload?.events || [],
        myRsvpsPagination:
          action.payload?.pagination || null,
      };

    case EVENTS_ACTIONS.FETCH_MY_EVENTS_SUCCESS:
      return {
        ...state,
        loading: false,
        myEvents: shouldAppend(action.payload)
          ? mergeById(
              state.myEvents,
              action.payload?.events || []
            )
          : action.payload?.events || [],
        myEventsPagination:
          action.payload?.pagination || null,
      };

    case EVENTS_ACTIONS.FETCH_CALENDAR_SUCCESS:
      return {
        ...state,
        calendar: action.payload?.events || [],
        calendarDays:
          action.payload?.days || [],
        calendarSummary:
          action.payload?.summary || null,
        loading: false,
      };

    case EVENTS_ACTIONS.FETCH_RECOMMENDATIONS_SUCCESS:
      return {
        ...state,
        recommendations:
          action.payload?.events || [],
        recommendationsBasis:
          action.payload?.basis || null,
        recommendationsLoading: false,
      };

    case EVENTS_ACTIONS.FETCH_CALENDAR_PREFERENCES_SUCCESS:
    case EVENTS_ACTIONS.UPDATE_CALENDAR_PREFERENCES_SUCCESS:
      return {
        ...state,
        calendarPreferences:
          action.payload || null,
        calendarPreferencesLoading: false,
      };

    case EVENTS_ACTIONS.EXPORT_CALENDAR_SUCCESS:
      return {
        ...state,
        calendarExportError: null,
        calendarExporting: false,
      };

    case EVENTS_ACTIONS.FETCH_COMMUNITY_CALENDARS_SUCCESS:
      return {
        ...state,
        communityCalendars:
          action.payload || [],
        communityCalendarsLoading: false,
      };

    case EVENTS_ACTIONS.SUBSCRIBE_COMMUNITY_CALENDAR_SUCCESS:
    case EVENTS_ACTIONS.UNSUBSCRIBE_COMMUNITY_CALENDAR_SUCCESS: {
      const {
        [action.payload?.id]: _,
        ...remainingPendingIds
      } = state.communityCalendarPendingIds;

      return {
        ...state,
        communityCalendarPendingIds:
          remainingPendingIds,
        communityCalendars:
          state.communityCalendars.map((calendar) =>
            calendar.id === action.payload?.id
              ? {
                  ...calendar,
                  ...action.payload,
                }
              : calendar
          ),
      };
    }

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

    case EVENTS_ACTIONS.FETCH_RECOMMENDATIONS_FAILURE:
      return {
        ...state,
        error: action.payload,
        recommendationsLoading: false,
      };

    case EVENTS_ACTIONS.FETCH_CALENDAR_PREFERENCES_FAILURE:
    case EVENTS_ACTIONS.UPDATE_CALENDAR_PREFERENCES_FAILURE:
      return {
        ...state,
        calendarPreferencesLoading: false,
        error: action.payload,
      };

    case EVENTS_ACTIONS.EXPORT_CALENDAR_FAILURE:
      return {
        ...state,
        calendarExportError: action.payload,
        calendarExporting: false,
      };

    case EVENTS_ACTIONS.FETCH_COMMUNITY_CALENDARS_FAILURE:
      return {
        ...state,
        communityCalendarsLoading: false,
        error: action.payload,
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

    case EVENTS_ACTIONS.SUBSCRIBE_COMMUNITY_CALENDAR_FAILURE:
    case EVENTS_ACTIONS.UNSUBSCRIBE_COMMUNITY_CALENDAR_FAILURE: {
        const {
          [action.payload?.id]: _,
          ...remainingPendingIds
        } = state.communityCalendarPendingIds;

        return {
          ...state,
          communityCalendarPendingIds:
            remainingPendingIds,
          error:
            action.payload?.error ||
            "Unable to update community calendar.",
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
