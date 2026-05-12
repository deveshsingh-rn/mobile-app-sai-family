import { apiClient, getAuthHeaders } from './api';

export async function apiFetchExperiences(params: { limit?: number; offset?: number; category?: string }) {
  console.log('API_REQUEST: apiFetchExperiences', params);
  const { data } = await apiClient.get('/api/experiences', { params });
  console.log('API_RESPONSE: apiFetchExperiences', data);
  return data;
}

export async function apiSearchExperiences(params: { q: string; limit?: number; offset?: number }) {
  console.log('API_REQUEST: apiSearchExperiences', params);
  const { data } = await apiClient.get('/api/experiences/search', { params });
  console.log('API_RESPONSE: apiSearchExperiences', data);
  return data;
}

export async function apiCreateExperience(formData: FormData, userId: string) {
  console.log('API_REQUEST: apiCreateExperience', { formData, userId });
  const { data } = await apiClient.post('/api/experiences', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      ...getAuthHeaders(userId),
    },
    transformRequest: (data) => data,
  });
  console.log('API_RESPONSE: apiCreateExperience', data);
  return data;
}

export async function apiFetchExperienceDetail(id: string, params?: { commentLimit?: number; commentOffset?: number }) {
  console.log('API_REQUEST: apiFetchExperienceDetail', { id, params });
  const { data } = await apiClient.get(`/api/experiences/${id}`, { params });
  console.log('API_RESPONSE: apiFetchExperienceDetail', data);
  return data;
}

export async function apiToggleLike(id: string, userId: string) {
  console.log('API_REQUEST: apiToggleLike', { id, userId });
  const { data } = await apiClient.post(`/api/experiences/${id}/like`, {}, {
    headers: getAuthHeaders(userId),
  });
  console.log('API_RESPONSE: apiToggleLike', data);
  return data;
}

export async function apiAddComment(id: string, content: string, userId: string) {
  console.log('API_REQUEST: apiAddComment', { id, content, userId });
  const { data } = await apiClient.post(`/api/experiences/${id}/comments`, { content }, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(userId),
    },
  });
  console.log('API_RESPONSE: apiAddComment', data);
  return data;
}

export async function apiToggleRepost(id: string, userId: string) {
  console.log('API_REQUEST: apiToggleRepost', { id, userId });
  const { data } = await apiClient.post(`/api/experiences/${id}/repost`, {}, {
    headers: getAuthHeaders(userId),
  });
  console.log('API_RESPONSE: apiToggleRepost', data);
  return data;
}

export async function apiToggleBookmark(id: string, userId: string) {
  console.log('API_REQUEST: apiToggleBookmark', { id, userId });
  const { data } = await apiClient.post(`/api/experiences/${id}/bookmark`, {}, {
    headers: getAuthHeaders(userId),
  });
  console.log('API_RESPONSE: apiToggleBookmark', data);
  return data;
}

export async function apiFetchBookmarks(params: { limit?: number; offset?: number }, userId: string) {
  console.log('API_REQUEST: apiFetchBookmarks', { params, userId });
  const { data } = await apiClient.get('/api/users/me/bookmarks', {
    params,
    headers: getAuthHeaders(userId),
  });
  console.log('API_RESPONSE: apiFetchBookmarks', data);
  return data;
}