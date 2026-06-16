# Event Pillar Phase 0 Contract Audit

Purpose: verify the backend contract before replacing hardcoded Event UI data with Redux/Saga API data.

Related plan: `docs/event-pillar-api-integration-implementation.md`
Postman source: `postman-api-collection.json`

## Phase 0 Status

Status: Complete

| Item | Status | Finding |
| --- | --- | --- |
| Confirm backend base URL | Done | `app.json` has `expo.extra.apiBaseUrl = http://192.168.1.11:4000`. `EXPO_PUBLIC_API_BASE_URL` can override it at runtime. |
| Confirm auth header | Done | `services/api.ts` reads `sai-family.devotee-account` from SecureStore and injects `x-user-id` using `account.id || account.authorId`. |
| Test every Events API | Done | `event-api-real-record.md` records 40 smoke-tested APIs: 2 health APIs, 31 Events/Pillar 2 APIs, 4 user calendar/event APIs, and 3 supporting API groups. |
| Record actual response shapes | Done | Real wrappers and sample payloads are recorded in `event-api-real-record.md`. |
| Compare responses with frontend types | Done | `store/events/types.ts` supports the first core slice only; richer home, bookmark, attendee, analytics, review, photo, draft, place, preference, and community calendar types are still needed. |
| Decide create/update payload mode | Done | Frontend Phase 1 will use the two-step flow: upload media with `POST /api/media/upload`, then create/update events as JSON with `bannerUrl`. Multipart create/update remains backend-supported for future one-request upload. |

## How To Start

1. Confirm backend is reachable:

```sh
curl http://192.168.1.11:4000/health
curl http://192.168.1.11:4000/health/db
```

2. Create or confirm a devotee account and note the returned `account.id`.

3. Use that account id as `authorId` / `x-user-id` for protected Events APIs.

4. Create one event and store its `event.id`.

5. Run the Events APIs group-by-group below.

6. Paste the real response shape summary into this file.

## Environment Findings

### Real API Record

Smoke-test source: `event-api-real-record.md`

- Test date: 2026-06-12
- Tested base URL: `http://localhost:4000`
- Test author ID: `cmq9awrmi000e9m0yrtugdg9u`
- Test author name: `Ananya Sharma`
- Total covered APIs: 40

Breakdown:

- 2 health APIs
- 31 Events / Pillar 2 APIs
- 4 user calendar / user event APIs
- 3 supporting API groups: media upload, places search, title suggestions, community calendars

### Base URL

Current app configuration:

```json
{
  "expo": {
    "extra": {
      "apiBaseUrl": "http://192.168.1.11:4000"
    }
  }
}
```

Runtime priority from `services/api.ts`:

1. `EXPO_PUBLIC_API_BASE_URL`
2. `Constants.expoConfig.extra.apiBaseUrl`
3. Platform fallback:
   - Android emulator: `http://10.0.2.2:4000`
   - iOS simulator: `http://localhost:4000`
   - Default: `http://localhost:4000`

### Auth Header

Current request interceptor:

```ts
const accountData = await SecureStore.getItemAsync("sai-family.devotee-account");
const account = JSON.parse(accountData);
const userId = account?.id || account?.authorId;
config.headers["x-user-id"] = userId;
```

Implication:

- Protected Events APIs should work after devotee account creation/hydration.
- Contract audit should include one protected request with a real `x-user-id`.
- Also test one missing-auth request to confirm backend returns `401 UNAUTHENTICATED`.

## Create/Update Payload Decision

Backend supports:

1. JSON metadata create/update.
2. Multipart create/update when uploading `bannerImage`, `banner`, or `file`.
3. Separate `POST /api/media/upload`, returning URL(s).

Postman collection update:

- `POST /api/events` explicitly documents the Phase 1 frontend flow: upload banner first with `POST /api/media/upload`, then send JSON event payload with `bannerUrl`.
- `PATCH /api/events/:id` follows the same rule when the banner changes.
- `POST /api/events/drafts` and `PATCH /api/events/drafts/:id` also use JSON metadata with `bannerUrl` after media upload.

Current frontend flow:

1. `POST /api/media/upload`
2. Store returned `url` as `bannerUrl`
3. `POST /api/events` with JSON metadata

Decision for Phase 1:

- Keep current frontend flow: media upload first, JSON create/update second.
- Add multipart create/update support later only if we want to reduce two requests into one.
- Reason: current UI and saga are already built around `bannerUrl`, so this is lower-risk.

Decision date:

- 2026-06-12

Decision:

- [x] Keep JSON + `bannerUrl`
- [ ] Move to multipart create/update
- [ ] Support both in frontend service

## Endpoint Test Groups

### Group A: Health And Setup

| Endpoint | Expected | Actual status | Notes |
| --- | --- | --- | --- |
| `GET /health` | `200` | Done | `{ status, service, timestamp }` |
| `GET /health/db` | `200` | Done | `{ status, database, timestamp }` |
| `POST /accounts` | `201`, returns `account.id` | Done | Existing test author used: `cmq9awrmi000e9m0yrtugdg9u`. |

### Group B: Core Discovery And CRUD

| Endpoint | Frontend currently wired? | Actual status | Response shape notes |
| --- | --- | --- | --- |
| `GET /api/events` | Yes | Done | `{ events, pagination }`; list items include `_count`, `rsvpedByMe`, `bookmarkedByMe`, `isOwner`, `distanceKm`. |
| `POST /api/events` | Yes | Done | `{ event }`; JSON payload with `bannerUrl`. |
| `GET /api/events/:id` | Yes | Done | `{ event }`; detail adds `media`, `permissions`, `organizer`, `attendeesPreview`, `guidelines`, `faq`, `tags`, `similarEvents`. |
| `PATCH /api/events/:id` | Yes | Done | `{ event }`; JSON partial payload. |
| `DELETE /api/events/:id` | Yes | Done | `{ success, id, status }`; status observed as `cancelled`. |

### Group C: RSVP And Comments

| Endpoint | Frontend currently wired? | Actual status | Response shape notes |
| --- | --- | --- | --- |
| `POST /api/events/:id/rsvp` | Yes | Done | `{ event, rsvp }`; normal attendance uses `status: "going"`, optional `guestCount`, `reminderMinutesBefore`. |
| `DELETE /api/events/:id/rsvp` | Yes | Done | `{ event, eventId, rsvped, _count }`. |
| `GET /api/users/me/rsvps` | Yes | Done | `{ events, pagination }`. |
| `GET /api/events/:id/comments` | Yes | Done | `{ comments, pagination }`. |
| `POST /api/events/:id/comments` | Yes | Done | `{ eventId, comment, _count }`; comment author is under `user`. |

### Group D: Events Hub APIs

| Endpoint | Frontend currently wired? | Actual status | Response shape notes |
| --- | --- | --- | --- |
| `GET /api/events/home` | No | Done | `{ sections, trendingSections, eventTypeGuide, trendingThisWeek, topOrganisers, weeklySchedule, stats }`. |
| `GET /api/events/nearby` | No | Done | `{ events, center, radiusKm }`. |
| `GET /api/events/recommendations` | No | Done | `{ events, basis }`. |

### Group E: Bookmarks

| Endpoint | Frontend currently wired? | Actual status | Response shape notes |
| --- | --- | --- | --- |
| `POST /api/events/:id/bookmark` | No | Done | `{ event, eventId, bookmarked, _count }`. |
| `DELETE /api/events/:id/bookmark` | No | Done | `{ event, eventId, bookmarked, _count }`. |
| `GET /api/users/me/event-bookmarks` | No | Done | `{ bookmarks, events, pagination }`. |

### Group F: Detail Richness

| Endpoint | Frontend currently wired? | Actual status | Response shape notes |
| --- | --- | --- | --- |
| `GET /api/events/:id/reviews` | No | Done | `{ reviews, summary, pagination }`. |
| `POST /api/events/:id/reviews` | No | Guarded | `{ review, summary }` or `{ error }`; observed `EVENT_REVIEW_NOT_ALLOWED` until RSVP condition is satisfied. |
| `GET /api/events/:id/photos` | No | Done | `{ photos, pagination }`. |
| `POST /api/events/:id/photos` | No | Guarded | Multipart; file keys: `photo`, `photos`, `file`, `files`; response `{ photos, _count }` or `{ error }`. |
| `POST /api/events/:id/share` | No | Done | `{ eventId, shares, shared }`. |
| `POST /api/events/:id/report` | No | Guarded | `{ report }` or `{ error }`; observed `EVENT_NOT_COMPLETED` for future event. |

### Group G: Organizer Tools

| Endpoint | Frontend currently wired? | Actual status | Response shape notes |
| --- | --- | --- | --- |
| `GET /api/events/:id/attendees` | No | Done | `{ attendees, pagination }`. |
| `POST /api/events/:id/check-in` | No | Done | `{ rsvp, _count }`. |
| `GET /api/events/:id/analytics` | No | Done | `{ event, analytics }`. |

### Group H: Calendar Product

| Endpoint | Frontend currently wired? | Actual status | Response shape notes |
| --- | --- | --- | --- |
| `GET /api/events/calendar` | Yes | Done | `{ days, summary }`; existing frontend flattens `days[].events`, but calendar UI can use `days` and `dots` directly. |
| `GET /api/users/me/calendar/preferences` | No | Done | `{ preference }`. |
| `PATCH /api/users/me/calendar/preferences` | No | Done | `{ preference }`; backend uses `showRsvpedEvents`, `showCreatedEvents`, `showBookmarkedEvents`. |
| `GET /api/users/me/calendar.ics` | No | Done | `text/calendar`. |
| `GET /api/community-calendars` | No | Done | `{ calendars }`. |
| `POST /api/community-calendars/:id/subscribe` | No | Done | `{ calendar, subscription }`. |
| `DELETE /api/community-calendars/:id/subscribe` | No | Done | `{ calendar }`. |

### Group I: Create/Edit Enhancements

| Endpoint | Frontend currently wired? | Actual status | Response shape notes |
| --- | --- | --- | --- |
| `POST /api/events/suggestions/title` | No | Done | `{ suggestions }`. |
| `GET /api/places/search` | No | Done | `{ places }`. |
| `POST /api/events/drafts` | No | Done | JSON with `bannerUrl`; response `{ draft }`. |
| `PATCH /api/events/drafts/:id` | No | Done | JSON partial; response `{ draft }`. |
| `POST /api/events/drafts/:id/publish` | No | Done | `{ draft, event, events, series }`; recurring publish may create a series. |

### Group J: Media And Admin

| Endpoint | Frontend currently wired? | Actual status | Response shape notes |
| --- | --- | --- | --- |
| `POST /api/media/upload` | Yes | Done | `{ media, url }`; use top-level `url` as `bannerUrl`. |
| `POST /api/notifications/event-reminder` | No | Not part of devotee UI | Admin-only endpoint; keep out of current mobile flow. |

## Frontend Type Gap Summary

Current `store/events/types.ts` supports the first core slice:

- Basic `SaiEvent`
- `EventComment`
- Create/update payloads
- Media upload result
- Feed/detail/calendar/my-events/my-RSVPs/comments state

Required additions before full API integration:

- Pagination metadata shared by list endpoints.
- Rich event counts: `_count.rsvps`, `_count.comments`, `_count.bookmarks`, `_count.views`, `_count.shares`, `_count.reviews`, `_count.photos`, `_count.reports`.
- Event ownership and interaction flags: `bookmarkedByMe`, `isOwner`, `distanceKm`, `permissions`.
- Rich detail fields: `media`, `organizer`, `attendeesPreview`, `guidelines`, `faq`, `tags`, `similarEvents`.
- Event home response: `sections`, `trendingSections`, `eventTypeGuide`, `trendingThisWeek`, `topOrganisers`, `weeklySchedule`, `stats`.
- Nearby and recommendation responses.
- Bookmark state and pending IDs.
- RSVP payload/result with `status`, `guestCount`, `reminderMinutesBefore`, `checkedInAt`.
- Attendees and check-in responses.
- Analytics response.
- Reviews, review summary, photos, share, and report responses.
- Drafts and recurring event series response.
- Calendar month response using `{ days, summary }`, not only flattened events.
- Calendar preference response using backend names: `showRsvpedEvents`, `showCreatedEvents`, `showBookmarkedEvents`.
- Community calendar subscribe/unsubscribe responses.
- Place search and title suggestion responses.

Implementation implication:

- Phase 1 should first add typed response mappers in `services/events.ts` / `store/events/saga.ts`.
- Existing UI should keep selector-level fallback data until each backend-backed slice is verified on device.
- Avoid adding API calls directly inside screens.

## Response Capture Template

Use this format after testing each endpoint group:

```md
### Endpoint

`GET /api/events/home`

Status:
- Success: `200`
- Error tested: missing auth / invalid payload / not found

Response wrapper:
- `events[]`
- `pagination`
- `sections`

Frontend type impact:
- Add `EventHomeResponse`
- Add selector `selectEventHome`

Notes:
- Any field mismatch or nullable field observed.
```

## Phase 0 Exit Criteria

Phase 0 is complete when:

- [x] Backend health endpoint works in the tested local Docker environment.
- [x] A real `authorId` is available: `cmq9awrmi000e9m0yrtugdg9u`.
- [x] One event can be created and read back.
- [x] One success response is recorded for each endpoint group.
- [x] Expected guarded/error responses are recorded for reviews and reports.
- [x] We have confirmed frontend will use media upload first, then JSON create/update with `bannerUrl`.
- [x] `store/events/types.ts` gaps are listed before Phase 1 code starts.

## Recommended Phase 0 Order

1. Health checks.
2. Account/auth check.
3. Create event.
4. Core CRUD.
5. RSVP/comments.
6. Events hub APIs.
7. Calendar APIs.
8. Detail richness APIs.
9. Organizer APIs.
10. Create/edit enhancement APIs.
11. Update frontend type gap list.
