# Pillar 4 Sangha Production Readiness

Audit date: 2026-08-31

Target release: 2026-09-01

## Release Scope

Pillar 4 v1 includes devotee discovery, privacy settings, profiles, connection lifecycle, groups, invitations, group administration, unified feed, direct chat, group events, RSVP, and Sangha notifications.

Live streaming is explicitly deferred to v2. It is not exposed through a Sangha v1 button or route, so users cannot enter a partial streaming flow.

## Automated Verification

- [x] `npx tsc --noEmit`
- [x] `npm run lint` with zero errors; 27 pre-existing non-Sangha warnings remain.
- [x] `npx expo-doctor`: 18/18 checks passed.
- [x] `npx expo config --type public`: production owner, project ID, bundle IDs, plugins, and HTTPS API URL resolve correctly.
- [x] `git diff --check`
- [x] Production `GET /api/health`: `200 OK`.
- [x] Unauthenticated Sangha discovery and group-list probes return the expected `401 UNAUTHENTICATED` contract.

## Defects Fixed During Release Audit

- Incoming connection requests now expose Accept and Decline and call the existing Redux Saga/API flow.
- Connection statuses support `pending_sent` and `pending_received`; incoming requests are no longer presented as a new Connect action.
- Group Event creation now sends `groupId` through the full Event-pillar `POST /api/events` payload.
- Sangha-launched Event creation suppresses incompatible global draft autosave controls.
- Direct chat now uses a virtualized inverted list and the backend's newest-first cursor contract.
- Older chat pages merge after newer messages; newly sent messages appear at the correct end.
- Chat messages can be reported by long press using `spam`, `abuse`, or `privacy` reasons.
- Group post edit is connected to `PATCH /api/sangha/groups/:id/posts/:postId`.
- Group post deletion now requires confirmation.
- Feed, join requests, members, events, and chat have bounded load-more pagination.
- Join/leave and member actions now respect backend membership and capability flags.
- Empty Redux selectors use a stable array reference to avoid avoidable rerenders.
- Nested Hub search/filter touch targets were separated.
- Hardcoded stock mutual-connection faces and create-group banner data were removed.
- Installed required `expo-asset`, aligned Expo SDK 54 patch versions, and registered the config plugin.
- Updated Axios to the patched 1.x release.

## Signed-In Device Smoke Test

Run this on the production development build with two normal users and one group admin. Do not publish until every v1 item passes.

### Discovery And Profile

- [ ] Sangha tab loads Near You and Suggested For You from production.
- [ ] Distance, tradition, and purpose filters change results.
- [ ] Near Me opt-in persists after leaving and reopening the screen.
- [ ] Devotee list paginates and opens the selected profile.
- [ ] User A sends a connection request to User B.
- [ ] User B sees Request received and can accept it.
- [ ] Repeat with decline, disconnect/cancel, and block.
- [ ] Profile exposes only privacy-safe location data.

### Hub And Groups

- [ ] Hub loads purpose tiles, invitations, My Groups, and notification count.
- [ ] Search, recent search save, recent search clear, filters, and list pagination work.
- [ ] Invitation accept and decline update the UI without reopening the app.
- [ ] Create a public group and a private group.
- [ ] Edit group details, then archive a disposable test group.
- [ ] Join a public group, request a private group, cancel/leave, and rejoin.

### Group Administration

- [ ] Admin sees pending join requests and can approve and decline them.
- [ ] Admin invites a real devotee ID.
- [ ] Admin promotes/demotes only members whose capability allows it.
- [ ] Admin removes a disposable member after confirmation.
- [ ] Normal members do not see unauthorized admin controls.

### Feed And Chat

- [ ] Create text and notice posts.
- [ ] Create a photo/Experience post from the group quick action and confirm it returns to the correct group feed.
- [ ] Edit an owned group post.
- [ ] Like/unlike, comment, pin/unpin, and delete with confirmation.
- [ ] Load more feed items and comments; no duplicates appear.
- [ ] Open direct chat, send messages in both directions, and verify read state.
- [ ] Load older messages and confirm chronological order remains correct.
- [ ] Long-press another user's message and submit a report.

### Group Events And Notifications

- [ ] Create an Event from a Sangha group and confirm the Event detail and group projection both exist.
- [ ] RSVP and cancel RSVP from the group Events tab.
- [ ] Load more group events.
- [ ] Open a notification, mark one read, then mark all read.
- [ ] Notification pagination and unread badge update correctly.

## Release Decision

Current code status: ready for signed-in device smoke testing, not yet approved for production submission.

Go when all v1 device checks above pass on the exact iOS production candidate build.

No-go conditions:

- Any mutation logs out the user or loses the access token.
- A normal member sees or can invoke admin actions.
- A group Event is created without its `groupId` projection.
- Chat ordering duplicates or loses messages after pagination.
- Any unhandled crash, blank route, repeated request loop, or native module error occurs.

## Known Deferred Work

- Full live-stream create/start/join/heartbeat/chat/reaction/moderation/recording/report/end lifecycle is v2.
- The dependency audit still reports Expo/Metro transitive advisories whose automated fix requires a breaking Expo SDK 57 upgrade. Do not run `npm audit fix --force` on this release branch. Plan and test the SDK upgrade separately.
- Repository lint has 27 non-blocking unused-code warnings outside Sangha, primarily Ask Sai and Profile.
