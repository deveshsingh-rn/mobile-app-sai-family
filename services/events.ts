import { apiClient } from "./api";

export async function apiFetchEvents(params = {}) {
  const { data } = await apiClient.get(
    "/api/events",
    {
      params,
    }
  );

  return data;
}

export async function apiFetchEventDetail(id: string) {
  const { data } = await apiClient.get(
    `/api/events/${id}`
  );

  return data;
}

export async function apiCreateEvent(payload: unknown) {
  const { data } = await apiClient.post(
    "/api/events",
    payload
  );

  return data;
}

export async function apiUpdateEvent(
  id: string,
  payload: unknown
) {
  const { data } = await apiClient.patch(
    `/api/events/${id}`,
    payload
  );

  return data;
}

export async function apiDeleteEvent(id: string) {
  const { data } = await apiClient.delete(
    `/api/events/${id}`
  );

  return data;
}

export async function apiRsvpEvent(id: string) {
  const { data } = await apiClient.post(
    `/api/events/${id}/rsvp`
  );

  return data;
}

export async function apiCancelEventRsvp(id: string) {
  const { data } = await apiClient.delete(
    `/api/events/${id}/rsvp`
  );

  return data;
}

export async function apiFetchMyRsvps(params = {}) {
  const { data } = await apiClient.get(
    "/api/users/me/rsvps",
    {
      params,
    }
  );

  return data;
}

export async function apiFetchMyEvents(params = {}) {
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
) {
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

export async function apiFetchEventComments(
  id: string,
  params = {}
) {
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
) {
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
) {
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
