# Pillar 4 Sangha: Product, API, Integration And Release Guide

This is the single source of truth for Pillar 4. Frontend, backend, QA, and
product decisions must be recorded here instead of creating another Sangha
status or todo document.

Document status: Active

Last consolidated: 2026-08-31

Target v1 release: 2026-09-01

Source API collection: `postman-api-collection.json`, starting at
`GET /api/sangha/home - Discovery Home`

## How To Use This Document

- Backend owns request/response contracts, validation, authorization, privacy,
  pagination, query performance, moderation, and operational guarantees.
- Frontend owns typed services, Redux Saga workflows, capability-aware UI,
  loading/error/empty states, bounded pagination, and lifecycle cleanup.
- QA owns the signed-in device checklist and records failures against the
  affected capability in the integration matrix.
- A contract change is complete only after the API collection, this document,
  frontend types, and backend implementation agree.
- Do not mark a feature production-ready from static checks alone. Protected
  mutations must pass on the exact release candidate build.

## Release Scope And Status

Pillar 4 v1 includes devotee discovery, privacy settings, profiles, connection
lifecycle, groups, invitations, group administration, unified feed, direct
chat, group events, RSVP, and Sangha notifications.

Current code status: implemented for the v1 scope and ready for signed-in
device smoke testing. It is not approved for production submission until the
release checklist near the end of this document passes.

Live streaming is explicitly deferred to v2. No v1 button or route should
expose a partial streaming experience.

Frontend entry point: `app/(tabs)/sangha.tsx`
Related routes:

- `app/sangha-list.tsx`
- `app/sangha-profile.tsx`
- `app/sangha-hub.tsx`
- `app/sangha-hub-search.tsx`
- `app/sangha-hub-list.tsx`
- `app/group-details.tsx`

Related screens:

- `screens/sangha-list-screen.tsx`
- `screens/sangha-profile-screen.tsx`
- `screens/sangha-hub-screen.tsx`
- `screens/sangha-hub-search-screen.tsx`
- `screens/sangha-hub-list-screen.tsx`
- `screens/group-details-screen.tsx`

## Product Goal

Sangha is the community pillar. It helps devotees discover nearby or recommended devotees, connect with them, join groups, manage invitations, participate in group feeds, members, events, and about sections, while preserving privacy and moderation controls.

The v1 UI is connected to live APIs. Backend must continue providing paginated
data, current-user flags, privacy-safe distance, and authoritative group/member
capability state.

## Core Product Surfaces

### 1. Sangha Discovery Home

Screen: `app/(tabs)/sangha.tsx`

Features:

- Filter devotees by distance, tradition, and purpose.
- Toggle near-me discovery opt-in.
- Show current selected filters.
- Show "Near You" devotees.
- Show "Suggested For You" devotees.
- Open devotee profile.
- Navigate to Sangha Hub.

### 2. Devotee Lists

Screen: `app/sangha-list.tsx`

Features:

- List devotees near user.
- List suggested devotees.
- Open devotee profile.
- Pagination required.

### 3. Devotee Profile

Screen: `app/sangha-profile.tsx`

Features:

- Profile header, avatar, location, tradition/interests.
- Connect / pending / connected / message states.
- Mutual connections.
- About tab.
- Experiences tab.
- Events tab.
- Privacy-safe public profile fields.

### 4. Sangha Hub

Screen: `app/sangha-hub.tsx`

Features:

- Group search entry.
- Filter groups by purpose, activity, privacy.
- Pending invitations carousel.
- Explore by purpose.
- My groups preview.
- Notification dot/count.
- Open group list/detail.
- Accept/decline invitations.

### 5. Hub Search

Screen: `app/sangha-hub-search.tsx`

Features:

- Search groups by query.
- Recent searches.
- Suggested groups.
- Save/clear recent searches.
- Open group detail.

### 6. Hub Lists

Screen: `app/sangha-hub-list.tsx`

Features:

- Pending invitations full screen.
- My groups full screen.
- Groups by purpose full screen.
- Accept/decline invitation.
- Open group detail.
- Pagination required.

### 7. Group Details

Screen: `app/group-details.tsx`

Features:

- Group hero, banner, members count, join/joined/pending state.
- Tabs: Feed, Members, Events, About.
- Group feed post composer.
- Pinned post.
- Feed posts with likes/comments.
- Member requests for admins/moderators.
- Members list, member search, invite, admins, filter.
- Group calendar/events, RSVP.
- About: purpose, stats, guidelines, privacy/location.
- Admin/moderator actions.

#### Group Details Cross-Pillar API Bridges

The mobile UI now launches existing pillar flows from the group detail tabs. Backend should support these bridges so Sangha does not maintain duplicate event/feed/chat logic.

Required:

- `GET /api/sangha/groups/:id/feed`
  - Returns a unified paginated group feed.
  - Should include Sangha group posts, linked Experience pillar posts, linked Event pillar updates, pinned items, and moderation flags.
  - Query params: `limit`, `offset`, `types=post,experience,event`, `pinnedFirst=true`.
  - Each item should include `sourceType`, `sourceId`, `createdAt`, `author`, `canLike`, `canComment`, `canPin`, `canDelete`, and current-user state.

- `POST /api/events` with optional Sangha context, or an equivalent `POST /api/sangha/groups/:id/events/publish-from-event`
  - The Event pillar create screen should create a full event using the existing Event payload, while attaching `groupId`.
  - Backend should return the normal Event detail plus group event projection.
  - Permission rule: current user must be group member/moderator/admin and allowed to create events.

- `GET /api/sangha/groups/:id/join-requests`
  - Needed to replace static member request counts in group feed/admin surfaces.
  - Should return pending requests with requester summary, requestedAt, note, and approve/decline permission flags.

- `GET /api/sangha/groups/:id/membership`
  - Returns current user membership status and capability flags.
  - Suggested fields: `membershipStatus`, `role`, `canPost`, `canComment`, `canCreateEvent`, `canInvite`, `canModerate`, `pendingRequestId`.

### 8. Sangha Communication And Direct Messaging

Screens:

- `app/sangha-requests.tsx`
- `app/sangha-chat.tsx`
- `screens/sangha-chat-screen.tsx`
- `app/sangha-conversations.tsx`

Communication is the heart of Sangha v1. A devotee should be able to discover another devotee, request connection, accept the request, then talk safely with privacy, moderation, and clear read state.

#### Communication Product Rules

- Direct one-to-one chat is allowed only after both devotees are connected.
- A group-context conversation is allowed only when both devotees are active members of the same group.
- A blocked relationship disables discovery visibility, connection actions, conversation creation, and new messages both ways.
- Frontend must not unlock chat from local state alone. It must use backend `connection.canMessage` or successful conversation creation.
- Backend must never expose mobile/email in chat payloads. Messages include compact public profile fields only.
- Message content is plain text in v1. Images, audio notes, attachments, typing indicators, and realtime sockets are v2 unless explicitly prioritized.
- REST polling must remain supported even if WebSocket/SSE is added later.

#### Recommended User Flow

1. User opens Sangha Discovery and views a devotee profile.
2. Frontend reads `connection.status` and `connection.canMessage` from `GET /api/sangha/devotees/:id`.
3. If status is `none`, show Connect.
4. Sender taps Connect: `POST /api/sangha/devotees/:id/connect` returns `pending_sent`.
5. Receiver opens Requests Center, loaded from `GET /api/users/me/sangha/connections?direction=received&status=pending`, and accepts with `POST /api/sangha/connections/:id/accept`.
6. Both users now receive `connectionStatus: connected` and profile detail should return `canMessage: true`.
7. User taps Message. Frontend calls `POST /api/sangha/conversations`.
8. Frontend opens chat screen with returned `conversation.id`.
9. Chat screen loads messages using `GET /api/sangha/conversations/:id/messages?limit=30`.
10. New messages are sent through `POST /api/sangha/conversations/:id/messages`.
11. When chat opens or gains focus, frontend calls `PATCH /api/sangha/conversations/:id/read`.
12. If abuse occurs, user reports a received message using `POST /api/sangha/messages/:id/report` or blocks the devotee from profile.

#### Backend Conversation APIs

##### `POST /api/sangha/conversations`

Creates or reuses a direct conversation. This endpoint is idempotent for the same two participants and optional group context.

Auth:

```http
Authorization: Bearer <accessToken>
```

Local development may also use:

```http
x-user-id: <current-user-id>
```

Body:

```json
{
  "type": "direct",
  "participantUserId": "target-user-id",
  "groupId": null
}
```

Validation:

- `type`: only `direct` currently.
- `participantUserId`: required.
- `groupId`: optional. When provided, both devotees must be active group members.
- Without `groupId`, an accepted Sangha connection is required.
- Cannot start conversation with self.
- Cannot start conversation if either user blocked the other.

Success response: `201 Created`

```json
{
  "conversation": {
    "id": "conversation-id",
    "type": "direct",
    "groupId": null,
    "group": null,
    "participantUserId": "target-user-id",
    "participant": {
      "id": "target-user-id",
      "memberId": "SF-2026-000002",
      "name": "Ananya Sharma",
      "handle": "ananya_sharma",
      "profileImageUrl": "https://..."
    },
    "lastMessageAt": null,
    "readAt": null,
    "createdAt": "2026-08-31T10:00:00.000Z",
    "updatedAt": "2026-08-31T10:00:00.000Z"
  }
}
```

Common errors:

| Code | Meaning |
| --- | --- |
| `INVALID_CONVERSATION_PARTICIPANT` | User tried to message self. |
| `DEVOTEE_NOT_FOUND` | Target user missing or inactive. |
| `CONNECTION_REQUIRED` | Direct message attempted before accepted connection. |
| `GROUP_MEMBER_REQUIRED` | Group-context DM attempted when both users are not active members. |
| `MESSAGE_BLOCKED` | One user blocked the other. |

##### `GET /api/sangha/conversations/:id/messages?limit=30&before=<cursor>`

Loads chat history newest-first with cursor pagination.

Query:

| Name | Required | Notes |
| --- | --- | --- |
| `limit` | No | 1 to 50, default 30. |
| `before` | No | Cursor returned as `nextCursor`; use for older messages. |

Success response:

```json
{
  "messages": [
    {
      "id": "message-id",
      "conversationId": "conversation-id",
      "content": "Jai Sai Ram, happy to connect.",
      "status": "delivered",
      "deliveredAt": "2026-08-31T10:00:05.000Z",
      "readAt": null,
      "createdAt": "2026-08-31T10:00:05.000Z",
      "updatedAt": "2026-08-31T10:00:05.000Z",
      "isMine": true,
      "author": {
        "id": "current-user-id",
        "memberId": "SF-2026-000001",
        "name": "Devesh Kumar Singh",
        "handle": "devesh_kumar_singh",
        "profileImageUrl": "https://..."
      }
    }
  ],
  "nextCursor": "base64url-cursor-or-null"
}
```

Frontend handling:

- Backend returns newest-first. In an inverted chat list, append older pages after the current list.
- Deduplicate by `message.id` when merging pages and optimistic messages.
- Use `nextCursor === null` to stop loading older messages.
- Do not use offset for chat history.

##### `POST /api/sangha/conversations/:id/messages`

Sends a text message.

Body:

```json
{
  "content": "Jai Sai Ram. Are you joining the Thursday seva?"
}
```

Validation:

- `content`: required, trimmed, min 1, max 1000 chars.
- Current user must be a conversation participant.
- Messaging fails if either participant blocked the other after conversation creation.
- Rate limit: 30 messages per minute per user.

Success response: `201 Created`

```json
{
  "message": {
    "id": "message-id",
    "conversationId": "conversation-id",
    "content": "Jai Sai Ram. Are you joining the Thursday seva?",
    "status": "delivered",
    "deliveredAt": "2026-08-31T10:02:00.000Z",
    "readAt": null,
    "createdAt": "2026-08-31T10:02:00.000Z",
    "updatedAt": "2026-08-31T10:02:00.000Z",
    "isMine": true,
    "author": {
      "id": "current-user-id",
      "memberId": "SF-2026-000001",
      "name": "Devesh Kumar Singh",
      "handle": "devesh_kumar_singh",
      "profileImageUrl": "https://..."
    }
  }
}
```

Frontend handling:

- Create an optimistic message with a local `clientTempId`, `status: sending`, and current timestamp.
- Replace optimistic message when backend response arrives.
- If request fails, keep message visible with `status: failed` and allow retry.
- After sending, poll the messages endpoint or refresh the active conversation state.

##### `PATCH /api/sangha/conversations/:id/read`

Marks the conversation read for current user and updates incoming messages to `read`.

Success response:

```json
{
  "success": true,
  "conversationId": "conversation-id",
  "readAt": "2026-08-31T10:03:00.000Z"
}
```

Frontend handling:

- Call when chat screen opens, regains focus, or after new incoming messages are rendered.
- Throttle repeated read calls to avoid unnecessary requests.
- Update local unread badge immediately after success.

##### `POST /api/sangha/messages/:id/report`

Reports a received message. Users cannot report their own message.

Body:

```json
{
  "reason": "abuse",
  "note": "This message is inappropriate."
}
```

Allowed reason:

- `spam`
- `abuse`
- `privacy`
- `other`

Success response: `201 Created`

```json
{
  "report": {
    "id": "report-id",
    "messageId": "message-id",
    "reason": "abuse",
    "note": "This message is inappropriate.",
    "status": "pending",
    "createdAt": "2026-08-31T10:04:00.000Z"
  }
}
```

#### Required Frontend Chat States

| State | UI Behavior |
| --- | --- |
| `not_connected` | Show Connect button; hide message composer. |
| `pending_sent` | Show request sent state; allow cancel. |
| `pending_received` | Show Accept and Decline. |
| `connected` | Show Message button and allow conversation creation. |
| `blocked` | Hide message composer and show blocked state. |
| `conversation_loading` | Open chat shell with loader. |
| `message_sending` | Show optimistic outgoing bubble. |
| `message_failed` | Show retry/delete local actions. |
| `message_delivered` | Show single delivered indicator. |
| `message_read` | Show read indicator only for outgoing messages. |

The devotee detail response must include the pending/active connection ID so
mobile mutations never have to infer it:

```json
{
  "connection": {
    "id": "connection-id",
    "connectionId": "connection-id",
    "status": "pending_received",
    "canConnect": false,
    "canMessage": false
  }
}
```

For one compatibility release, mobile also accepts `connectionId` from the
notification payload and can recover it from the notification list.

#### Communication Notifications

Backend currently creates Sangha notifications for connection requests, accepted connections, group invitations, and new messages. Frontend should consume them from:

```http
GET /api/users/me/sangha/notifications?limit=20&offset=0&unreadOnly=false
POST /api/users/me/sangha/notifications/read
```

Production notification routing contract:

| Backend type/kind | Required payload | Mobile destination | User action |
| --- | --- | --- | --- |
| `connection_request` | `actorUserId`, `connectionId` | `/sangha-profile?id=<actorUserId>` | Accept or decline request. |
| `connection_accepted` | `actorUserId`, `connectionId` | `/sangha-profile?id=<actorUserId>` | Open profile and start chat. |
| `group_invitation` | `invitationId`, `groupId` | `/sangha-hub-list?type=pending&invitationId=<id>` | Accept or decline invitation. |
| `group_invitation_accepted` | `groupId`, `invitationId` | `/group-details?id=<groupId>` | Open the group. |
| `sangha_message` | `conversationId`, `messageId`, `senderUserId` | `/sangha-chat?conversationId=<id>` | Read and reply. |

The mobile resolver supports both Expo push payloads (flat IDs) and notification
list records (`data`, `actor`, and `group` relations). Tapping an in-app
notification marks it read and then opens the actionable destination. A group
invitation opened from a notification is moved to the top of the pending list
and visually highlighted.

#### Conversation Inbox

The backend and frontend use this dedicated conversation list endpoint:

```http
GET /api/users/me/sangha/conversations?limit=20&offset=0
```

Suggested response:

```json
{
  "conversations": [
    {
      "id": "conversation-id",
      "type": "direct",
      "groupId": null,
      "participant": {},
      "lastMessage": {
        "id": "message-id",
        "content": "Jai Sai Ram",
        "createdAt": "2026-08-31T10:02:00.000Z",
        "isMine": false
      },
      "lastMessageAt": "2026-08-31T10:02:00.000Z",
      "unreadCount": 1,
      "readAt": null
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "hasMore": false,
    "nextOffset": null
  }
}
```

Until this endpoint exists, frontend can open chat from profile/member cards and use notifications for message entry. A full WhatsApp-style inbox should wait for this API.

#### Production Realtime Chat Contract

REST chat is wired for v1 reliability. To make Sangha chat feel like a
production messaging app, backend and frontend should add realtime delivery on
top of the existing REST APIs. REST remains the fallback and source of truth.

Recommended transport:

```text
WebSocket over TLS
wss://<baseUrl>/api/sangha/chat/ws?token=<shortLivedChatToken>
```

Do not pass the long-lived app access token in the query string. Frontend should
first request a short-lived chat token:

```http
POST /api/sangha/chat/session
Authorization: Bearer <accessToken>
```

Suggested response:

```json
{
  "sessionId": "chat-session-id",
  "webSocketUrl": "wss://saifamily.sustaininsight.com/api/sangha/chat/ws?token=...",
  "expiresAt": "2026-08-31T12:30:00.000Z",
  "heartbeatIntervalMs": 25000
}
```

Frontend socket events sent to backend:

```ts
type SanghaClientChatEvent =
  | {
      type: "message_send";
      clientMessageId: string;
      content: string;
    }
  | {
      type: "typing";
      isTyping: boolean;
    }
  | {
      type: "read";
    }
  | {
      type: "ping";
      id?: string;
    };
```

Each short-lived session token and returned WebSocket URL is scoped to exactly
one conversation. The client must not send a separate `subscribe` event.

Backend socket events sent to frontend:

```ts
type SanghaServerChatEvent =
  | {
      type: "connected";
      conversationId: string;
      userId: string;
      messages: SanghaMessage[];
      nextCursor: string | null;
      heartbeatSeconds: number;
    }
  | {
      type: "message_created";
      clientMessageId?: string;
      conversationId: string;
      message: SanghaMessage;
    }
  | {
      type: "message_status";
      conversationId: string;
      messageIds: string[];
      status: "sent" | "delivered" | "read";
      readAt?: string;
      deliveredAt?: string;
    }
  | {
      type: "typing";
      conversationId: string;
      userId: string;
      isTyping: boolean;
    }
  | {
      type: "conversation_updated";
      conversation: SanghaConversation;
    }
  | {
      type: "error";
      code:
        | "UNAUTHENTICATED"
        | "CONNECTION_REQUIRED"
        | "MESSAGE_BLOCKED"
        | "RATE_LIMITED"
        | "VALIDATION_ERROR";
      message: string;
      clientMessageId?: string;
      conversationId?: string;
    }
  | {
      type: "pong";
      serverTime: string;
    };
```

Backend rules:

- Persist every `message_send` before broadcasting `message_created`.
- Use `clientMessageId` for idempotency so reconnect/resend cannot duplicate messages.
- Broadcast to all active sessions of every participant.
- If receiver is offline, create push notification and keep message unread.
- Enforce accepted connection, block state, participant membership, and rate limits on every send.
- Keep message text max 1000 chars, plain text only for v1.
- Store `sentAt`, `deliveredAt`, and `readAt`; do not trust client timestamps for final server state.
- Close inactive sockets after missed heartbeats.
- Revoke chat session tokens on logout or account block.
- Publish chat events through shared Redis pub/sub so clients connected to
  different API instances still receive messages, typing, and read events.
- Keep the process-local broadcast as the low-latency path and REST message
  creation as the durable fallback.

Frontend rules:

- Open the conversation-scoped WebSocket returned by `POST /api/sangha/chat/session`.
- Keep REST `GET /api/sangha/conversations/:id/messages` as initial load and reconnect fallback.
- Reconnect with bounded exponential backoff and reload recent REST messages to
  close any missed-event gap.
- Send optimistic messages immediately with `status: "sending"` and a stable `clientMessageId`.
- Replace the local optimistic bubble when `message_created.clientMessageId` returns.
- If socket is disconnected, queue local sends and retry when online; show `failed` only after backend rejects or retry budget expires.
- Send `message_read` when chat screen is focused and visible.
- Show typing indicator only after `typing_start`, auto-clear after 5 seconds if `typing_stop` is missed.
- On reconnect, reload latest messages by REST to close any missed-event gap.
- Do not expose message composer if backend says `canMessage=false`.

#### Production Chat UI Scope

To feel complete for devotees, chat should include:

- Chat inbox list with unread count and last message.
- Direct chat from connected devotee profile.
- Direct chat from group member card when group-context permissions allow it.
- Clear pending/connected/blocked states before chat opens.
- Optimistic send, failed retry, delivered/read labels.
- Long-press report for received messages.
- Push notification tap to conversation.
- Smooth keyboard handling and large touch targets for older users.

#### Chat Implementation Phases

Phase A: REST-complete v1

- Profile connect/request/accept/decline/block flow.
- Message button only after `canMessage=true` or `connected`.
- Create/reuse conversation with `POST /api/sangha/conversations`.
- Load, send, read, and report messages through REST.
- Push notification deep-links to chat.

Phase B: Inbox

- Add `GET /api/users/me/sangha/conversations`.
- Create `app/sangha-conversations.tsx`.
- Show unread counts, last message, and search.

Phase C: Realtime WebSocket

- Add short-lived `POST /api/sangha/chat/session`.
- Add `wss /api/sangha/chat/ws`.
- Support realtime send, receive, typing, delivered, read, reconnect, and offline queue.
- Use Redis pub/sub for cross-instance realtime fan-out.

Phase D: Rich Messaging

- Media upload bridge for images/audio.
- Reply-to-message and delete-for-me.
- Admin moderation dashboard for reported messages.

#### Communication QA Checklist

- [ ] User A sends connection request to User B.
- [ ] User A cannot create direct conversation before User B accepts.
- [ ] User B accepts and both profiles return `connection.canMessage=true`.
- [ ] User A creates conversation and sends first message.
- [ ] User B opens chat from notification and sees the message.
- [ ] User B replies; User A sees reply after polling/refresh.
- [ ] Read endpoint updates incoming message status to `read`.
- [ ] Older message pagination loads without duplicates or reversed order bugs.
- [ ] Reporting own message fails; reporting another user's message succeeds.
- [ ] Blocking a user prevents new messages and hides connect/message actions.
- [ ] Group-context conversation succeeds only when both users are active group members.
- [ ] Message content above 1000 chars fails with validation error.
- [ ] Rapid send is rate-limited after backend threshold.

### 9. Live Satsang / Bhajan Streaming

Future feature for Sangha groups and official communities.

Features:

- Schedule a live stream for bhajan, satsang, seva orientation, pravachan, or group announcement.
- Host/admin can start, pause/end, and moderate the live session.
- Members can join live stream from group detail, Sangha Hub, or notification.
- Live chat with moderation.
- Reactions during stream.
- Viewer count and attendance tracking.
- Optional recording playback after stream ends.
- Reminder notifications before stream starts.

## Authentication

All protected endpoints require the signed-in user token in production:

```http
Authorization: Bearer <accessToken>
```

Local development and Postman smoke tests may also use:

```http
x-user-id: <currentAccountAuthorId>
```

Current mobile app should send auth whenever available because recommendations, privacy, connection state, chat permissions, and membership flags are current-user specific.

## Privacy Rules

Sangha has sensitive location and social graph data. Backend must enforce:

- Near-me discovery is opt-in.
- Never expose exact latitude/longitude of another devotee.
- Distance should be rounded/bucketed, for example `1.2 km away`, `Same city`, `Online`.
- If user disables discovery, exclude them from near-me lists.
- Respect blocked users both ways.
- Respect profile visibility: `public`, `members_only`, `connections_only`, `private`.
- Hide mobile/email unless explicitly allowed.
- Group private content is visible only to members.

## Data Models

### Sangha Devotee Summary

```ts
type SanghaDevoteeSummary = {
  id: string;
  userId: string;
  memberId?: string;
  name: string;
  avatarUrl?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  approximateLocationLabel?: string | null;
  tradition?: string | null;
  purposeTags?: string[];
  interests?: string[];
  bio?: string | null;
  distanceKm?: number | null;
  distanceLabel?: string | null;
  mutualConnectionCount?: number;
  mutualGroupCount?: number;
  recommendationReason?: string | null;
  connectionStatus: "none" | "pending_sent" | "pending_received" | "connected" | "blocked";
  nearMeEnabled?: boolean;
  lastActiveLabel?: string | null;
};
```

### Sangha Devotee Detail

```ts
type SanghaDevoteeDetail = SanghaDevoteeSummary & {
  quote?: string | null;
  memberSince?: string | null;
  mutualConnections?: SanghaDevoteeSummary[];
  recentExperiences?: Array<{
    id: string;
    content: string;
    imageUrl?: string | null;
    place?: string | null;
    likeCount: number;
    createdAt: string;
  }>;
  upcomingEvents?: Array<{
    id: string;
    title: string;
    type: string;
    startAt: string;
    venueName?: string | null;
    city?: string | null;
  }>;
};
```

### Sangha Group Summary

```ts
type SanghaGroupSummary = {
  id: string;
  slug?: string;
  name: string;
  purpose: "city_chapter" | "seva" | "bhajan" | "online_global" | "satsang" | "study" | "general";
  privacy: "public" | "private" | "invite_only";
  activityStatus: "active" | "quiet" | "new";
  bannerUrl?: string | null;
  iconUrl?: string | null;
  description?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  memberCount: number;
  postCount?: number;
  eventCount?: number;
  pendingRequestCount?: number;
  lastActivityAt?: string | null;
  lastActivityLabel?: string | null;
  nextEventAt?: string | null;
  membershipStatus: "none" | "invited" | "requested" | "member" | "admin" | "moderator" | "blocked";
  canJoin: boolean;
  canPost: boolean;
  canInvite: boolean;
  canModerate: boolean;
  recommendationReason?: string | null;
};
```

### Sangha Group Detail

```ts
type SanghaGroupDetail = SanghaGroupSummary & {
  guidelines?: string | null;
  purposeText?: string | null;
  pinnedPost?: SanghaGroupPost | null;
  previewMembers?: SanghaGroupMember[];
  stats?: {
    activeMemberPercent?: number;
    totalEvents?: number;
    totalPosts?: number;
    weeklyActiveMembers?: number;
  };
};
```

### Sangha Group Member

```ts
type SanghaGroupMember = {
  id: string;
  userId: string;
  name: string;
  avatarUrl?: string | null;
  role: "owner" | "admin" | "moderator" | "seva_lead" | "member";
  statusLabel?: string | null;
  joinedAt: string;
  canMessage?: boolean;
  canPromote?: boolean;
  canRemove?: boolean;
};
```

### Sangha Invitation

```ts
type SanghaInvitation = {
  id: string;
  group: SanghaGroupSummary;
  invitedBy: SanghaDevoteeSummary;
  status: "pending" | "accepted" | "declined" | "expired";
  createdAt: string;
  expiresAt?: string | null;
};
```

### Sangha Group Post

```ts
type SanghaGroupPost = {
  id: string;
  groupId: string;
  author: SanghaDevoteeSummary;
  type: "text" | "photo" | "event_share" | "notice";
  content: string;
  media?: Array<{
    id: string;
    url: string;
    type: "image" | "video";
    thumbnailUrl?: string | null;
  }>;
  pinned?: boolean;
  likeCount: number;
  commentCount: number;
  likedByMe?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  createdAt: string;
  updatedAt?: string;
};
```

### Sangha Group Event

Group events can reference Pillar 2 Events when available.

```ts
type SanghaGroupEvent = {
  id: string;
  eventId?: string | null;
  groupId: string;
  title: string;
  type: "bhajan" | "seva" | "satsang" | "study" | "general";
  startAt: string;
  endAt?: string | null;
  timezone?: string;
  venueName?: string | null;
  address?: string | null;
  isOnline?: boolean;
  onlineUrl?: string | null;
  rsvpCount: number;
  rsvpStatus?: "going" | "not_going" | null;
};
```

### Sangha Live Stream

```ts
type SanghaLiveStream = {
  id: string;
  groupId?: string | null;
  eventId?: string | null;
  hostUserId: string;
  hostName: string;
  hostAvatarUrl?: string | null;
  title: string;
  description?: string | null;
  type: "bhajan" | "satsang" | "pravachan" | "seva_orientation" | "announcement" | "general";
  visibility: "public" | "group_members" | "invite_only";
  status: "scheduled" | "live" | "ended" | "cancelled" | "failed";
  scheduledAt?: string | null;
  startedAt?: string | null;
  endedAt?: string | null;
  thumbnailUrl?: string | null;
  playbackUrl?: string | null;
  recordingStatus?: "none" | "processing" | "ready" | "failed";
  viewerCount?: number;
  peakViewerCount?: number;
  chatEnabled: boolean;
  reactionsEnabled: boolean;
  canHost?: boolean;
  canJoin?: boolean;
  canModerate?: boolean;
};
```

### Sangha Live Chat Message

```ts
type SanghaLiveChatMessage = {
  id: string;
  streamId: string;
  author: SanghaDevoteeSummary;
  content: string;
  status: "visible" | "hidden" | "deleted";
  createdAt: string;
  canDelete?: boolean;
};
```

## API Endpoints

### Discovery Home

#### `GET /api/sangha/home`

Returns the main discovery data for `app/(tabs)/sangha.tsx`.

Query:

- `distance=nearby|same_city|online`
- `tradition=all|shirdi_sai|iskcon|art_of_living|vipassana|...`
- `purpose=connect|bhajan|seva|events`
- `lat`, `lng` optional if near-me is enabled
- `limit` default `10`

Response:

```json
{
  "filters": {
    "distance": "nearby",
    "tradition": "all",
    "purpose": "connect"
  },
  "nearMeEnabled": true,
  "nearYou": [],
  "suggestedForYou": [],
  "stats": {
    "nearbyCount": 12,
    "suggestedCount": 25,
    "pendingInvitations": 2
  }
}
```

### Near-Me Privacy

#### `PATCH /api/users/me/sangha-discovery`

Body:

```json
{
  "nearMeEnabled": true,
  "tradition": "Shirdi Sai",
  "purposeTags": ["seva", "bhajan"],
  "profileVisibility": "members_only"
}
```

Response:

```json
{
  "settings": {
    "nearMeEnabled": true,
    "profileVisibility": "members_only"
  }
}
```

### Devotee Discovery Lists

#### `GET /api/sangha/devotees`

Used by `app/sangha-list.tsx`.

Query:

- `type=near|suggested`
- `distance`
- `tradition`
- `purpose`
- `lat`, `lng`
- `limit`, `offset`

Response:

```json
{
  "devotees": [],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "nextOffset": 20,
    "hasMore": true,
    "total": 86
  }
}
```

### Devotee Profile

#### `GET /api/sangha/devotees/:id`

Used by `app/sangha-profile.tsx`.

Response:

```json
{
  "profile": {},
  "connection": {
    "status": "none",
    "canConnect": true,
    "canMessage": false
  }
}
```

### Connections

#### `GET /api/users/me/sangha/connections`

Authoritative paginated Requests Center source. Notifications are alerts and
must not be used as the connection-request database.

Query:

- `direction=received|sent|all`
- `status=pending|connected|declined`
- `limit=1..50`
- `offset>=0`

Each row returns `connectionId`, relative `status`, privacy-safe `devotee`, and
backend capability flags `canAccept`, `canDecline`, and `canCancel`.

#### `POST /api/sangha/devotees/:id/connect`

Creates a connection request.

Response:

```json
{
  "connectionStatus": "pending_sent"
}
```

#### `POST /api/sangha/connections/:id/accept`

Accepts a received connection request.

#### `POST /api/sangha/connections/:id/decline`

Declines a received connection request.

#### `DELETE /api/sangha/devotees/:id/connect`

Cancels sent request or disconnects, depending on current state.

#### `POST /api/sangha/devotees/:id/block`

Blocks a devotee and removes them from discovery.

### Sangha Hub Home

#### `GET /api/sangha/groups/home`

Used by `app/sangha-hub.tsx`.

Query:

- `purpose=all|city_chapter|seva|bhajan|online_global`
- `activity=active|quiet|new`
- `privacy=any|public|private|invite_only`
- `limit` default `10`

Response:

```json
{
  "pendingInvitations": [],
  "purposeTiles": [
    {
      "purpose": "seva",
      "title": "Seva",
      "subtitle": "Purpose & service",
      "groupCount": 18
    }
  ],
  "myGroups": [],
  "notificationCount": 2,
  "filters": {
    "purpose": "all",
    "activity": "active",
    "privacy": "any"
  }
}
```

### Group Search

#### `GET /api/sangha/groups/search`

Used by `app/sangha-hub-search.tsx`.

Query:

- `q`
- `purpose`
- `privacy`
- `limit`, `offset`

Response:

```json
{
  "groups": [],
  "suggestions": [],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "hasMore": false
  }
}
```

#### `GET /api/users/me/sangha/recent-searches`

Returns recent group searches.

#### `POST /api/users/me/sangha/recent-searches`

Body:

```json
{
  "query": "Mumbai Youth Seva"
}
```

#### `DELETE /api/users/me/sangha/recent-searches`

Clears recent group searches.

### Group Lists

#### `GET /api/sangha/groups`

Used by hub list screens.

Query:

- `type=my|purpose|recommended|public`
- `purpose=seva|bhajan|city_chapter|online_global`
- `activity`
- `privacy`
- `limit`, `offset`

Response:

```json
{
  "groups": [],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "nextOffset": 20,
    "hasMore": true,
    "total": 120
  }
}
```

### Invitations

#### `GET /api/users/me/sangha/invitations`

Query:

- `status=pending|accepted|declined|expired`
- `limit`, `offset`

Response:

```json
{
  "invitations": [],
  "pagination": {}
}
```

#### `POST /api/users/me/sangha/invitations/:id/accept`

Accept invitation and join group.

#### `POST /api/users/me/sangha/invitations/:id/decline`

Decline invitation.

#### `POST /api/sangha/groups/:id/invitations`

Admin/member invite user to group.

Body:

```json
{
  "userId": "target-user-id",
  "message": "Join our Thursday bhajan circle."
}
```

### Group Detail

#### `GET /api/sangha/groups/:id`

Used by `app/group-details.tsx`.

Response:

```json
{
  "group": {},
  "currentUser": {
    "membershipStatus": "member",
    "role": "member",
    "canPost": true,
    "canInvite": true,
    "canModerate": false
  }
}
```

### Join And Leave Groups

#### `POST /api/sangha/groups/:id/join`

For public groups, joins immediately. For private groups, creates request.

Response:

```json
{
  "membershipStatus": "member"
}
```

#### `DELETE /api/sangha/groups/:id/membership`

Leaves group.

#### `POST /api/sangha/groups/:id/join-requests/:requestId/approve`

Admin/moderator approves member request.

#### `POST /api/sangha/groups/:id/join-requests/:requestId/decline`

Admin/moderator declines member request.

### Group Feed

#### `GET /api/sangha/groups/:id/posts`

Query:

- `limit`, `offset`
- `pinnedFirst=true`

Response:

```json
{
  "posts": [],
  "pagination": {}
}
```

#### `POST /api/sangha/groups/:id/posts`

Body:

```json
{
  "type": "text",
  "content": "Hari Om family...",
  "mediaUrls": [],
  "eventId": null
}
```

Validation:

- `content` min 1 max 3000
- `mediaUrls` max 10
- user must be member and `canPost`

#### `PATCH /api/sangha/groups/:id/posts/:postId`

Update own post or moderator edit.

#### `DELETE /api/sangha/groups/:id/posts/:postId`

Delete own post or moderator delete.

#### `POST /api/sangha/groups/:id/posts/:postId/like`

Like post.

#### `DELETE /api/sangha/groups/:id/posts/:postId/like`

Unlike post.

#### `GET /api/sangha/groups/:id/posts/:postId/comments`

Paginated comments.

#### `POST /api/sangha/groups/:id/posts/:postId/comments`

Body:

```json
{
  "content": "Jai Sai Ram"
}
```

### Group Members

#### `GET /api/sangha/groups/:id/members`

Query:

- `q`
- `role=all|admin|moderator|member`
- `status=active|new|online`
- `limit`, `offset`

Response:

```json
{
  "members": [],
  "pagination": {}
}
```

#### `PATCH /api/sangha/groups/:id/members/:memberId`

Admin/moderator updates role.

Body:

```json
{
  "role": "moderator"
}
```

#### `DELETE /api/sangha/groups/:id/members/:memberId`

Remove member.

### Group Events

Group events should either be backed by Pillar 2 events or mirrored from them.

#### `GET /api/sangha/groups/:id/events`

Query:

- `status=upcoming|past`
- `limit`, `offset`

Response:

```json
{
  "events": [],
  "pagination": {}
}
```

#### `POST /api/sangha/groups/:id/events`

Creates a group-scoped event. Backend can create a Pillar 2 event and attach `groupId`.

Body follows Pillar 2 event payload plus:

```json
{
  "groupId": "group-id",
  "visibility": "group_members"
}
```

#### `POST /api/sangha/groups/:id/events/:eventId/rsvp`

RSVP to group event.

#### `DELETE /api/sangha/groups/:id/events/:eventId/rsvp`

Cancel RSVP.

### Live Streaming

Live streaming should be designed as a provider-backed feature, not as a mobile-device-to-backend raw video pipe. Backend should create short-lived host/viewer tokens for a streaming provider such as Agora, LiveKit, Mux Live, AWS IVS, or a similar managed service.

Recommended first release:

- backend manages stream metadata, permissions, tokens, chat, notifications, recordings
- streaming provider handles real-time audio/video transport
- mobile app receives token/channel/playback URLs from backend

#### `POST /api/sangha/live-streams`

Create/schedule a live stream.

Auth:

- `x-user-id` required
- user must be group admin/moderator or official host for public stream

Body:

```json
{
  "groupId": "group-id",
  "eventId": "optional-event-id",
  "title": "Thursday Sai Bhajan Live",
  "description": "Live bhajan and aarti from the community hall.",
  "type": "bhajan",
  "visibility": "group_members",
  "scheduledAt": "2026-06-25T14:00:00.000Z",
  "chatEnabled": true,
  "reactionsEnabled": true,
  "recordingEnabled": true,
  "thumbnailUrl": "https://..."
}
```

Response:

```json
{
  "stream": {}
}
```

#### `GET /api/sangha/live-streams`

List live/scheduled streams.

Query:

- `groupId`
- `status=scheduled|live|ended`
- `type`
- `visibility`
- `limit`, `offset`

Response:

```json
{
  "streams": [],
  "pagination": {}
}
```

#### `GET /api/sangha/live-streams/:id`

Get stream detail and current-user permissions.

Response:

```json
{
  "stream": {},
  "currentUser": {
    "canJoin": true,
    "canHost": false,
    "canModerate": false
  }
}
```

#### `POST /api/sangha/live-streams/:id/start`

Starts the stream and returns host token.

Auth:

- host/admin only

Response:

```json
{
  "stream": {},
  "hostSession": {
    "provider": "livekit",
    "channelId": "stream-channel",
    "token": "short-lived-host-token",
    "expiresAt": "2026-06-22T12:30:00.000Z"
  }
}
```

#### `POST /api/sangha/live-streams/:id/join`

Returns viewer token/session. Also records attendance.

Response:

```json
{
  "stream": {},
  "viewerSession": {
    "provider": "livekit",
    "channelId": "stream-channel",
    "token": "short-lived-viewer-token",
    "expiresAt": "2026-06-22T12:30:00.000Z"
  }
}
```

#### `POST /api/sangha/live-streams/:id/end`

Ends stream.

Auth:

- host/admin only

Response:

```json
{
  "stream": {
    "status": "ended",
    "recordingStatus": "processing"
  }
}
```

#### `POST /api/sangha/live-streams/:id/heartbeat`

Host heartbeat. Backend uses this to detect failed/abandoned streams.

Body:

```json
{
  "viewerCount": 42
}
```

#### `GET /api/sangha/live-streams/:id/chat`

Paginated live chat history.

Query:

- `limit`
- `before`
- `after`

Response:

```json
{
  "messages": [],
  "pagination": {}
}
```

#### `POST /api/sangha/live-streams/:id/chat`

Body:

```json
{
  "content": "Jai Sai Ram"
}
```

Validation:

- content min 1 max 500
- chat must be enabled
- user must be allowed to view stream

#### `DELETE /api/sangha/live-streams/:id/chat/:messageId`

Delete/hide chat message.

Auth:

- author can delete own message
- moderator/admin can hide any message

#### `POST /api/sangha/live-streams/:id/reactions`

Body:

```json
{
  "reaction": "heart"
}
```

Allowed reactions:

- `om`
- `heart`
- `namaste`
- `clap`
- `blessing`

#### `GET /api/sangha/live-streams/:id/recording`

Returns playback metadata when recording is ready.

Response:

```json
{
  "recordingStatus": "ready",
  "playbackUrl": "https://...",
  "thumbnailUrl": "https://...",
  "durationSeconds": 3600
}
```

#### `POST /api/sangha/live-streams/:id/report`

Report stream/chat abuse.

Body:

```json
{
  "targetType": "stream_chat_message",
  "targetId": "message-id",
  "reason": "spam",
  "details": "Repeated promotional messages"
}
```

### Group Admin And Moderation

#### `POST /api/sangha/groups`

Create group.

Body:

```json
{
  "name": "Mumbai Youth Seva",
  "purpose": "seva",
  "privacy": "public",
  "description": "Weekly seva planning group.",
  "guidelines": "Be kind and respectful.",
  "city": "Mumbai",
  "state": "Maharashtra",
  "country": "India",
  "bannerUrl": "https://..."
}
```

#### `PATCH /api/sangha/groups/:id`

Update group settings.

#### `DELETE /api/sangha/groups/:id`

Archive group. Prefer soft-delete.

#### `POST /api/sangha/groups/:id/posts/:postId/pin`

Pin post.

#### `DELETE /api/sangha/groups/:id/posts/:postId/pin`

Unpin post.

#### `POST /api/sangha/reports`

Report devotee, group, post, or comment.

Body:

```json
{
  "targetType": "group_post",
  "targetId": "post-id",
  "reason": "spam",
  "details": "Promotional content"
}
```

### Notifications

Backend should emit notification events for:

- Connection request received.
- Connection accepted.
- Group invitation received.
- Group join request received for admins.
- Group invitation accepted.
- Group post comment/reply.
- Group event reminder.
- Live stream scheduled.
- Live stream starting soon.
- Live stream started.
- Live stream recording ready.
- Group admin announcement.
- Moderator action outcome.

Suggested endpoint for push-token reuse:

- Existing `POST /api/users/me/push-token`

Sangha notification listing:

#### `GET /api/users/me/sangha/notifications`

Query:

- `limit`, `offset`, `unreadOnly`

#### `POST /api/users/me/sangha/notifications/read`

Body:

```json
{
  "notificationIds": ["id-1", "id-2"]
}
```

## Media Upload

Reuse:

```http
POST /api/media/upload
```

Use form-data:

- `file` or `files`
- `context=sangha`
- optional `groupId`
- optional `postId`

Frontend should upload media first, then send returned URLs to group/post/profile APIs.

Accepted MIME:

- images: jpeg, png, webp
- video: mp4, quicktime

Limits:

- group/post media max 10 files
- profile avatar/banner max 1 file
- backend should generate thumbnails for video and large images

## Admin Panel Requirements

Admin backend/API should support:

- List all groups with search/filter by purpose, privacy, city, status.
- View group detail, members, posts, reports, events.
- Create/update/archive groups.
- Verify official chapters.
- Promote/demote group admins/moderators.
- Remove members.
- Approve/decline flagged posts.
- View reports by target type and status.
- Resolve reports with audit trail.
- Send group announcements.
- Manage live streams: schedule, end, remove recording, moderate chat.
- View live stream attendance and reports.
- View growth/engagement metrics.

Admin-only endpoints can be under:

```http
/api/admin/sangha/*
```

Required admin roles:

- `mandir_admin`
- `super_admin`
- optional `community_moderator`

## Performance Requirements

### Pagination

Every list endpoint must support:

- `limit`
- `offset`
- `nextOffset`
- `hasMore`
- `total` when cheap enough

Default limit:

- mobile previews: 5 to 10
- full lists: 20
- feed posts/comments: 20

### Query Performance

Recommended indexes:

- `sangha_profiles(userId)`
- `sangha_profiles(city, state, country)`
- `sangha_profiles(nearMeEnabled)`
- `sangha_profiles(tradition)`
- geospatial index for approximate location if available
- `sangha_connections(requesterId, receiverId, status)`
- `sangha_groups(purpose, privacy, activityStatus, city)`
- `sangha_group_members(groupId, userId, role)`
- `sangha_group_posts(groupId, createdAt)`
- `sangha_group_posts(groupId, pinned, createdAt)`
- `sangha_group_events(groupId, startAt)`
- `sangha_invitations(userId, status, createdAt)`
- `sangha_recent_searches(userId, createdAt)`
- `sangha_live_streams(groupId, status, scheduledAt)`
- `sangha_live_streams(status, scheduledAt)`
- `sangha_live_stream_attendance(streamId, userId)`
- `sangha_live_chat_messages(streamId, createdAt)`

### Caching

Backend can cache:

- purpose tiles
- public group summaries
- popular/suggested groups
- group stats

Do not cache:

- current-user membership flags
- current-user connection status
- private group content
- invitations

### Response Shape

Keep mobile responses compact:

- return summaries in list endpoints
- return detail only when detail screen opens
- avoid nesting full members/posts/events in every group list item
- cap preview arrays at 5

### Memory And Resource Safety

Backend should avoid memory leaks and large heap pressure:

- Stream uploads to object storage; do not buffer large files fully in memory.
- Do not proxy raw live video through the app backend. Use provider tokens and managed real-time infrastructure.
- Live stream tokens must be short-lived and scoped to stream/channel/role.
- Heartbeat cleanup should mark stale live streams as `failed` or `ended`.
- Chat/reactions must be rate-limited per user and per stream.
- Enforce upload size and count before processing where possible.
- Use pagination for all feeds/members/comments.
- Avoid loading all group members to compute counts; maintain counters.
- Avoid unbounded regex search; use indexed text search or trigram/full-text index.
- Use cursor/offset bounds and max `limit`.
- Clean temp upload files after success/failure.
- Release background job resources after notifications/media processing.
- Use idempotency keys for invitation/connect actions to prevent duplicate writes.
- Add database transactions for membership/invitation state transitions.

### Realtime/Future

Not required for first release, but design should allow:

- WebSocket/SSE for group feed updates.
- Typing indicators for group chat if messaging is added later.
- Push notifications for invitations/comments/events.

## Validation Rules

### Group Create/Update

- `name` required, min 3, max 80
- `description` max 1000
- `guidelines` max 2000
- `purpose` enum
- `privacy` enum
- `city/state/country` optional but min 2 when provided
- `bannerUrl` valid URL

### Group Post

- `content` required if no media
- `content` max 3000
- `mediaUrls` max 10
- user must be group member with `canPost`

### Live Stream

- `title` required, min 3, max 120
- `description` max 1000
- `type` enum
- `visibility` enum
- `scheduledAt` required for scheduled streams
- host must have `canHost`
- viewer token only if `canJoin`
- chat content min 1 max 500
- reaction enum only

### Connection Request

- cannot connect to self
- cannot connect when blocked
- duplicate pending requests should return existing state, not create duplicates

### Invitation

- inviter must be group member with `canInvite`
- cannot invite blocked users
- cannot invite existing members
- duplicate pending invitation should return existing invitation

## Shared Implementation Status

The endpoint definitions above remain authoritative. This table records whether
each product capability is connected to a user-facing frontend flow.

| Capability | Backend/API | Frontend | Release |
| --- | --- | --- | --- |
| Redux/service foundation | Available | Integrated | v1 |
| Discovery home and privacy filters | Available | Integrated | v1 |
| Devotee lists and profile | Available | Integrated | v1 |
| Connect, accept, decline, disconnect, block | Available | Integrated | v1 |
| Unified received/sent/group Requests Center | Available | Integrated | v1 |
| Hub home, search, recent searches, group lists | Available | Integrated | v1 |
| Invitations list, send, accept, decline | Available | Integrated | v1 |
| Group create, edit, archive | Available | Integrated | v1 |
| Group detail and membership capabilities | Available | Integrated | v1 |
| Join, leave, and private-group approval | Available | Integrated | v1 |
| Members, role changes, removal | Available | Integrated | v1 |
| Unified feed and legacy posts fallback | Available | Integrated | v1 |
| Create, edit, delete, like, comment, pin posts | Available | Integrated | v1 |
| Direct conversations, messages, read state, report | Available | Integrated | v1 |
| Group Events bridge using `POST /api/events` and `groupId` | Available | Integrated | v1 |
| Group event list and RSVP lifecycle | Available | Integrated | v1 |
| Sangha notifications and read state | Available | Integrated | v1 |
| Bounded pagination for feed, requests, members, events, chat | Available | Integrated | v1 |
| Live stream lifecycle, chat, reactions, recording | Contract defined | Not exposed | v2 |

### Frontend Architecture

The Sangha frontend follows the feature module used by the other pillars:

- `services/sangha.ts`
- `store/sangha/types.ts`
- `store/sangha/actions.ts`
- `store/sangha/reducer.ts`
- `store/sangha/saga.ts`
- `store/sangha/selectors.ts`
- `store/sangha/validation.ts`
- Sangha reducer and saga registered in the global store

Screen integration order and ownership:

1. `app/(tabs)/sangha.tsx`: discovery and filters.
2. `app/sangha-list.tsx`: paginated devotee discovery.
3. `app/sangha-profile.tsx`: profile and connection lifecycle.
4. `app/sangha-hub.tsx`: group home, invitations, and notifications.
5. `app/sangha-hub-search.tsx`: search and recent searches.
6. `app/sangha-hub-list.tsx`: paginated group collections.
7. `app/group-details.tsx`: membership, feed, members, events, chat, and admin.

### Completed Release-Audit Fixes

- Incoming requests expose Accept and Decline and support `pending_sent` and
  `pending_received` states.
- Sangha Event creation sends `groupId` through the full Event-pillar payload
  and suppresses incompatible global draft autosave controls.
- Direct chat uses an inverted virtualized list with newest-first cursor
  pagination; older pages and newly sent messages merge in the correct order.
- Received chat messages can be reported by long press.
- Owned group posts can be edited; deletion requires confirmation.
- Feed, join requests, members, events, and chat use bounded load-more flows.
- Join, leave, message, invite, member-admin, post, and Event controls respect
  backend capability flags.
- Stable empty selector references avoid unnecessary rerenders.
- Misleading live-update copy, nested touch targets, and stock placeholder
  profile/banner media were removed.

## Verification And Release Checklist

### Automated Verification

- [x] `npx tsc --noEmit`
- [x] `npm run lint` with zero errors
- [x] `npx expo-doctor`: 18/18 checks passed
- [x] `npx expo config --type public`
- [x] `git diff --check`
- [x] Production `GET /api/health`: `200 OK`
- [x] Unauthenticated Sangha probes return `401 UNAUTHENTICATED`

Static verification does not prove authenticated behavior. Run the following
on the exact signed-in iOS release candidate with two normal devotees and one
group admin.

### Discovery And Profile

- [ ] Near You and Suggested For You load from production.
- [ ] Distance, tradition, and purpose filters change backend results.
- [ ] Near Me opt-in persists after closing and reopening the screen.
- [ ] Devotee pagination and profile navigation work.
- [ ] Send, accept, decline, cancel/disconnect, and block all update the UI.
- [ ] Public profiles expose only privacy-safe location information.

### Requests Center

- [ ] User A sends a connection request; it appears under User A's Sent tab.
- [ ] The same request appears under User B's Received tab without relying on notification history.
- [ ] Tapping the push or in-app notification opens and highlights the correct request.
- [ ] User B accepts; the request disappears and both profiles become connected.
- [ ] Repeat with decline; the request disappears and both profiles return to `none`.
- [ ] User A cancels a sent request; it disappears from both users after refresh.
- [ ] A group invitation opens under Group Invites and accepts/declines successfully.
- [ ] Pagination and pull-to-refresh do not duplicate request cards.

### Hub And Groups

- [ ] Purpose tiles, invitations, My Groups, and notification count load.
- [ ] Search, recent-search save/clear, filters, and pagination work.
- [ ] Invitation accept/decline updates without an app restart.
- [ ] Create one public and one private group.
- [ ] Edit a group and archive a disposable test group.
- [ ] Join public, request private, cancel/leave, and rejoin all work.

### Administration

- [ ] Admin can approve and decline pending join requests.
- [ ] Admin can invite a real devotee ID.
- [ ] Admin can promote, demote, and remove only permitted members.
- [ ] Normal members cannot see or invoke admin actions.

### Feed And Chat

- [ ] Create text and notice posts.
- [ ] Create a photo/Experience post from the group quick action.
- [ ] Edit an owned post.
- [ ] Like/unlike, comment, pin/unpin, and delete work.
- [ ] Pagination does not duplicate feed items or comments.
- [ ] Send direct messages in both directions and verify read state.
- [ ] Loading older messages preserves chronological order.
- [ ] Long-press another user's message and submit a report.

### Events And Notifications

- [ ] Create an Event from Sangha; Event detail and group projection both exist.
- [ ] RSVP and cancel RSVP from the group Events tab.
- [ ] Event pagination does not duplicate records.
- [ ] Mark one notification and all notifications read.
- [ ] Pagination and unread badges update immediately.

### Go/No-Go Rules

Release v1 only after every signed-in v1 check passes. Stop the release if:

- a mutation logs out the user or loses the access token;
- a normal member can invoke an admin action;
- a group Event is created without its `groupId` projection;
- chat pagination duplicates or loses messages;
- a crash, blank route, repeated request loop, or native-module error occurs.

Known non-blocking technical debt:

- Full live streaming is v2.
- Expo/Metro transitive advisories require a separately tested Expo SDK upgrade;
  do not run `npm audit fix --force` on the release branch.
- Non-Sangha lint warnings should be addressed separately from this release.

## Delivery Roadmap

### v1: Complete, Pending Device Sign-Off

- Discovery, profiles, privacy, and connections.
- Hub, groups, invitations, membership, and moderation.
- Unified feed, engagement, chat, Events bridge, and notifications.

### v2: Live Streaming

- Stream list, detail, schedule/create, start, join, heartbeat, and end.
- Provider host/viewer token lifecycle.
- Live chat, reactions, moderation, reporting, and recording playback.
- Background/foreground recovery and heartbeat cleanup.
- Load, memory, reconnect, abuse, and provider-failure testing.

## Backend And Frontend Coordination

For every new endpoint or contract change:

1. Backend updates the Postman collection and the matching contract section here.
2. Backend adds one success, validation, unauthenticated, and forbidden example.
3. Frontend updates service/types/action/reducer/saga/selector as required.
4. Frontend records the capability status in the shared matrix above.
5. QA adds or updates a device check and records the release result here.
6. Both sides verify pagination, idempotency, permissions, and error codes.

Use these status values consistently: `Proposed`, `Backend Ready`,
`Frontend Integrated`, `QA Passed`, `Released`, or `Deferred`.

## Confirmed Product Decisions

- Private groups support invitation and join-request approval flows.
- Invitation permission is determined by backend `canInvite`; frontend does not
  infer permission from a displayed role name.
- Direct messages are part of v1 and use Sangha conversation APIs.
- New group Events use Pillar 2 `POST /api/events` with `groupId`; the legacy
  Sangha group-event create endpoint remains only for compatibility.
- Public profile fields and precise-location visibility are decided by backend
  privacy policy and returned capability/privacy fields.

## Open Product Questions

- Should Near Me discovery require a fresh location check per session or reuse
  the most recent consented location with an expiry?
- What verification workflow and badge rules apply to official mandir and
  community groups?
- Which streaming provider, recording retention, and moderation SLA should be
  selected before v2 live streaming begins?
