export type EventType =
  | "bhajan"
  | "pooja"
  | "seva"
  | "medical"
  | "satsang"
  | "darshan"
  | "general";

export type EventStatus =
  | "draft"
  | "published"
  | "live"
  | "completed"
  | "cancelled";

export type EventSort =
  | "soonest"
  | "popular"
  | "nearby"
  | "latest";

export type EventPagination = {
  hasMore?: boolean;
  limit: number;
  nextOffset?: number | null;
  offset: number;
  page?: number;
  total?: number;
  totalPages?: number;
};

export type EventCounts = {
  bookmarks?: number;
  checkIns?: number;
  comments?: number;
  photos?: number;
  reports?: number;
  reviews?: number;
  rsvps?: number;
  shares?: number;
  views?: number;
};

export type EventUserSummary = {
  handle?: string | null;
  id: string;
  name: string;
  profileImageUrl?: string | null;
};

export type EventMedia = {
  assetType?: string | null;
  contentType?: string | null;
  id?: string;
  mimeType?: string | null;
  thumbnailUrl?: string | null;
  type?: "image" | "video" | "audio" | string;
  url: string;
};

export type EventPermission = {
  canDelete?: boolean;
  canEdit?: boolean;
  canManageAttendees?: boolean;
};

export type EventOrganizer =
  EventUserSummary & {
    bio?: string | null;
    eventsOrganized?: number;
    phone?: string | null;
    rating?: number;
  };

export type EventFaq = {
  answer: string;
  question: string;
};

export type SaiEvent = {
  address: string;
  bannerUrl?: string | null;
  bookmarkedByMe?: boolean;
  bookmarks?: number;
  city?: string | null;
  checkIns?: number;
  comments?: number;
  country?: string | null;
  createdAt?: string;
  description: string;
  distanceKm?: number | null;
  endAt: string;
  faq?: EventFaq[];
  guidelines?: string[];
  id: string;
  isOwner?: boolean;
  latitude: number;
  longitude: number;
  media?: EventMedia[];
  organizer?: EventOrganizer | null;
  ownerId?: string;
  ownerName?: string | null;
  ownerProfileImageUrl?: string | null;
  permissions?: EventPermission;
  photos?: number;
  rating?: number;
  reviews?: number;
  rsvpedByMe?: boolean;
  rsvps?: number;
  shares?: number;
  similarEvents?: SaiEvent[];
  startAt: string;
  state?: string | null;
  status?: EventStatus;
  tags?: string[];
  timezone?: string;
  title: string;
  type?: EventType;
  updatedAt?: string;
  venueName?: string | null;
  views?: number;
  _count?: EventCounts;
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

export type EventListParams = {
  dateFrom?: string;
  dateTo?: string;
  lat?: number;
  limit?: number;
  lng?: number;
  offset?: number;
  page?: number;
  q?: string;
  radius?: number;
  sort?: EventSort | string;
  type?: EventType | string;
};

export type EventListResult = {
  events: SaiEvent[];
  pagination?: EventPagination | null;
};

export type EventCommentsResult = {
  comments: EventComment[];
  pagination?: EventPagination | null;
};

export type EventCalendarDay = {
  date: string;
  dots?: {
    color?: string;
    key?: string;
    selectedDotColor?: string;
  }[];
  events: SaiEvent[];
};

export type EventCalendarSummary = {
  attending?: number;
  byType?: Partial<Record<EventType, number>>;
  total?: number;
};

export type EventCalendarResult = {
  days: EventCalendarDay[];
  events: SaiEvent[];
  summary?: EventCalendarSummary | null;
};

export type EventRsvpPayload = {
  guestCount?: number;
  reminderMinutesBefore?: number;
  status?: "going" | "interested" | "not_going" | string;
};

export type EventRsvp = {
  checkedInAt?: string | null;
  eventId: string;
  guestCount?: number;
  id: string;
  reminderMinutesBefore?: number | null;
  status?: string;
  userId: string;
};

export type EventRsvpResult = {
  event: SaiEvent;
  rsvp?: EventRsvp;
};

export type UploadEventMediaPayload = {
  files?: {
    fileSize?: number | null;
    mimeType?: string | null;
    name?: string | null;
    size?: number | null;
    type?: string | null;
    uri?: string;
  }[];
  formData: FormData;
};

export type UploadedEventMedia = {
  assetType?: string | null;
  contentType?: string | null;
  mimeType?: string | null;
  thumbnailUrl?: string | null;
  type?: string;
  url: string;
};

export type UploadEventMediaResult = {
  media?: UploadedEventMedia[];
  url?: string;
  urls?: string[];
};

export type CreateEventPayload = {
  address: string;
  bannerUrl?: string | null;
  city?: string;
  country?: string;
  description: string;
  endAt: string;
  faq?: EventFaq[];
  guidelines?: string[];
  latitude: number;
  longitude: number;
  recurrence?: {
    count?: number;
    frequency:
      | "daily"
      | "weekly"
      | "monthly"
      | string;
    interval?: number;
    until?: string;
  };
  startAt: string;
  state?: string;
  tags?: string[];
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
  addingComment: boolean;
  calendar: SaiEvent[];
  commentsError: string | null;
  commentsLoading: boolean;
  comments: EventComment[];
  commentsPagination: EventPagination | null;
  creating: boolean;
  detail: SaiEvent | null;
  error: string | null;
  feed: SaiEvent[];
  feedPagination: EventPagination | null;
  loading: boolean;
  myEvents: SaiEvent[];
  myEventsPagination: EventPagination | null;
  myRsvps: SaiEvent[];
  myRsvpsPagination: EventPagination | null;
  rsvpPendingIds: Record<string, boolean>;
  calendarDays: EventCalendarDay[];
  calendarSummary: EventCalendarSummary | null;
  uploadedMedia: UploadEventMediaResult | null;
  uploadingMedia: boolean;
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
