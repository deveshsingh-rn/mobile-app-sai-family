export type EventType =
  | "bhajan"
  | "pooja"
  | "seva"
  | "medical"
  | "satsang"
  | "darshan"
  | "general";

export type SaiEvent = {
  address: string;
  bannerUrl?: string | null;
  city?: string | null;
  comments?: number;
  country?: string | null;
  createdAt?: string;
  description: string;
  endAt: string;
  id: string;
  latitude: number;
  longitude: number;
  ownerId?: string;
  rsvpedByMe?: boolean;
  rsvps?: number;
  startAt: string;
  state?: string | null;
  timezone?: string;
  title: string;
  type?: EventType;
  updatedAt?: string;
  venueName?: string | null;
};

export type EventComment = {
  author?: {
    id: string;
    name: string;
    profileImageUrl?: string | null;
  };
  content: string;
  createdAt: string;
  id: string;
};

export type CreateEventPayload = {
  address: string;
  bannerUrl?: string | null;
  city?: string;
  country?: string;
  description: string;
  endAt: string;
  latitude: number;
  longitude: number;
  startAt: string;
  state?: string;
  timezone?: string;
  title: string;
  type?: EventType;
  venueName?: string;
};

export type UpdateEventPayload =
  Partial<CreateEventPayload> & {
    id: string;
  };

export type EventsState = {
  calendar: SaiEvent[];
  comments: EventComment[];
  creating: boolean;
  detail: SaiEvent | null;
  error: string | null;
  feed: SaiEvent[];
  loading: boolean;
  myEvents: SaiEvent[];
  myRsvps: SaiEvent[];
};

export const EVENTS_ACTIONS = {
  ADD_COMMENT_FAILURE:
    "events/addCommentFailure",
  ADD_COMMENT_REQUEST:
    "events/addCommentRequest",
  ADD_COMMENT_SUCCESS:
    "events/addCommentSuccess",
  CANCEL_RSVP_FAILURE:
    "events/cancelRsvpFailure",
  CANCEL_RSVP_REQUEST:
    "events/cancelRsvpRequest",
  CANCEL_RSVP_SUCCESS:
    "events/cancelRsvpSuccess",
  CREATE_FAILURE: "events/createFailure",
  CREATE_REQUEST: "events/createRequest",
  CREATE_SUCCESS: "events/createSuccess",
  DELETE_FAILURE: "events/deleteFailure",
  DELETE_REQUEST: "events/deleteRequest",
  DELETE_SUCCESS: "events/deleteSuccess",
  FETCH_CALENDAR_FAILURE:
    "events/fetchCalendarFailure",
  FETCH_CALENDAR_REQUEST:
    "events/fetchCalendarRequest",
  FETCH_CALENDAR_SUCCESS:
    "events/fetchCalendarSuccess",
  FETCH_COMMENTS_FAILURE:
    "events/fetchCommentsFailure",
  FETCH_COMMENTS_REQUEST:
    "events/fetchCommentsRequest",
  FETCH_COMMENTS_SUCCESS:
    "events/fetchCommentsSuccess",
  FETCH_DETAIL_FAILURE:
    "events/fetchDetailFailure",
  FETCH_DETAIL_REQUEST:
    "events/fetchDetailRequest",
  FETCH_DETAIL_SUCCESS:
    "events/fetchDetailSuccess",
  FETCH_FEED_FAILURE:
    "events/fetchFeedFailure",
  FETCH_FEED_REQUEST:
    "events/fetchFeedRequest",
  FETCH_FEED_SUCCESS:
    "events/fetchFeedSuccess",
  FETCH_MY_EVENTS_FAILURE:
    "events/fetchMyEventsFailure",
  FETCH_MY_EVENTS_REQUEST:
    "events/fetchMyEventsRequest",
  FETCH_MY_EVENTS_SUCCESS:
    "events/fetchMyEventsSuccess",
  FETCH_MY_RSVPS_FAILURE:
    "events/fetchMyRsvpsFailure",
  FETCH_MY_RSVPS_REQUEST:
    "events/fetchMyRsvpsRequest",
  FETCH_MY_RSVPS_SUCCESS:
    "events/fetchMyRsvpsSuccess",
  RSVP_FAILURE: "events/rsvpFailure",
  RSVP_REQUEST: "events/rsvpRequest",
  RSVP_SUCCESS: "events/rsvpSuccess",
  UPDATE_FAILURE: "events/updateFailure",
  UPDATE_REQUEST: "events/updateRequest",
  UPDATE_SUCCESS: "events/updateSuccess",
  UPLOAD_MEDIA_FAILURE:
    "events/uploadMediaFailure",
  UPLOAD_MEDIA_REQUEST:
    "events/uploadMediaRequest",
  UPLOAD_MEDIA_SUCCESS:
    "events/uploadMediaSuccess",
} as const;

export type EventsAction = {
  payload?: any;
  type: string;
};
