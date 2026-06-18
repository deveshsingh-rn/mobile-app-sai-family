# Event Pillar Phase 1 Smoke Test

Purpose: verify the stabilized Event Redux/Saga/API integration on a device or simulator before release hardening.

Phase 1 source plan: `docs/event-pillar-api-integration-implementation.md`
Real backend contract: `event-api-real-record.md`

## Test Setup

- Backend is running and reachable from the device/simulator.
- `app.json` or `EXPO_PUBLIC_API_BASE_URL` points to the backend host reachable by the app.
- A devotee account exists and is stored in SecureStore so `services/api.ts` can attach `x-user-id`.
- Known tested author ID from contract audit: `cmq9awrmi000e9m0yrtugdg9u`.

## Pass Criteria

- No red screen.
- No repeated 401 for logged-in user flows.
- No `[API Response Error]` for the expected happy path.
- Existing polished Event UI remains stable when API data is empty.
- Empty backend responses show intentional empty states instead of static sample events.
- API-backed data appears when backend returns events.
- Create/edit still use the two-step media flow:
  1. `POST /api/media/upload`
  2. Use returned `url` as `bannerUrl`
  3. Send JSON to `POST /api/events` or `PATCH /api/events/:id`

## 1. Events Hub / Feed

Route: `app/(tabs)/events.tsx`

Actions:

- Open the Events tab.
- Pull to refresh.
- Change event filters such as All Events, Bhajan, Seva, Satsang, Pooja.
- Toggle map/list mode if visible.

Expected:

- `GET /api/events` fires with params such as `limit`, `type`, `lat`, `lng`, `radius`, or `sort` when applicable.
- Backend wrapper `{ events, pagination }` is handled.
- Feed cards render API events when available.
- Empty sections show intentional empty states if the backend returns no data.
- No static/sample event cards appear after Phase 8 hardcoded data removal.
- Loading state clears after request success/failure.

Record:

- [ ] Pass
- [ ] Fail
- Notes:

## 2. Create Event

Route: `app/events/create.tsx`

Actions:

- Tap create event from the Events UI.
- Fill required fields:
  - title min 3
  - description min 10
  - start/end date where `endAt >= startAt`
  - address min 5
  - valid latitude/longitude
- Choose an event type.
- Upload/select a banner image if available.
- Submit.

Expected:

- If banner is selected, `POST /api/media/upload` succeeds first and returns top-level `url`.
- Create request sends JSON to `POST /api/events` with `bannerUrl`.
- No multipart create-event request is required.
- Created event appears in feed or My Events after refresh.
- Validation errors are shown before invalid backend requests.

Record:

- [ ] Pass
- [ ] Fail
- Created event ID:
- Notes:

## 3. Event Detail

Route: `app/events/[id].tsx`

Actions:

- Tap an API-backed event card.
- Review title, date/time, venue, organizer, counts, and description.
- Pull/return/reopen if possible.

Expected:

- `GET /api/events/:id` returns `{ event }`.
- Detail screen renders without crashing with rich fields such as `media`, `permissions`, `organizer`, `guidelines`, `faq`, `tags`, or `similarEvents`.
- Missing optional fields do not break layout.

Record:

- [ ] Pass
- [ ] Fail
- Notes:

## 4. RSVP And Cancel RSVP

Route: `app/events/[id].tsx`

Actions:

- Tap RSVP / Going.
- Confirm count updates.
- If UI exposes cancel RSVP, cancel it.

Expected:

- RSVP sends `POST /api/events/:id/rsvp` with default `{ "status": "going" }`.
- Response `{ event, rsvp }` updates local `rsvpedByMe` and `rsvps`.
- Cancel sends `DELETE /api/events/:id/rsvp`.
- Pending state prevents duplicate taps.

Record:

- [ ] Pass
- [ ] Fail
- Notes:

## 5. Comments

Route: `app/events/[id].tsx`

Actions:

- Open an event detail screen.
- Confirm existing comments load.
- Add a non-empty comment.

Expected:

- `GET /api/events/:id/comments` handles `{ comments, pagination }`.
- `POST /api/events/:id/comments` handles `{ eventId, comment, _count }`.
- New comment appears in the list.
- Empty comment is blocked by frontend validation.

Record:

- [ ] Pass
- [ ] Fail
- Notes:

## 6. Edit Event

Route: `app/events/edit.tsx`

Actions:

- Open edit for an event owned by the current user.
- Change title or description.
- Optionally change banner.
- Submit.

Expected:

- Existing event detail loads with `GET /api/events/:id`.
- If banner changed, upload media first and pass returned `url` as `bannerUrl`.
- Update sends JSON to `PATCH /api/events/:id`.
- Updated event appears in detail/feed/my-events after refresh.
- Non-owner edit attempts are blocked by backend and handled without crashing.

Record:

- [ ] Pass
- [ ] Fail
- Notes:

## 7. My Events

Route: `app/events/my-events.tsx`

Actions:

- Open My Events.
- Refresh.
- Confirm created/owned events appear.

Expected:

- `GET /api/users/me/events` handles `{ events, pagination }`.
- Empty state still looks intentional if the user has no events.
- Counts such as RSVPs/comments are stable.

Record:

- [ ] Pass
- [ ] Fail
- Notes:

## 8. RSVPs

Route: `app/events/rsvps.tsx`

Actions:

- RSVP to an event.
- Open RSVPs screen.
- Refresh.

Expected:

- `GET /api/users/me/rsvps` handles `{ events, pagination }`.
- RSVP event appears after RSVP.
- Cancelled RSVP disappears after refresh.

Record:

- [ ] Pass
- [ ] Fail
- Notes:

## 9. Calendar

Route: `app/events/calendar.tsx`

Actions:

- Open Calendar.
- Change month if UI supports it.
- Tap a date with events.

Expected:

- `GET /api/events/calendar?month=YYYY-MM` handles `{ days, summary }`.
- Existing flat event selector still powers the current UI.
- New `calendarDays` and `calendarSummary` are available in Redux for future UI polish.
- Empty months do not crash.

Record:

- [ ] Pass
- [ ] Fail
- Notes:

## 10. Delete / Cancel Event

Route: event detail or My Events owner flow.

Actions:

- Delete/cancel a test event owned by the current user.

Expected:

- `DELETE /api/events/:id` returns `{ success, id, status }`.
- Event is removed from feed/my-events/rsvps locally.
- Detail screen does not crash after deletion.

Record:

- [ ] Pass
- [ ] Fail
- Notes:

## Phase 9 Release-Hardening Completion

Mark the Events API integration release-ready only after:

- [ ] Events hub/feed smoke passes.
- [ ] Create event smoke passes.
- [ ] Detail smoke passes.
- [ ] RSVP/cancel smoke passes.
- [ ] Comments smoke passes.
- [ ] Edit event smoke passes.
- [ ] My Events smoke passes.
- [ ] RSVPs smoke passes.
- [ ] Calendar smoke passes.
- [ ] Delete/cancel smoke passes.
- [x] `npx tsc --noEmit` passes.
- [x] `npm run lint` passes.
