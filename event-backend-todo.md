# Pillar 2 Events Backend Review + Implementation TODO

Source of truth reviewed:
- `pillar-2-events-api-requirements.md`
- current Express routes/controllers
- current Prisma schema and Postman collection

Status legend: `[x]` done, `[-]` next/in progress, `[ ]` pending

## Senior Backend Review

The current backend has a solid first vertical slice: event CRUD, RSVP, comments, calendar, media upload, push notification hooks, reminder jobs, and Postman coverage. That is enough for early frontend integration.

The frontend requirements document, however, describes a richer product than CRUD. The mobile UI expects discovery/search, aggregate dashboard sections, organizer tools, attendee management, bookmarks, analytics, reviews, FAQ/guidelines, recommendations, drafts, recurring events, and calendar preferences. We should now stabilize the existing contract first, then add these surfaces in product-value order.

## API Payload Rule

- Any API that accepts files/media must use `multipart/form-data`.
- JSON is only for pure metadata/text requests with no file upload.
- If a create/update flow can include a media file later, design it to support `multipart/form-data` from the start or keep media upload as a separate `multipart/form-data` endpoint that returns URLs.
- Current pattern:
  - `POST /api/media/upload` uses `multipart/form-data`.
  - `POST /api/events` and `PATCH /api/events/:id` support JSON for metadata-only requests and `multipart/form-data` when a banner image is included.
  - Event banner file keys accepted: `bannerImage`, `banner`, or `file`.

## Current API Coverage

### Already Built
- [x] `GET /api/events`
- [x] `GET /api/events/:id`
- [x] `POST /api/events`
- [x] `PATCH /api/events/:id`
- [x] `DELETE /api/events/:id` (soft cancel)
- [x] `POST /api/events/:id/rsvp`
- [x] `DELETE /api/events/:id/rsvp`
- [x] `GET /api/users/me/rsvps`
- [x] `GET /api/users/me/events`
- [x] `GET /api/events/calendar?month=YYYY-MM`
- [x] `GET /api/events/:id/comments`
- [x] `POST /api/events/:id/comments`
- [x] `POST /api/media/upload`
- [x] `POST /api/notifications/event-reminder`

### Built But Needs Contract Polish
- [ ] `GET /api/events`: add `offset`, `q`, `dateFrom`, `dateTo`, `sort`, `status`, `hasMore`, and distance when `lat/lng` are supplied.
- [ ] `GET /api/events/:id`: add `permissions`, `organizer`, `attendeesPreview`, `media`, `guidelines`, `faq`, `tags`, `similarEvents`.
- [x] `DELETE /api/events/:id`: change response from `204` to `{ success, id, status }` as frontend-friendly response.
- [x] `POST /api/events/:id/rsvp`: return `{ event, rsvp }` wrapper and support optional `status`, `guests`, `reminderMinutesBefore`.
- [ ] `GET /api/users/me/rsvps`: return `rsvps[]` with `event`, while keeping `events[]` compatibility if useful.
- [x] `GET /api/events/calendar`: add `summary.byType` and `summary.attending`.
- [x] `POST /api/media/upload`: include top-level `url` for single-file convenience and `mimeType` alias.

## Phase 1: Stabilize Core Contract

Goal: make existing APIs match frontend expectations without large schema expansion.

- [x] Improve `GET /api/events` filters:
  - [x] `offset`
  - [x] `q`
  - [x] `dateFrom/dateTo`
  - [x] `sort=soonest|nearest|popular|newest`
  - [x] `status` (public default `published`)
  - [x] `distanceKm` when `lat/lng` provided
  - [x] pagination `{ limit, offset, hasMore, total }`
- [x] Add event response normalizer:
  - [x] `owner` alias from `author`
  - [x] `ownerId`, `ownerName`, `ownerProfileImageUrl`
  - [x] `_count.rsvps/comments`
  - [x] `rsvpedByMe`
  - [x] `isOwner`
- [x] Polish `GET /api/events/:id`:
  - [x] `permissions.canEdit/canDelete/canManageAttendees`
  - [x] `organizer.eventsOrganized`
  - [x] `attendeesPreview`
  - [x] placeholder-safe `guidelines`, `faq`, `tags`, `similarEvents`
- [x] Align RSVP response shape with frontend doc.
- [x] Align delete/cancel response shape.
- [x] Update Postman examples after changes.
- [x] Run Docker smoke tests for all core endpoints.

## Phase 2: Replace Static UI Sections

Goal: make the Events hub real instead of local/static.

- [x] `GET /api/events/home`
  - [x] `sections.happeningToday`
  - [x] `sections.thisWeek`
  - [x] `sections.thisMonth`
  - [x] `sections.comingSoon`
  - [x] `trendingSections.today/thisWeek/thisMonth/comingSoon`
  - [x] `eventTypeGuide`
  - [x] `trendingThisWeek`
  - [x] `topOrganisers`
  - [x] `weeklySchedule`
  - [x] basic `stats`
- [x] `GET /api/events/nearby`
  - [x] `lat/lng/radius/type/limit`
  - [x] `distanceKm`
  - [x] `center`
- [x] `GET /api/events/recommendations?limit=10`
  - [x] start with type + popularity heuristics
- [x] Event bookmarks:
  - [x] Prisma `EventBookmark`
  - [x] `POST /api/events/:id/bookmark`
  - [x] `DELETE /api/events/:id/bookmark`
  - [x] `GET /api/users/me/event-bookmarks`

## Phase 3: Organizer Tools

Goal: support My Posted Events as a real organizer dashboard.

- [x] Event RSVP model upgrade:
  - [x] `status`
  - [x] `guestCount`
  - [x] `reminderMinutesBefore`
  - [x] `checkedInAt`
- [x] `GET /api/events/:id/attendees`
- [x] `POST /api/events/:id/check-in`
- [x] `GET /api/events/:id/analytics`
- [x] `POST /api/events/:id/share`
- [x] add lightweight tracking:
  - [x] views
  - [x] shares
  - [x] bookmarks
  - [x] check-ins

## Phase 4: Detail Richness

Goal: power Event Detail sections currently implied by UI.

- [x] Reviews:
  - [x] Prisma `EventReview`
  - [x] `GET /api/events/:id/reviews`
  - [x] `POST /api/events/:id/reviews`
  - [x] one review per user per event
  - [x] only RSVP/check-in users can review
- [x] FAQ and guidelines:
  - [x] Option A first: JSON fields on `Event`
  - [x] `guidelines: string[]`
  - [x] `faq: { question, answer }[]`
- [x] Tags:
  - [x] Option A first: `tags: string[]`
- [x] Event photos/report after completion:
  - [x] `GET /api/events/:id/photos`
  - [x] `POST /api/events/:id/photos`
  - [x] `POST /api/events/:id/report`

## Phase 5: Calendar Product

Goal: support the polished calendar screen beyond monthly dots.

- [x] `GET /api/users/me/calendar/preferences`
- [x] `PATCH /api/users/me/calendar/preferences`
- [x] `GET /api/users/me/calendar.ics`
- [x] Community calendars:
  - [x] `GET /api/community-calendars`
  - [x] `POST /api/community-calendars/:id/subscribe`
  - [x] `DELETE /api/community-calendars/:id/subscribe`
- [ ] Optional later:
  - [ ] Google calendar connect
  - [ ] Outlook calendar connect

## Phase 6: Creation Enhancements

Goal: support form features implied by frontend.

- [x] Draft events:
  - [x] `POST /api/events/drafts`
  - [x] `PATCH /api/events/drafts/:id`
  - [x] `POST /api/events/drafts/:id/publish`
- [x] Recurring events:
  - [x] recurrence schema
  - [x] series/instance handling
  - [x] generated occurrences for discovery/calendar
- [x] Venue search:
  - [x] `GET /api/places/search`
  - [x] initially mock/local-safe provider if Google key is not configured
- [x] AI title suggestions:
  - [x] `POST /api/events/suggestions/title`
  - [x] start with template-based suggestions

## Recommended Immediate Next Step

Start with **Phase 1: Stabilize Core Contract**, because it improves the APIs already wired to Redux/Saga and reduces frontend bugs immediately.

Implementation order:
1. Update `GET /api/events` filters/pagination/distance.
2. Add shared response mapper for event list/detail.
3. Polish event detail response (`permissions`, `organizer`, `attendeesPreview`).
4. Align RSVP/delete response wrappers.
5. Update Postman and run smoke tests.

## Frontend Integration Coverage Audit

Source checked:
- `postman-api-collection.json`
- `services/events.ts`
- `store/events/actions.ts`
- `store/events/reducer.ts`
- `store/events/saga.ts`
- `store/events/selectors.ts`
- `app/(tabs)/events.tsx`
- `app/events/*`

### Count Summary

- Total Events-related APIs in Postman collection: **40**
- Currently wired in frontend service + Redux/Saga: **13**
- Not yet wired in frontend: **27**
- Backend TODO status: backend appears to have implemented the full Events product API surface except optional Google/Outlook calendar connect.
- Frontend status: frontend is still mostly wired to the core Events vertical slice. The polished UI still uses fallback/static data for many advanced sections.

### Frontend Already Wired

These APIs already exist in `services/events.ts` and are handled by `store/events/saga.ts`.

- [x] `GET /api/events`
- [x] `POST /api/events`
- [x] `GET /api/events/:id`
- [x] `PATCH /api/events/:id`
- [x] `DELETE /api/events/:id`
- [x] `POST /api/events/:id/rsvp`
- [x] `DELETE /api/events/:id/rsvp`
- [x] `GET /api/users/me/rsvps`
- [x] `GET /api/users/me/events`
- [x] `GET /api/events/calendar`
- [x] `GET /api/events/:id/comments`
- [x] `POST /api/events/:id/comments`
- [x] `POST /api/media/upload`

### Backend Built But Frontend Not Yet Wired

These APIs are present in the Postman collection / backend TODO, but are not yet implemented in `services/events.ts` or Redux/Saga.

#### Events Hub / Discovery

- [ ] `GET /api/events/home`
  - Frontend use: replace static sections in `app/(tabs)/events.tsx`.
  - UI sections: happening today, this week, this month, coming soon, event type guide, trending, top organisers, weekly schedule, community stories, stats.

- [ ] `GET /api/events/nearby`
  - Frontend use: replace static map/list nearby events in `app/(tabs)/events.tsx`.

- [ ] `GET /api/events/recommendations`
  - Frontend use: calendar recommendations and suggested events.

#### Create/Edit Helpers

- [ ] `POST /api/events/suggestions/title`
  - Frontend use: AI suggestion chips in `screens/event-form-screen.tsx`.

- [ ] `GET /api/places/search`
  - Frontend use: venue/location search in `screens/event-form-screen.tsx`.

- [ ] `POST /api/events/drafts`
  - Frontend use: autosave draft in event create form.

- [ ] `PATCH /api/events/drafts/:id`
  - Frontend use: update autosaved draft.

- [ ] `POST /api/events/drafts/:id/publish`
  - Frontend use: publish draft after validation.

#### Bookmark / Saved Events

- [ ] `POST /api/events/:id/bookmark`
  - Frontend use: event card/detail bookmark buttons.

- [ ] `DELETE /api/events/:id/bookmark`
  - Frontend use: remove bookmark.

- [ ] `GET /api/users/me/event-bookmarks`
  - Frontend use: saved/bookmarked event list and stats.

#### Reviews / Photos / Detail Richness

- [ ] `GET /api/events/:id/reviews`
  - Frontend use: reviews section in event detail.

- [ ] `POST /api/events/:id/reviews`
  - Frontend use: create review after attending/check-in.

- [ ] `GET /api/events/:id/photos`
  - Frontend use: event gallery/photos after completion.

- [ ] `POST /api/events/:id/photos`
  - Frontend use: organizer uploads event photos.

#### Organizer Tools

- [ ] `GET /api/events/:id/attendees`
  - Frontend use: manage attendees from My Posted Events.

- [ ] `GET /api/events/:id/analytics`
  - Frontend use: posted event analytics, views, shares, check-ins.

- [ ] `POST /api/events/:id/check-in`
  - Frontend use: organizer attendee check-in.

- [ ] `POST /api/events/:id/report`
  - Frontend use: post-event organizer report.

- [ ] `POST /api/events/:id/share`
  - Frontend use: track share actions from event detail/cards.

#### Calendar Product

- [ ] `GET /api/users/me/calendar/preferences`
  - Frontend use: notification preferences on calendar screen.

- [ ] `PATCH /api/users/me/calendar/preferences`
  - Frontend use: update reminder/calendar settings.

- [ ] `GET /api/users/me/calendar.ics`
  - Frontend use: export calendar.

- [ ] `GET /api/community-calendars`
  - Frontend use: community calendars section.

- [ ] `POST /api/community-calendars/:id/subscribe`
  - Frontend use: subscribe to community calendar.

- [ ] `DELETE /api/community-calendars/:id/subscribe`
  - Frontend use: unsubscribe from community calendar.

#### Admin / Future Frontend

- [ ] `POST /api/notifications/event-reminder`
  - Frontend use: not needed for normal devotee app yet. Future admin UI only.

### Frontend Implementation Priority

1. **Events Hub Replacement**
   - Wire `GET /api/events/home`
   - Wire `GET /api/events/nearby`
   - Keep fallback arrays until backend response is verified.

2. **Bookmarks**
   - Wire bookmark/unbookmark and `GET /api/users/me/event-bookmarks`.
   - This affects visible icons across the Events UI, so it should come early.

3. **Event Detail Richness**
   - Wire reviews, photos, share tracking, report.
   - Consume rich fields from `GET /api/events/:id`.

4. **Calendar Product**
   - Wire calendar preferences, community calendars, recommendations, `.ics` export.

5. **Organizer Tools**
   - Wire attendees, check-in, analytics, report, photos.

6. **Create/Edit Enhancements**
   - Wire title suggestions, place search, drafts, publish draft.
   - Decide whether frontend should keep JSON `bannerUrl` create/update or move to direct `multipart/form-data` create/update.

### Frontend Architecture Requirement

When integrating these APIs, follow the existing module pattern:

- `services/events.ts`
- `store/events/types.ts`
- `store/events/actions.ts`
- `store/events/reducer.ts`
- `store/events/saga.ts`
- `store/events/selectors.ts`

Do not call APIs directly from screens. Screens should dispatch actions and read selectors only.

### Frontend Safety Rule

Do not remove hardcoded fallback UI in one pass.

For each section:
1. Add service function.
2. Add type/action/reducer/saga/selector.
3. Wire screen to selector.
4. Render backend data if present.
5. Keep existing fallback when data is empty or request fails.
6. Remove fallback only after backend data is confirmed stable.
