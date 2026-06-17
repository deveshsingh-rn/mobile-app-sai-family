import { apiClient } from "./api";
import type {
  CreateEventPayload,
  CalendarPreferences,
  CommunityCalendar,
  EventAnalyticsResult,
  EventAttendeesResult,
  EventCommentsResult,
  EventListParams,
  EventPhotosResult,
  EventReportPayload,
  EventReviewPayload,
  EventReviewsResult,
  EventCheckInResult,
  EventDraft,
  EventDraftPayload,
  EventDraftPublishResult,
  EventHomeResult,
  EventListResult,
  EventNearbyResult,
  EventPlacesResult,
  EventCalendarResult,
  EventRecommendationResult,
  EventTitleSuggestionsPayload,
  EventTitleSuggestionsResult,
  EventRsvpPayload,
  EventRsvpResult,
  SaiEvent,
  UpdateEventPayload,
  UploadEventMediaResult,
} from "@/store/events/types";

export async function apiFetchEvents(
  params: EventListParams = {}
): Promise<EventListResult> {
  const { data } = await apiClient.get(
    "/api/events",
    {
      params,
    }
  );

  return data;
}

export async function apiFetchEventsHome(params: {
  limit?: number;
} = {}): Promise<EventHomeResult> {
  const { data } = await apiClient.get(
    "/api/events/home",
    {
      params,
    }
  );

  return data;
}

export async function apiFetchNearbyEvents(
  params: EventListParams = {}
): Promise<EventNearbyResult> {
  const { data } = await apiClient.get(
    "/api/events/nearby",
    {
      params,
    }
  );

  return data;
}

export async function apiSearchEventPlaces(params: {
  city?: string;
  limit?: number;
  q: string;
}): Promise<EventPlacesResult> {
  const { data } = await apiClient.get(
    "/api/places/search",
    {
      params,
    }
  );

  return data;
}

export async function apiFetchEventTitleSuggestions(
  payload: EventTitleSuggestionsPayload
): Promise<EventTitleSuggestionsResult> {
  const { data } = await apiClient.post(
    "/api/events/suggestions/title",
    payload
  );

  return data;
}

export async function apiFetchEventDetail(
  id: string
): Promise<{ event: SaiEvent }> {
  const { data } = await apiClient.get(
    `/api/events/${id}`
  );

  return data;
}

export async function apiCreateEvent(
  payload: CreateEventPayload
): Promise<{ event: SaiEvent }> {
  const { data } = await apiClient.post(
    "/api/events",
    payload
  );

  return data;
}

export async function apiUpdateEvent(
  id: string,
  payload: Omit<UpdateEventPayload, "id">
): Promise<{ event: SaiEvent }> {
  const { data } = await apiClient.patch(
    `/api/events/${id}`,
    payload
  );

  return data;
}

export async function apiCreateEventDraft(
  payload: EventDraftPayload
): Promise<{ draft: EventDraft }> {
  const { data } = await apiClient.post(
    "/api/events/drafts",
    payload
  );

  return data;
}

export async function apiUpdateEventDraft(
  id: string,
  payload: EventDraftPayload
): Promise<{ draft: EventDraft }> {
  const { data } = await apiClient.patch(
    `/api/events/drafts/${id}`,
    payload
  );

  return data;
}

export async function apiPublishEventDraft(
  id: string
): Promise<EventDraftPublishResult> {
  const { data } = await apiClient.post(
    `/api/events/drafts/${id}/publish`
  );

  return data;
}

export async function apiDeleteEvent(
  id: string
): Promise<{
  id: string;
  status?: string;
  success: boolean;
}> {
  const { data } = await apiClient.delete(
    `/api/events/${id}`
  );

  return data;
}

export async function apiRsvpEvent(
  id: string,
  payload: EventRsvpPayload = {
    status: "going",
  }
): Promise<EventRsvpResult> {
  const { data } = await apiClient.post(
    `/api/events/${id}/rsvp`,
    payload
  );

  return data;
}

export async function apiCancelEventRsvp(
  id: string
): Promise<EventRsvpResult> {
  const { data } = await apiClient.delete(
    `/api/events/${id}/rsvp`
  );

  return data;
}

export async function apiFetchMyRsvps(
  params: EventListParams = {}
): Promise<EventListResult> {
  const { data } = await apiClient.get(
    "/api/users/me/rsvps",
    {
      params,
    }
  );

  return data;
}

export async function apiFetchMyEvents(
  params: EventListParams = {}
): Promise<EventListResult> {
  const { data } = await apiClient.get(
    "/api/users/me/events",
    {
      params,
    }
  );

  return data;
}

export async function apiFetchEventCalendar(
  month: string
): Promise<EventCalendarResult> {
  const { data } = await apiClient.get(
    "/api/events/calendar",
    {
      params: {
        month,
      },
    }
  );

  return data;
}

export async function apiFetchEventRecommendations(
  params: {
    limit?: number;
  } = {}
): Promise<EventRecommendationResult> {
  const { data } = await apiClient.get(
    "/api/events/recommendations",
    {
      params,
    }
  );

  return data;
}

export async function apiFetchCalendarPreferences(): Promise<{
  preference: CalendarPreferences;
}> {
  const { data } = await apiClient.get(
    "/api/users/me/calendar/preferences"
  );

  return data;
}

export async function apiUpdateCalendarPreferences(
  payload: Partial<CalendarPreferences>
): Promise<{
  preference: CalendarPreferences;
}> {
  const { data } = await apiClient.patch(
    "/api/users/me/calendar/preferences",
    payload
  );

  return data;
}

export async function apiExportCalendarIcs(): Promise<string> {
  const { data } = await apiClient.get(
    "/api/users/me/calendar.ics",
    {
      responseType: "text",
    }
  );

  return data;
}

export async function apiFetchCommunityCalendars(params: {
  city?: string;
  type?: string;
} = {}): Promise<{
  calendars: CommunityCalendar[];
}> {
  const { data } = await apiClient.get(
    "/api/community-calendars",
    {
      params,
    }
  );

  return data;
}

export async function apiSubscribeCommunityCalendar(
  id: string
): Promise<{
  calendar: CommunityCalendar;
  subscription?: unknown;
}> {
  const { data } = await apiClient.post(
    `/api/community-calendars/${id}/subscribe`
  );

  return data;
}

export async function apiUnsubscribeCommunityCalendar(
  id: string
): Promise<{
  calendar: CommunityCalendar;
}> {
  const { data } = await apiClient.delete(
    `/api/community-calendars/${id}/subscribe`
  );

  return data;
}

export async function apiFetchEventComments(
  id: string,
  params: EventListParams = {}
): Promise<EventCommentsResult> {
  const { data } = await apiClient.get(
    `/api/events/${id}/comments`,
    {
      params,
    }
  );

  return data;
}

export async function apiAddEventComment(
  id: string,
  content: string
): Promise<{
  _count?: {
    comments?: number;
  };
  comment: unknown;
  eventId?: string;
}> {
  const { data } = await apiClient.post(
    `/api/events/${id}/comments`,
    {
      content,
    }
  );

  return data;
}

export async function apiBookmarkEvent(
  id: string
): Promise<{
  _count?: { bookmarks?: number };
  bookmarked?: boolean;
  event?: SaiEvent;
  eventId?: string;
}> {
  const { data } = await apiClient.post(
    `/api/events/${id}/bookmark`
  );

  return data;
}

export async function apiUnbookmarkEvent(
  id: string
): Promise<{
  _count?: { bookmarks?: number };
  bookmarked?: boolean;
  event?: SaiEvent;
  eventId?: string;
}> {
  const { data } = await apiClient.delete(
    `/api/events/${id}/bookmark`
  );

  return data;
}

export async function apiShareEvent(
  id: string,
  channel = "native_share"
): Promise<{
  eventId?: string;
  shared?: boolean;
  shares?: number;
}> {
  const { data } = await apiClient.post(
    `/api/events/${id}/share`,
    {
      channel,
    }
  );

  return data;
}

export async function apiFetchEventReviews(
  id: string,
  params: EventListParams = {}
): Promise<EventReviewsResult> {
  const { data } = await apiClient.get(
    `/api/events/${id}/reviews`,
    {
      params,
    }
  );

  return data;
}

export async function apiAddEventReview(
  id: string,
  payload: EventReviewPayload
): Promise<{
  review?: unknown;
  summary?: EventReviewsResult["summary"];
}> {
  const { data } = await apiClient.post(
    `/api/events/${id}/reviews`,
    payload
  );

  return data;
}

export async function apiFetchEventAttendees(
  id: string,
  params: EventListParams = {}
): Promise<EventAttendeesResult> {
  const { data } = await apiClient.get(
    `/api/events/${id}/attendees`,
    {
      params,
    }
  );

  return data;
}

export async function apiFetchEventAnalytics(
  id: string
): Promise<EventAnalyticsResult> {
  const { data } = await apiClient.get(
    `/api/events/${id}/analytics`
  );

  return data;
}

export async function apiCheckInEventAttendee(
  id: string,
  userId: string
): Promise<EventCheckInResult> {
  const { data } = await apiClient.post(
    `/api/events/${id}/check-in`,
    {
      userId,
    }
  );

  return data;
}

export async function apiReportEvent(
  id: string,
  payload: EventReportPayload
): Promise<{
  report?: unknown;
}> {
  const { data } = await apiClient.post(
    `/api/events/${id}/report`,
    payload
  );

  return data;
}

export async function apiFetchEventPhotos(
  id: string,
  params: EventListParams = {}
): Promise<EventPhotosResult> {
  const { data } = await apiClient.get(
    `/api/events/${id}/photos`,
    {
      params,
    }
  );

  return data;
}

export async function apiUploadEventPhotos(
  id: string,
  formData: FormData
): Promise<{
  _count?: {
    photos?: number;
  };
  photos?: unknown[];
}> {
  const { data } = await apiClient.post(
    `/api/events/${id}/photos`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 150000,
    }
  );

  return data;
}

export async function apiUploadEventMedia(
  formData: FormData
): Promise<UploadEventMediaResult> {
  const { data } = await apiClient.post(
    "/api/media/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 150000,
    }
  );

  return data;
}
