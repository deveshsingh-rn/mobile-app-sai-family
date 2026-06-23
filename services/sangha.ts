import { apiClient } from "./api";
import type {
  SanghaDiscoverySettingsPayload,
  SanghaHomeParams,
} from "@/store/sangha/types";

export async function apiUpdateSanghaDiscovery(
  payload: SanghaDiscoverySettingsPayload
) {
  const { data } = await apiClient.patch(
    "/api/users/me/sangha-discovery",
    payload
  );

  return data;
}

export async function apiFetchSanghaHome(
  params: SanghaHomeParams = {}
) {
  const { data } = await apiClient.get("/api/sangha/home", {
    params,
  });

  return data;
}

export async function apiFetchSanghaDevotees(
  params: Record<string, any> = {}
) {
  const { data } = await apiClient.get(
    "/api/sangha/devotees",
    { params }
  );

  return data;
}

export async function apiFetchSanghaDevoteeProfile(
  id: string
) {
  const { data } = await apiClient.get(
    `/api/sangha/devotees/${id}`
  );

  return data;
}

export async function apiRequestSanghaConnection(
  devoteeId: string
) {
  const { data } = await apiClient.post(
    `/api/sangha/devotees/${devoteeId}/connect`
  );

  return data;
}

export async function apiAcceptSanghaConnection(
  connectionId: string
) {
  const { data } = await apiClient.post(
    `/api/sangha/connections/${connectionId}/accept`
  );

  return data;
}

export async function apiDeclineSanghaConnection(
  connectionId: string
) {
  const { data } = await apiClient.post(
    `/api/sangha/connections/${connectionId}/decline`
  );

  return data;
}

export async function apiDisconnectSanghaDevotee(
  devoteeId: string
) {
  const { data } = await apiClient.delete(
    `/api/sangha/devotees/${devoteeId}/connect`
  );

  return data;
}

export async function apiBlockSanghaDevotee(
  devoteeId: string,
  payload: { reason?: string } = {}
) {
  const { data } = await apiClient.post(
    `/api/sangha/devotees/${devoteeId}/block`,
    payload
  );

  return data;
}

export async function apiFetchSanghaGroupsHome(
  params: Record<string, any> = {}
) {
  const { data } = await apiClient.get(
    "/api/sangha/groups/home",
    { params }
  );

  return data;
}

export async function apiSearchSanghaGroups(
  params: Record<string, any>
) {
  const { data } = await apiClient.get(
    "/api/sangha/groups/search",
    { params }
  );

  return data;
}

export async function apiFetchSanghaRecentSearches(
  params: Record<string, any> = {}
) {
  const { data } = await apiClient.get(
    "/api/users/me/sangha/recent-searches",
    { params }
  );

  return data;
}

export async function apiAddSanghaRecentSearch(payload: {
  query: string;
}) {
  const { data } = await apiClient.post(
    "/api/users/me/sangha/recent-searches",
    payload
  );

  return data;
}

export async function apiClearSanghaRecentSearches() {
  const { data } = await apiClient.delete(
    "/api/users/me/sangha/recent-searches"
  );

  return data;
}

export async function apiFetchSanghaGroups(
  params: Record<string, any> = {}
) {
  const { data } = await apiClient.get(
    "/api/sangha/groups",
    { params }
  );

  return data;
}

export async function apiFetchSanghaInvitations(
  params: Record<string, any> = {}
) {
  const { data } = await apiClient.get(
    "/api/users/me/sangha/invitations",
    { params }
  );

  return data;
}

export async function apiAcceptSanghaInvitation(
  invitationId: string
) {
  const { data } = await apiClient.post(
    `/api/users/me/sangha/invitations/${invitationId}/accept`
  );

  return data;
}

export async function apiDeclineSanghaInvitation(
  invitationId: string
) {
  const { data } = await apiClient.post(
    `/api/users/me/sangha/invitations/${invitationId}/decline`
  );

  return data;
}

export async function apiFetchSanghaGroupDetail(
  groupId: string
) {
  const { data } = await apiClient.get(
    `/api/sangha/groups/${groupId}`
  );

  return data;
}

export async function apiFetchSanghaGroupPosts(
  groupId: string,
  params: Record<string, any> = {}
) {
  const { data } = await apiClient.get(
    `/api/sangha/groups/${groupId}/posts`,
    { params }
  );

  return data;
}

export async function apiFetchSanghaGroupMembers(
  groupId: string,
  params: Record<string, any> = {}
) {
  const { data } = await apiClient.get(
    `/api/sangha/groups/${groupId}/members`,
    { params }
  );

  return data;
}

export async function apiFetchSanghaGroupEvents(
  groupId: string,
  params: Record<string, any> = {}
) {
  const { data } = await apiClient.get(
    `/api/sangha/groups/${groupId}/events`,
    { params }
  );

  return data;
}

export async function apiFetchSanghaLiveStreams(
  params: Record<string, any> = {}
) {
  const { data } = await apiClient.get(
    "/api/sangha/live-streams",
    { params }
  );

  return data;
}
