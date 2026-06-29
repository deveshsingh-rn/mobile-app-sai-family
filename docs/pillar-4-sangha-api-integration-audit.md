# Pillar 4 Sangha API Integration Audit

Source collection: `postman-api-collection.json`

Sangha block starts at: `GET /api/sangha/home - Discovery Home`

## Summary

Sangha is partially integrated, not fully complete.

Integrated and visible today:

- Discovery home and devotee listing/profile.
- Devotee connect, disconnect, block.
- Sangha Hub home, group search/list, recent searches.
- User invitations list and accept/decline.
- Group detail, unified feed, membership capabilities, join requests count.
- Group members, posts, post comments, likes, pin/unpin, delete.
- Group events list, create, RSVP/cancel.
- Direct conversation start, message history, send message, mark read.
- Sangha notifications list and mark read.

Missing or partial:

- Update post.
- Report chat message.
- Live streaming create/detail/start/join/heartbeat/chat/reactions/recording/report/end.
- Connection accept/decline is serviced but not fully exposed in a clear UI surface.
- Event pillar `POST /api/events` accepts `groupId`, but the Event create form still needs final confirmation that it sends `groupId` from Sangha route params.

## Endpoint Coverage

| Endpoint | Frontend Status | Current UI |
| --- | --- | --- |
| `PATCH /api/users/me/sangha-discovery` | Integrated | Sangha discovery filters/toggle |
| `GET /api/sangha/home` | Integrated | `app/(tabs)/sangha.tsx` |
| `GET /api/sangha/devotees` | Integrated | `screens/sangha-list-screen.tsx` |
| `GET /api/sangha/devotees/:id` | Integrated | `screens/sangha-profile-screen.tsx` |
| `POST /api/sangha/devotees/:id/connect` | Integrated | Devotee profile |
| `POST /api/sangha/connections/:id/accept` | Service exists, UI partial/missing | Needs invitation/requests UI |
| `POST /api/sangha/connections/:id/decline` | Service exists, UI partial/missing | Needs invitation/requests UI |
| `DELETE /api/sangha/devotees/:id/connect` | Integrated | Devotee profile |
| `POST /api/sangha/devotees/:id/block` | Integrated | Devotee profile |
| `GET /api/sangha/groups/home` | Integrated | `screens/sangha-hub-screen.tsx` |
| `GET /api/sangha/groups/search` | Integrated | `screens/sangha-hub-search-screen.tsx` |
| `GET /api/sangha/groups` | Integrated | `screens/sangha-hub-list-screen.tsx` |
| `GET /api/users/me/sangha/recent-searches` | Integrated | Hub search |
| `POST /api/users/me/sangha/recent-searches` | Integrated | Hub search |
| `DELETE /api/users/me/sangha/recent-searches` | Integrated | Hub search |
| `GET /api/users/me/sangha/invitations` | Integrated | Hub/list screens |
| `POST /api/sangha/groups/:id/invitations` | Integrated | Group Members invite panel |
| `POST /api/users/me/sangha/invitations/:id/accept` | Integrated | Hub/list screens |
| `POST /api/users/me/sangha/invitations/:id/decline` | Integrated | Hub/list screens |
| `POST /api/sangha/groups` | Integrated | `screens/sangha-create-group-screen.tsx` |
| `GET /api/sangha/groups/:id` | Integrated | `screens/group-details-screen.tsx` |
| `GET /api/sangha/groups/:id/feed` | Integrated | Group detail Feed tab |
| `GET /api/sangha/groups/:id/membership` | Integrated | Group detail capabilities |
| `GET /api/sangha/groups/:id/join-requests` | Integrated | Group Feed member requests |
| `POST /api/events` with `groupId` | Partial | Event create route opens; confirm payload pass-through |
| `POST /api/sangha/conversations` | Integrated | `screens/sangha-chat-screen.tsx` |
| `GET /api/sangha/conversations/:id/messages` | Integrated | Chat screen |
| `POST /api/sangha/conversations/:id/messages` | Integrated | Chat screen |
| `PATCH /api/sangha/conversations/:id/read` | Integrated | Chat screen |
| `POST /api/sangha/messages/:id/report` | Missing | Needs message actions/report modal |
| `PATCH /api/sangha/groups/:id` | Integrated | `screens/sangha-create-group-screen.tsx` edit mode |
| `POST /api/sangha/groups/:id/join` | Integrated | Group detail join button |
| `DELETE /api/sangha/groups/:id/membership` | Integrated | Group detail leave button |
| `GET /api/sangha/groups/:id/members` | Integrated | Group detail Members tab |
| `PATCH /api/sangha/groups/:id/members/:memberId` | Integrated | Group Members admin role action |
| `DELETE /api/sangha/groups/:id/members/:memberId` | Integrated | Group Members admin remove action |
| `POST /api/sangha/groups/:id/join-requests/:requestId/approve` | Integrated | Group Feed member requests |
| `POST /api/sangha/groups/:id/join-requests/:requestId/decline` | Integrated | Group Feed member requests |
| `DELETE /api/sangha/groups/:id` | Integrated | Edit Sangha archive action |
| `GET /api/sangha/groups/:id/posts` | Integrated fallback | Group detail old posts fallback |
| `POST /api/sangha/groups/:id/posts` | Integrated | Group feed composer |
| `PATCH /api/sangha/groups/:id/posts/:postId` | Missing | Needs edit post action |
| `POST /api/sangha/groups/:id/posts/:postId/like` | Integrated | Group feed |
| `DELETE /api/sangha/groups/:id/posts/:postId/like` | Integrated | Group feed |
| `GET /api/sangha/groups/:id/posts/:postId/comments` | Integrated | Group feed comments |
| `POST /api/sangha/groups/:id/posts/:postId/comments` | Integrated | Group feed comments |
| `POST /api/sangha/groups/:id/posts/:postId/pin` | Integrated | Group feed admin action |
| `DELETE /api/sangha/groups/:id/posts/:postId/pin` | Integrated | Group feed admin action |
| `DELETE /api/sangha/groups/:id/posts/:postId` | Integrated | Group feed admin action |
| `GET /api/sangha/groups/:id/events` | Integrated | Group Events tab |
| `POST /api/sangha/groups/:id/events` | Integrated in Redux, UI now prefers Event pillar create | Legacy group event path |
| `POST /api/sangha/groups/:id/events/:eventId/rsvp` | Integrated | Group Events tab |
| `DELETE /api/sangha/groups/:id/events/:eventId/rsvp` | Integrated | Group Events tab |
| `GET /api/users/me/sangha/notifications` | Integrated | Sangha notification screen |
| `POST /api/users/me/sangha/notifications/read` | Integrated | Sangha notification screen |
| `POST /api/sangha/live-streams` | Missing | Needs live stream create/schedule UI |
| `GET /api/sangha/live-streams` | Service only, not Redux/UI | Needs live stream list UI |
| `GET /api/sangha/live-streams/:id` | Missing | Needs live detail UI |
| `POST /api/sangha/live-streams/:id/start` | Missing | Host control |
| `POST /api/sangha/live-streams/:id/join` | Missing | Viewer join flow |
| `POST /api/sangha/live-streams/:id/heartbeat` | Missing | Needs lifecycle cleanup |
| `GET /api/sangha/live-streams/:id/chat` | Missing | Live chat list |
| `POST /api/sangha/live-streams/:id/chat` | Missing | Live chat send |
| `POST /api/sangha/live-streams/:id/reactions` | Missing | Live reactions |
| `DELETE /api/sangha/live-streams/:id/chat/:messageId` | Missing | Moderator delete chat |
| `GET /api/sangha/live-streams/:id/recording` | Missing | Recording playback |
| `POST /api/sangha/live-streams/:id/report` | Missing | Report stream |
| `POST /api/sangha/live-streams/:id/end` | Missing | Host end stream |

## Recommended Implementation Order

### Phase A: Group Creation And Admin

- Create `screens/sangha-create-group-screen.tsx`. Done.
- Add route `app/sangha-create-group.tsx`. Done.
- Wire `POST /api/sangha/groups`. Done.
- Add "Create Group" CTA in Sangha Hub and/or Sangha tab.
- Wire `PATCH /api/sangha/groups/:id`. Done.
- Wire `DELETE /api/sangha/groups/:id`. Done.

### Phase B: Group Moderation

- Add join request review section/screen. Done.
- Wire approve/decline join request. Done.
- Wire invite user. Done.
- Wire update member role. Done.
- Wire remove member. Done.

### Phase C: Feed Completion

- Wire update post.
- Wire report message.
- Add pagination/load-more for unified group feed and chat messages.

### Phase D: Live Streaming

- Create live stream list/detail screens.
- Wire schedule, detail, start, join, heartbeat, chat, reactions, recording, report, and end.
- Add heartbeat cleanup on screen blur/unmount to avoid memory/network leaks.
