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

export async function apiFetchSanghaGroupFeed(
  groupId: string,
  params: Record<string, any> = {}
) {
  const { data } = await apiClient.get(
    `/api/sangha/groups/${groupId}/feed`,
    { params }
  );

  return data;
}

export async function apiFetchSanghaGroupMembership(
  groupId: string
) {
  const { data } = await apiClient.get(
    `/api/sangha/groups/${groupId}/membership`
  );

  return data;
}

export async function apiFetchSanghaGroupJoinRequests(
  groupId: string,
  params: Record<string, any> = {}
) {
  const { data } = await apiClient.get(
    `/api/sangha/groups/${groupId}/join-requests`,
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

export async function apiCreateSanghaGroupEvent(
  groupId: string,
  payload: Record<string, any>
) {
  const { data } = await apiClient.post(
    `/api/sangha/groups/${groupId}/events`,
    payload
  );

  return data;
}

export async function apiRsvpSanghaGroupEvent(
  groupId: string,
  eventId: string
) {
  const { data } = await apiClient.post(
    `/api/sangha/groups/${groupId}/events/${eventId}/rsvp`
  );

  return data;
}

export async function apiCancelSanghaGroupEventRsvp(
  groupId: string,
  eventId: string
) {
  const { data } = await apiClient.delete(
    `/api/sangha/groups/${groupId}/events/${eventId}/rsvp`
  );

  return data;
}

export async function apiJoinSanghaGroup(groupId: string) {
  const { data } = await apiClient.post(
    `/api/sangha/groups/${groupId}/join`
  );

  return data;
}

export async function apiLeaveSanghaGroup(groupId: string) {
  const { data } = await apiClient.delete(
    `/api/sangha/groups/${groupId}/membership`
  );

  return data;
}

export async function apiCreateSanghaGroupPost(
  groupId: string,
  payload: {
    content: string;
    mediaUrls?: string[];
    type?: string;
  }
) {
  const { data } = await apiClient.post(
    `/api/sangha/groups/${groupId}/posts`,
    payload
  );

  return data;
}

export async function apiLikeSanghaGroupPost(
  groupId: string,
  postId: string
) {
  const { data } = await apiClient.post(
    `/api/sangha/groups/${groupId}/posts/${postId}/like`
  );

  return data;
}

export async function apiUnlikeSanghaGroupPost(
  groupId: string,
  postId: string
) {
  const { data } = await apiClient.delete(
    `/api/sangha/groups/${groupId}/posts/${postId}/like`
  );

  return data;
}

export async function apiFetchSanghaGroupPostComments(
  groupId: string,
  postId: string,
  params: Record<string, any> = {}
) {
  const { data } = await apiClient.get(
    `/api/sangha/groups/${groupId}/posts/${postId}/comments`,
    { params }
  );

  return data;
}

export async function apiCreateSanghaGroupPostComment(
  groupId: string,
  postId: string,
  payload: { content: string }
) {
  const { data } = await apiClient.post(
    `/api/sangha/groups/${groupId}/posts/${postId}/comments`,
    payload
  );

  return data;
}

export async function apiPinSanghaGroupPost(
  groupId: string,
  postId: string
) {
  const { data } = await apiClient.post(
    `/api/sangha/groups/${groupId}/posts/${postId}/pin`
  );

  return data;
}

export async function apiUnpinSanghaGroupPost(
  groupId: string,
  postId: string
) {
  const { data } = await apiClient.delete(
    `/api/sangha/groups/${groupId}/posts/${postId}/pin`
  );

  return data;
}

export async function apiDeleteSanghaGroupPost(
  groupId: string,
  postId: string
) {
  const { data } = await apiClient.delete(
    `/api/sangha/groups/${groupId}/posts/${postId}`
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

export async function apiFetchSanghaNotifications(
  params: Record<string, any> = {}
) {
  const { data } = await apiClient.get(
    "/api/users/me/sangha/notifications",
    { params }
  );

  return data;
}

export async function apiMarkSanghaNotificationsRead(payload: {
  notificationIds: string[];
}) {
  const { data } = await apiClient.post(
    "/api/users/me/sangha/notifications/read",
    payload
  );

  return data;
}

export async function apiStartSanghaConversation(payload: {
  groupId?: string;
  participantUserId: string;
  type: "direct" | string;
}) {
  const { data } = await apiClient.post(
    "/api/sangha/conversations",
    payload
  );

  return data;
}

export async function apiFetchSanghaConversationMessages(
  conversationId: string,
  params: Record<string, any> = {}
) {
  const { data } = await apiClient.get(
    `/api/sangha/conversations/${conversationId}/messages`,
    { params }
  );

  return data;
}

export async function apiSendSanghaConversationMessage(
  conversationId: string,
  payload: { content: string }
) {
  const { data } = await apiClient.post(
    `/api/sangha/conversations/${conversationId}/messages`,
    payload
  );

  return data;
}

export async function apiMarkSanghaConversationRead(
  conversationId: string
) {
  const { data } = await apiClient.patch(
    `/api/sangha/conversations/${conversationId}/read`
  );

  return data;
}
