import {
  EVENTS_ACTIONS,
  EventsAction,
  EventsState,
} from "./types";

export const initialEventsState: EventsState = {
  addingComment: false,
  addingReviewIds: {},
  analyticsByEventId: {},
  analyticsLoadingIds: {},
  attendeesByEventId: {},
  attendeesLoadingIds: {},
  bookmarkPendingIds: {},
  checkInPendingIds: {},
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
  home: null,
  homeLoading: false,
  loading: false,
  myEvents: [],
  myEventsPagination: null,
  myRsvps: [],
  myRsvpsPagination: null,
  nearby: [],
  nearbyLoading: false,
  calendarExportError: null,
  calendarExporting: false,
  calendarPreferences: null,
  calendarPreferencesLoading: false,
  recommendations: [],
  recommendationsBasis: null,
  recommendationsLoading: false,
  reportPendingIds: {},
  photoUploadingIds: {},
  photosByEventId: {},
  photosLoadingIds: {},
  places: [],
  placesLoading: false,
  reviewsByEventId: {},
  reviewsLoadingIds: {},
  rsvpPendingIds: {},
  sharePendingIds: {},
  titleSuggestions: [],
  titleSuggestionsLoading: false,
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

function updateEventById(
  event: any,
  id: string,
  changes: any
) {
  return event?.id === id
    ? {
        ...event,
        ...changes,
      }
    : event;
}

function getCheckInKey(eventId?: string, userId?: string) {
  return `${eventId || ""}:${userId || ""}`;
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

    case EVENTS_ACTIONS.FETCH_HOME_REQUEST:
      return {
        ...state,
        error: null,
        homeLoading: true,
      };

    case EVENTS_ACTIONS.FETCH_NEARBY_REQUEST:
      return {
        ...state,
        error: null,
        nearbyLoading: true,
      };

    case EVENTS_ACTIONS.FETCH_PLACES_REQUEST:
      return {
        ...state,
        error: null,
        placesLoading: true,
      };

    case EVENTS_ACTIONS.FETCH_TITLE_SUGGESTIONS_REQUEST:
      return {
        ...state,
        error: null,
        titleSuggestionsLoading: true,
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

    case EVENTS_ACTIONS.BOOKMARK_REQUEST:
    case EVENTS_ACTIONS.UNBOOKMARK_REQUEST:
      return {
        ...state,
        bookmarkPendingIds: {
          ...state.bookmarkPendingIds,
          [action.payload?.id]: true,
        },
        error: null,
      };

    case EVENTS_ACTIONS.SHARE_REQUEST:
      return {
        ...state,
        error: null,
        sharePendingIds: {
          ...state.sharePendingIds,
          [action.payload?.id]: true,
        },
      };

    case EVENTS_ACTIONS.REPORT_REQUEST:
      return {
        ...state,
        error: null,
        reportPendingIds: {
          ...state.reportPendingIds,
          [action.payload?.id]: true,
        },
      };

    case EVENTS_ACTIONS.ADD_REVIEW_REQUEST:
      return {
        ...state,
        addingReviewIds: {
          ...state.addingReviewIds,
          [action.payload?.id]: true,
        },
        error: null,
      };

    case EVENTS_ACTIONS.CHECK_IN_REQUEST:
      return {
        ...state,
        checkInPendingIds: {
          ...state.checkInPendingIds,
          [getCheckInKey(
            action.payload?.id,
            action.payload?.userId
          )]: true,
        },
        error: null,
      };

    case EVENTS_ACTIONS.FETCH_REVIEWS_REQUEST:
      return {
        ...state,
        reviewsLoadingIds: {
          ...state.reviewsLoadingIds,
          [action.payload?.id]: true,
        },
      };

    case EVENTS_ACTIONS.FETCH_PHOTOS_REQUEST:
      return {
        ...state,
        photosLoadingIds: {
          ...state.photosLoadingIds,
          [action.payload?.id]: true,
        },
      };

    case EVENTS_ACTIONS.UPLOAD_PHOTOS_REQUEST:
      return {
        ...state,
        error: null,
        photoUploadingIds: {
          ...state.photoUploadingIds,
          [action.payload?.id]: true,
        },
      };

    case EVENTS_ACTIONS.FETCH_ATTENDEES_REQUEST:
      return {
        ...state,
        attendeesLoadingIds: {
          ...state.attendeesLoadingIds,
          [action.payload?.id]: true,
        },
      };

    case EVENTS_ACTIONS.FETCH_ANALYTICS_REQUEST:
      return {
        ...state,
        analyticsLoadingIds: {
          ...state.analyticsLoadingIds,
          [action.payload?.id]: true,
        },
        error: null,
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

    case EVENTS_ACTIONS.FETCH_HOME_SUCCESS:
      return {
        ...state,
        home: action.payload || null,
        homeLoading: false,
      };

    case EVENTS_ACTIONS.FETCH_NEARBY_SUCCESS:
      return {
        ...state,
        nearby:
          action.payload?.events ||
          action.payload?.data?.events ||
          [],
        nearbyLoading: false,
      };

    case EVENTS_ACTIONS.FETCH_PLACES_SUCCESS:
      return {
        ...state,
        places:
          action.payload?.places ||
          action.payload?.data?.places ||
          [],
        placesLoading: false,
      };

    case EVENTS_ACTIONS.FETCH_TITLE_SUGGESTIONS_SUCCESS:
      return {
        ...state,
        titleSuggestions:
          action.payload?.suggestions ||
          action.payload?.data?.suggestions ||
          [],
        titleSuggestionsLoading: false,
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

    case EVENTS_ACTIONS.BOOKMARK_SUCCESS:
    case EVENTS_ACTIONS.UNBOOKMARK_SUCCESS: {
      const id = action.payload?.id;
      const {
        [id]: _,
        ...remainingPendingIds
      } = state.bookmarkPendingIds;
      const changes =
        action.payload?.event || {
          bookmarkedByMe:
            action.payload?.bookmarked,
          bookmarks:
            action.payload?.bookmarks,
        };

      return {
        ...state,
        bookmarkPendingIds:
          remainingPendingIds,
        detail:
          state.detail?.id === id
            ? {
                ...state.detail,
                ...changes,
              }
            : state.detail,
        feed: state.feed.map((event) =>
          updateEventById(event, id, changes)
        ),
        myEvents: state.myEvents.map((event) =>
          updateEventById(event, id, changes)
        ),
        myRsvps: state.myRsvps.map((event) =>
          updateEventById(event, id, changes)
        ),
      };
    }

    case EVENTS_ACTIONS.SHARE_SUCCESS: {
      const id = action.payload?.id;
      const {
        [id]: _,
        ...remainingPendingIds
      } = state.sharePendingIds;
      const currentShares =
        state.detail &&
        state.detail.id === id
          ? state.detail.shares || 0
          : 0;
      const nextShares =
        action.payload?.shares ??
        currentShares + 1;
      const changes = {
        shares: nextShares,
      };

      return {
        ...state,
        sharePendingIds: remainingPendingIds,
        detail:
          state.detail &&
          state.detail.id === id
            ? {
                ...state.detail,
                ...changes,
              }
            : state.detail,
        feed: state.feed.map((event) =>
          updateEventById(event, id, changes)
        ),
      };
    }

    case EVENTS_ACTIONS.REPORT_SUCCESS: {
      const {
        [action.payload?.id]: _,
        ...remainingPendingIds
      } = state.reportPendingIds;

      return {
        ...state,
        reportPendingIds:
          remainingPendingIds,
      };
    }

    case EVENTS_ACTIONS.FETCH_REVIEWS_SUCCESS: {
      const {
        [action.payload?.id]: _,
        ...remainingLoadingIds
      } = state.reviewsLoadingIds;

      return {
        ...state,
        reviewsByEventId: {
          ...state.reviewsByEventId,
          [action.payload?.id]:
            action.payload?.result || {
              reviews: [],
            },
        },
        reviewsLoadingIds:
          remainingLoadingIds,
      };
    }

    case EVENTS_ACTIONS.ADD_REVIEW_SUCCESS: {
      const id = action.payload?.id;
      const {
        [id]: _,
        ...remainingAddingIds
      } = state.addingReviewIds;
      const existing =
        state.reviewsByEventId[id] || {
          reviews: [],
        };
      const incomingReview =
        action.payload?.review;
      const nextReviews = incomingReview
        ? mergeById(
            [incomingReview],
            existing.reviews || []
          )
        : existing.reviews || [];
      const summary =
        action.payload?.summary ||
        existing.summary ||
        null;
      const nextReviewCount =
        summary?.total ??
        summary?.count ??
        nextReviews.length;
      const changes = {
        reviews: nextReviewCount,
      };

      return {
        ...state,
        addingReviewIds: remainingAddingIds,
        detail:
          state.detail &&
          state.detail.id === id
            ? {
                ...state.detail,
                ...changes,
              }
            : state.detail,
        feed: state.feed.map((event) =>
          updateEventById(event, id, changes)
        ),
        reviewsByEventId: {
          ...state.reviewsByEventId,
          [id]: {
            ...existing,
            reviews: nextReviews,
            summary,
          },
        },
      };
    }

    case EVENTS_ACTIONS.FETCH_PHOTOS_SUCCESS: {
      const id = action.payload?.id;
      const {
        [id]: _,
        ...remainingLoadingIds
      } = state.photosLoadingIds;

      return {
        ...state,
        photosByEventId: {
          ...state.photosByEventId,
          [id]: action.payload?.result || {
            photos: [],
          },
        },
        photosLoadingIds:
          remainingLoadingIds,
      };
    }

    case EVENTS_ACTIONS.UPLOAD_PHOTOS_SUCCESS: {
      const id = action.payload?.id;
      const {
        [id]: _,
        ...remainingUploadingIds
      } = state.photoUploadingIds;
      const existing =
        state.photosByEventId[id] || {
          photos: [],
        };
      const result =
        action.payload?.result || {
          photos: [],
        };
      const nextPhotos = mergeById(
        result.photos || [],
        existing.photos || []
      );
      const nextPhotoCount =
        result.count?.photos ??
        nextPhotos.length;
      const changes = {
        photos: nextPhotoCount,
      };

      return {
        ...state,
        detail:
          state.detail &&
          state.detail.id === id
            ? {
                ...state.detail,
                ...changes,
              }
            : state.detail,
        feed: state.feed.map((event) =>
          updateEventById(event, id, changes)
        ),
        myEvents: state.myEvents.map((event) =>
          updateEventById(event, id, changes)
        ),
        photoUploadingIds:
          remainingUploadingIds,
        photosByEventId: {
          ...state.photosByEventId,
          [id]: {
            ...existing,
            photos: nextPhotos,
          },
        },
      };
    }

    case EVENTS_ACTIONS.FETCH_ATTENDEES_SUCCESS: {
      const {
        [action.payload?.id]: _,
        ...remainingLoadingIds
      } = state.attendeesLoadingIds;

      return {
        ...state,
        attendeesByEventId: {
          ...state.attendeesByEventId,
          [action.payload?.id]:
            action.payload?.result || {
              attendees: [],
            },
        },
        attendeesLoadingIds:
          remainingLoadingIds,
      };
    }

    case EVENTS_ACTIONS.FETCH_ANALYTICS_SUCCESS: {
      const id = action.payload?.id;
      const {
        [id]: _,
        ...remainingLoadingIds
      } = state.analyticsLoadingIds;
      const result = action.payload?.result || {};
      const analytics =
        result.analytics ||
        result.data?.analytics ||
        {};
      const event = result.event || result.data?.event;

      return {
        ...state,
        analyticsByEventId: {
          ...state.analyticsByEventId,
          [id]: analytics,
        },
        analyticsLoadingIds:
          remainingLoadingIds,
        detail:
          state.detail?.id === id && event
            ? {
                ...state.detail,
                ...event,
              }
            : state.detail,
        myEvents: event
          ? state.myEvents.map((item) =>
              updateEventById(item, id, event)
            )
          : state.myEvents,
      };
    }

    case EVENTS_ACTIONS.CHECK_IN_SUCCESS: {
      const id = action.payload?.id;
      const userId = action.payload?.userId;
      const checkInKey = getCheckInKey(id, userId);
      const {
        [checkInKey]: _,
        ...remainingPendingIds
      } = state.checkInPendingIds;
      const existing =
        state.attendeesByEventId[id] || {
          attendees: [],
        };
      const checkedInAt =
        action.payload?.rsvp?.checkedInAt ||
        new Date().toISOString();
      const attendees = (
        existing.attendees || []
      ).map((attendee) =>
        attendee.userId === userId ||
        attendee.user?.id === userId
          ? {
              ...attendee,
              checkedInAt,
            }
          : attendee
      );
      const checkIns =
        action.payload?.count?.checkIns;
      const summary = {
        ...existing.summary,
        checkedIn:
          checkIns ??
          existing.summary?.checkedIn,
      };
      const changes = {
        checkIns:
          checkIns ??
          state.detail?.checkIns,
      };

      return {
        ...state,
        attendeesByEventId: {
          ...state.attendeesByEventId,
          [id]: {
            ...existing,
            attendees,
            summary,
          },
        },
        checkInPendingIds:
          remainingPendingIds,
        detail:
          state.detail &&
          state.detail.id === id
            ? {
                ...state.detail,
                ...changes,
              }
            : state.detail,
        feed: state.feed.map((event) =>
          updateEventById(event, id, changes)
        ),
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

    case EVENTS_ACTIONS.FETCH_HOME_FAILURE:
      return {
        ...state,
        error: action.payload,
        homeLoading: false,
      };

    case EVENTS_ACTIONS.FETCH_NEARBY_FAILURE:
      return {
        ...state,
        error: action.payload,
        nearbyLoading: false,
      };

    case EVENTS_ACTIONS.FETCH_PLACES_FAILURE:
      return {
        ...state,
        error: action.payload,
        placesLoading: false,
      };

    case EVENTS_ACTIONS.FETCH_TITLE_SUGGESTIONS_FAILURE:
      return {
        ...state,
        error: action.payload,
        titleSuggestionsLoading: false,
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

    case EVENTS_ACTIONS.BOOKMARK_FAILURE:
    case EVENTS_ACTIONS.UNBOOKMARK_FAILURE: {
        const {
          [action.payload?.id]: _,
          ...remainingPendingIds
        } = state.bookmarkPendingIds;

        return {
          ...state,
          bookmarkPendingIds:
            remainingPendingIds,
          error:
            action.payload?.error ||
            "Unable to update bookmark.",
        };
      }

    case EVENTS_ACTIONS.SHARE_FAILURE: {
        const {
          [action.payload?.id]: _,
          ...remainingPendingIds
        } = state.sharePendingIds;

        return {
          ...state,
          error:
            action.payload?.error ||
            "Unable to track share.",
          sharePendingIds:
            remainingPendingIds,
        };
      }

    case EVENTS_ACTIONS.REPORT_FAILURE: {
        const {
          [action.payload?.id]: _,
          ...remainingPendingIds
        } = state.reportPendingIds;

        return {
          ...state,
          error:
            action.payload?.error ||
            "Unable to submit report.",
          reportPendingIds:
            remainingPendingIds,
        };
      }

    case EVENTS_ACTIONS.ADD_REVIEW_FAILURE: {
        const {
          [action.payload?.id]: _,
          ...remainingAddingIds
        } = state.addingReviewIds;

        return {
          ...state,
          addingReviewIds:
            remainingAddingIds,
          error:
            action.payload?.error ||
            "Unable to submit review.",
        };
      }

    case EVENTS_ACTIONS.CHECK_IN_FAILURE: {
        const checkInKey = getCheckInKey(
          action.payload?.id,
          action.payload?.userId
        );
        const {
          [checkInKey]: _,
          ...remainingPendingIds
        } = state.checkInPendingIds;

        return {
          ...state,
          checkInPendingIds:
            remainingPendingIds,
          error:
            action.payload?.error ||
            "Unable to check in attendee.",
        };
      }

    case EVENTS_ACTIONS.FETCH_REVIEWS_FAILURE: {
        const {
          [action.payload?.id]: _,
          ...remainingLoadingIds
        } = state.reviewsLoadingIds;

        return {
          ...state,
          error:
            action.payload?.error ||
            "Unable to load reviews.",
          reviewsLoadingIds:
            remainingLoadingIds,
        };
      }

    case EVENTS_ACTIONS.FETCH_PHOTOS_FAILURE: {
        const {
          [action.payload?.id]: _,
          ...remainingLoadingIds
        } = state.photosLoadingIds;

        return {
          ...state,
          error:
            action.payload?.error ||
            "Unable to load event photos.",
          photosLoadingIds:
            remainingLoadingIds,
        };
      }

    case EVENTS_ACTIONS.UPLOAD_PHOTOS_FAILURE: {
        const {
          [action.payload?.id]: _,
          ...remainingUploadingIds
        } = state.photoUploadingIds;

        return {
          ...state,
          error:
            action.payload?.error ||
            "Unable to upload event photos.",
          photoUploadingIds:
            remainingUploadingIds,
        };
      }

    case EVENTS_ACTIONS.FETCH_ATTENDEES_FAILURE: {
        const {
          [action.payload?.id]: _,
          ...remainingLoadingIds
        } = state.attendeesLoadingIds;

        return {
          ...state,
          attendeesLoadingIds:
            remainingLoadingIds,
          error:
            action.payload?.error ||
            "Unable to load attendees.",
        };
      }

    case EVENTS_ACTIONS.FETCH_ANALYTICS_FAILURE: {
        const {
          [action.payload?.id]: _,
          ...remainingLoadingIds
        } = state.analyticsLoadingIds;

        return {
          ...state,
          analyticsLoadingIds:
            remainingLoadingIds,
          error:
            action.payload?.error ||
            "Unable to load event analytics.",
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
