# Pillar 4 Sangha Frontend API Todo

## Goal

Replace hardcoded Sangha people, groups, invitations, posts, events, notifications, and live stream data with the Sangha API from `postman-api-collection.json`, while keeping the polished UI already built in the app.

## Phase 0: Contract Review

Status: Completed

- [x] Review `Sangha API` collection block.
- [x] Identify protected endpoints that require `x-user-id`.
- [x] Include live streaming endpoints in the pillar scope.
- [x] Keep admin moderation needs documented in `docs/pillar-4-sangha-api-requirements.md`.

## Phase 1: Redux And Service Foundation

Status: Completed

- [x] Create `services/sangha.ts`.
- [x] Create `store/sangha/types.ts`.
- [x] Create `store/sangha/actions.ts`.
- [x] Create `store/sangha/reducer.ts`.
- [x] Create `store/sangha/saga.ts`.
- [x] Create `store/sangha/selectors.ts`.
- [x] Create `store/sangha/validation.ts`.
- [x] Attach Sangha reducer and saga to the global store.

## Phase 2: Discovery Home

Status: Started

- [x] Wire `app/(tabs)/sangha.tsx` to `GET /api/sangha/home`.
- [x] Wire Near Me toggle to `PATCH /api/users/me/sangha-discovery`.
- [x] Send filter params for distance, tradition, and purpose.
- [x] Replace hardcoded `Near You` and `Suggested For You` data.
- [x] Add loading, error, and empty states.

## Phase 3: Devotee Discovery And Profile

Status: Started

- [x] Wire `screens/sangha-list-screen.tsx` to `GET /api/sangha/devotees`.
- [x] Wire `screens/sangha-profile-screen.tsx` to `GET /api/sangha/devotees/:id`.
- [x] Wire connect, disconnect, and block actions.
- [ ] Wire accept and decline actions from connection invitation surfaces.
- [ ] Preserve privacy-safe location display.

## Phase 4: Sangha Hub And Groups

Status: Started

- [x] Wire `screens/sangha-hub-screen.tsx` to `GET /api/sangha/groups/home`.
- [x] Wire hub search to `GET /api/sangha/groups/search`.
- [x] Wire group lists to `GET /api/sangha/groups`.
- [x] Wire recent searches and clear recent searches.
- [x] Wire invitations list and accept/decline flow.

## Phase 5: Group Details

Status: Started

- [x] Wire `screens/group-details-screen.tsx` to `GET /api/sangha/groups/:id`.
- [x] Wire members to `GET /api/sangha/groups/:id/members`.
- [x] Wire posts to `GET /api/sangha/groups/:id/posts`.
- [x] Wire group events to `GET /api/sangha/groups/:id/events`.
- [x] Wire join, leave, post create, like, comment, pin, and delete actions.
- [x] Make member search functional.
- [x] Launch chat from member cards.
- [x] Launch Event pillar create screen from group events and feed quick action.
- [x] Replace group feed list with unified `GET /api/sangha/groups/:id/feed` with old posts fallback.
- [x] Replace local chat shell with conversation/message APIs.
- [x] Replace static member request count with `GET /api/sangha/groups/:id/join-requests`.
- [x] Gate post/comment/event controls from backend capability flags.
- [ ] Wire join request approve/decline buttons.
- [ ] Add infinite scroll for unified group feed, join requests, and chat messages.

## Phase 6: Group Events

Status: Completed

- [x] Wire create group event.
- [x] Wire group event RSVP and cancel RSVP.
- [x] Reuse event card UI patterns where possible.

## Phase 7: Notifications

Status: Completed

- [x] Wire `GET /api/users/me/sangha/notifications`.
- [x] Wire mark-read action.
- [x] Add unread indicators in hub/header where UI requires.

## Phase 8: Live Streaming

Status: Not started

- [ ] Wire live stream list and detail.
- [ ] Wire create, start, join, heartbeat, end, report, and recording.
- [ ] Wire live chat list, send message, delete moderation, and reactions.
- [ ] Add memory/performance safeguards for chat pagination and heartbeat cleanup.

## Phase 10: Full Sangha API Closure

Status: Not started

Audit file: `docs/pillar-4-sangha-api-integration-audit.md`

- [x] Create group screen and wire `POST /api/sangha/groups`.
- [x] Edit/archive group and wire `PATCH /api/sangha/groups/:id` plus `DELETE /api/sangha/groups/:id`.
- [x] Invite member and wire `POST /api/sangha/groups/:id/invitations`.
- [x] Join request review UI and wire approve/decline.
- [x] Admin member role/remove actions.
- [ ] Edit group post.
- [ ] Report direct chat message.
- [ ] Confirm Event create form sends `groupId` from Sangha route params.
- [ ] Complete live stream screens and APIs.

## Phase 9: Manual Smoke Test

Status: Not started

- [ ] Discovery home loads live devotees.
- [ ] Near Me setting persists.
- [ ] Filters return backend-filtered data.
- [ ] Devotee profile and connect lifecycle works.
- [ ] Groups, invitations, posts, members, and events work.
- [ ] Live stream heartbeat stops on screen exit.
