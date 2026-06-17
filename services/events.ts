import { apiClient } from "./api";
import type {
  CreateEventPayload,
  CalendarPreferences,
  CommunityCalendar,
  EventCommentsResult,
  EventListParams,
  EventListResult,
  EventCalendarResult,
  EventRecommendationResult,
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
