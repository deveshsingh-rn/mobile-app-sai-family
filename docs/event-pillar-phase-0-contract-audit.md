# Event Pillar Phase 0 Contract Audit

Purpose: verify the backend contract before replacing hardcoded Event UI data with Redux/Saga API data.

Related plan: `docs/event-pillar-api-integration-implementation.md`
Postman source: `postman-api-collection.json`

## Phase 0 Status

Status: Started

| Item | Status | Finding |
| --- | --- | --- |
| Confirm backend base URL | Done | `app.json` has `expo.extra.apiBaseUrl = http://192.168.1.11:4000`. `EXPO_PUBLIC_API_BASE_URL` can override it at runtime. |
| Confirm auth header | Done | `services/api.ts` reads `sai-family.devotee-account` from SecureStore and injects `x-user-id` using `account.id || account.authorId`. |
| Test every Events API | Pending | Needs backend running and a valid created account/event. |
| Record actual response shapes | Pending | Use the tables below. |
| Compare responses with frontend types | Pending | Main type file is `store/events/types.ts`. |
| Decide create/update payload mode | Pending | Backend supports JSON metadata and multipart with `bannerImage`; frontend currently uses media upload then JSON `bannerUrl`. |

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

Current frontend flow:

1. `POST /api/media/upload`
2. Store returned `url` as `bannerUrl`
3. `POST /api/events` with JSON metadata

Recommended decision for Phase 1:

- Keep current frontend flow: media upload first, JSON create/update second.
- Add multipart create/update support later only if we want to reduce two requests into one.
- Reason: current UI and saga are already built around `bannerUrl`, so this is lower-risk.

Decision owner:

- Frontend + backend together.

Decision:

- [ ] Keep JSON + `bannerUrl`
- [ ] Move to multipart create/update
- [ ] Support both in frontend service

## Endpoint Test Groups

### Group A: Health And Setup

| Endpoint | Expected | Actual status | Notes |
| --- | --- | --- | --- |
| `GET /health` | `200` | Pending |  |
| `GET /health/db` | `200` | Pending |  |
| `POST /accounts` | `201`, returns `account.id` | Pending | Required before protected API tests. |

### Group B: Core Discovery And CRUD

| Endpoint | Frontend currently wired? | Actual status | Response shape notes |
| --- | --- | --- | --- |
| `GET /api/events` | Yes | Pending | Should return `events[]` and pagination. |
| `POST /api/events` | Yes | Pending | Should return `{ event }`. |
| `GET /api/events/:id` | Yes | Pending | Should return rich detail fields if available. |
| `PATCH /api/events/:id` | Yes | Pending | Should return `{ event }`. |
| `DELETE /api/events/:id` | Yes | Pending | Should return `{ success, id, status }`. |

### Group C: RSVP And Comments

| Endpoint | Frontend currently wired? | Actual status | Response shape notes |
| --- | --- | --- | --- |
| `POST /api/events/:id/rsvp` | Yes | Pending | Should return `{ event, rsvp }`. |
| `DELETE /api/events/:id/rsvp` | Yes | Pending | Should return event RSVP count and `rsvpedByMe=false`. |
| `GET /api/users/me/rsvps` | Yes | Pending | May return `rsvps[]` with `event`, or `events[]`. |
| `GET /api/events/:id/comments` | Yes | Pending | Should return `comments[]`. |
| `POST /api/events/:id/comments` | Yes | Pending | Should return `{ comment }`. |

### Group D: Events Hub APIs

| Endpoint | Frontend currently wired? | Actual status | Response shape notes |
| --- | --- | --- | --- |
| `GET /api/events/home` | No | Pending | Needed for static hub sections. |
| `GET /api/events/nearby` | No | Pending | Needed for map/list nearby UI. |
| `GET /api/events/recommendations` | No | Pending | Needed for calendar recommendations. |

### Group E: Bookmarks

| Endpoint | Frontend currently wired? | Actual status | Response shape notes |
| --- | --- | --- | --- |
| `POST /api/events/:id/bookmark` | No | Pending | Should return `bookmarkedByMe=true`. |
| `DELETE /api/events/:id/bookmark` | No | Pending | Should return `bookmarkedByMe=false`. |
| `GET /api/users/me/event-bookmarks` | No | Pending | Should return bookmarked events. |

### Group F: Detail Richness

| Endpoint | Frontend currently wired? | Actual status | Response shape notes |
| --- | --- | --- | --- |
| `GET /api/events/:id/reviews` | No | Pending | Needed for detail reviews. |
| `POST /api/events/:id/reviews` | No | Pending | Requires RSVP/attendance. |
| `GET /api/events/:id/photos` | No | Pending | Needed for gallery/photos. |
| `POST /api/events/:id/photos` | No | Pending | Multipart. |
| `POST /api/events/:id/share` | No | Pending | Share tracking. |
| `POST /api/events/:id/report` | No | Pending | Organizer report. |

### Group G: Organizer Tools

| Endpoint | Frontend currently wired? | Actual status | Response shape notes |
| --- | --- | --- | --- |
| `GET /api/events/:id/attendees` | No | Pending | Needed for manage attendees. |
| `POST /api/events/:id/check-in` | No | Pending | Owner/admin only. |
| `GET /api/events/:id/analytics` | No | Pending | Needed for My Events stats. |

### Group H: Calendar Product

| Endpoint | Frontend currently wired? | Actual status | Response shape notes |
| --- | --- | --- | --- |
| `GET /api/events/calendar` | Yes | Pending | Currently consumed as flat events. Audit summary too. |
| `GET /api/users/me/calendar/preferences` | No | Pending | Needed for calendar settings. |
| `PATCH /api/users/me/calendar/preferences` | No | Pending | Needed for toggles. |
| `GET /api/users/me/calendar.ics` | No | Pending | Export flow. |
| `GET /api/community-calendars` | No | Pending | Needed for community calendars. |
| `POST /api/community-calendars/:id/subscribe` | No | Pending |  |
| `DELETE /api/community-calendars/:id/subscribe` | No | Pending |  |

### Group I: Create/Edit Enhancements

| Endpoint | Frontend currently wired? | Actual status | Response shape notes |
| --- | --- | --- | --- |
| `POST /api/events/suggestions/title` | No | Pending | Needed for suggestion chips. |
| `GET /api/places/search` | No | Pending | Needed for venue search. |
| `POST /api/events/drafts` | No | Pending | Multipart. |
| `PATCH /api/events/drafts/:id` | No | Pending | Multipart. |
| `POST /api/events/drafts/:id/publish` | No | Pending |  |

### Group J: Media And Admin

| Endpoint | Frontend currently wired? | Actual status | Response shape notes |
| --- | --- | --- | --- |
| `POST /api/media/upload` | Yes | Pending | Should return top-level `url`. |
| `POST /api/notifications/event-reminder` | No | Pending | Admin only; not needed for devotee UI now. |

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

- [ ] Backend health endpoint works from the same network as the app.
- [ ] A real `authorId` is available.
- [ ] One event can be created and read back.
- [ ] One success response is recorded for each endpoint group.
- [ ] One expected error response is recorded for protected/validation groups.
- [ ] We have confirmed whether frontend will use JSON + `bannerUrl`, multipart create/update, or both.
- [ ] `store/events/types.ts` gaps are listed before Phase 1 code starts.

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
