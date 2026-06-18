# Pillar 2 Events Closeout

## Status

Frontend implementation status: complete

Release status: ready for device/backend smoke testing

Automated checks:

- [x] `npx tsc --noEmit`
- [x] `npm run lint`

Manual QA:

- [ ] Device/simulator smoke test with backend running
- [ ] Empty-state verification with backend empty responses
- [ ] Protected endpoint verification after fresh login/account creation

## Completed Frontend Scope

### User-facing screens

- `app/(tabs)/events.tsx`
- `app/events/[id].tsx`
- `app/events/create.tsx`
- `app/events/edit.tsx`
- `app/events/calendar.tsx`
- `app/events/my-events.tsx`
- `app/events/rsvps.tsx`
- `app/events/bookmarks.tsx`
- `app/events/attendees.tsx`
- `screens/event-form-screen.tsx`
- `screens/event-list-screen.tsx`

### Redux and service layer

- `services/events.ts`
- `store/events/types.ts`
- `store/events/actions.ts`
- `store/events/reducer.ts`
- `store/events/saga.ts`
- `store/events/selectors.ts`
- `store/events/validation.ts`

### Core completed flows

- Events hub discovery
- Nearby events with required `lat` and `lng` guard
- Event detail
- Create event
- Edit event
- Delete/cancel event
- Banner upload through `POST /api/media/upload`, then JSON event payload with `bannerUrl`
- RSVP and cancel RSVP
- Comments load and create
- My Events
- My RSVPs
- Event calendar
- Calendar preferences
- Community calendars
- Calendar export
- Recommended events
- Saved/bookmarked events
- Bookmark/unbookmark
- Share tracking
- Report event
- Reviews
- Post-event photos
- Organizer analytics
- Attendee management
- Attendee check-in
- Event drafts, autosave, and publish
- Title suggestions
- Place search
- Recurrence payload and validation

## API Coverage

The Events frontend is wired around the current backend contract recorded in:

- `event-api-real-record.md`
- `postman-api-collection.json`
- `docs/event-pillar-api-integration-implementation.md`

Primary payload decision:

- Keep the current two-step media flow.
- Upload media first with `POST /api/media/upload`.
- Send create/update event as JSON with `bannerUrl`.
- Do not use multipart create/update unless product later decides to switch to a one-request upload flow.

## Hardcoded Data Status

Phase 8 removed user-facing hardcoded Event business data from the Events pillar.

Expected behavior now:

- Backend data appears when available.
- Empty backend responses show intentional empty states.
- Static/sample event cards should not appear in production user flows.

## Remaining Release QA

Run `docs/event-pillar-phase-1-smoke-test.md` on a real device or simulator with the backend running.

Minimum paths to verify:

- Events hub opens and refreshes.
- Filters work.
- Nearby events do not call backend without location.
- Create event succeeds with valid payload.
- Banner upload returns URL and create uses `bannerUrl`.
- Edit event succeeds.
- Delete/cancel event succeeds.
- Detail screen loads rich event data.
- RSVP and cancel RSVP work.
- Comments load and submit.
- Calendar loads month data.
- My Events loads current user's events.
- RSVPs screen loads current user's RSVPs.
- Bookmarks load and update.
- Reviews load and submit.
- Photos load and upload.
- Attendee screen loads and check-in works for organizer/admin.
- Empty backend responses show empty states.
- Logged-out or missing `x-user-id` paths fail gracefully.

## Backend Follow-up Watchlist

These areas should be watched during QA because they depend on backend data quality and permissions:

- Event home section completeness.
- Nearby event validation and location radius behavior.
- Organizer analytics counts.
- Attendee permission checks.
- Check-in response shape.
- Review response shape and rating validation.
- Photos response shape after upload.
- Calendar summary and community calendar subscription responses.
- Draft publish validation parity with create event.

## Handoff Notes

Pillar 2 is ready to bind up from frontend engineering. The next work should be either:

- Manual QA and bug fixing for the Events pillar, or
- Starting the next pillar using the same module-wise pattern: `services`, `types`, `actions`, `reducer`, `saga`, `selectors`, validation, screen wiring, then hardcoded-data removal.
