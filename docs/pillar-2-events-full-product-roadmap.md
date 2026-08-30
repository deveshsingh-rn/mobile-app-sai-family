# Pillar 2 Events: Full Product Roadmap

Audience: product, mobile, backend, admin-panel, and QA engineers

Release classification: **Version 2 Development Roadmap**

> **V2 DEVELOPMENT:** All new product capabilities in this document are planned for the second version of Sai Ki Family. They are not blockers for the current V1 release unless explicitly marked as V1 release hardening.

## Version Tags

| Tag | Meaning |
| --- | --- |
| `V1 COMPLETE` | Already implemented in the current mobile/backend event pillar. |
| `V1 RELEASE HARDENING` | Testing, security, observability, and contract work required before the current release. |
| `V2 DEVELOPMENT` | New second-version product functionality requiring planned frontend/backend implementation. |
| `V2 OPTIONAL` | Valuable second-version extension that can follow the core V2 release. |

## Product Goal

Events should support the complete journey from trustworthy discovery to transparent completion:

`Discover -> Understand -> Register -> Prepare -> Attend -> Participate -> Review -> See impact`

The product must work well for devotees aged 40+, protect attendee privacy, and give organizers enough operational tooling to run a real gathering without WhatsApp spreadsheets.

## Current Coverage `[V1 COMPLETE]`

The existing mobile/backend contract already covers:

- Discovery, home sections, nearby events, recommendations, search, filters, and calendar.
- Draft, create, edit, publish draft, recurrence payload, banner upload, and cancellation.
- RSVP/cancel RSVP, My RSVPs, My Events, bookmarks, comments, reviews, photos, and sharing.
- Organizer analytics, attendee list, manual check-in, event reports, reminders, calendar preferences, ICS export, and community calendars.

Do not rebuild these APIs. Extend them while preserving current response fields.

## Priority 0: Release Hardening `[V1 RELEASE HARDENING]`

No new product API should ship before this pass:

- Run the complete physical-device smoke checklist.
- Add API integration tests for create/edit/cancel, RSVP, bookmark, review, photo upload, and check-in.
- Standardize errors as `{ error: { code, message, details?, requestId } }`.
- Add idempotency support to create event, RSVP, check-in, publish, and media mutations.
- Confirm every protected response returns explicit `permissions` flags.
- Verify timezone and recurring-event behavior around daylight-saving transitions.
- Add Crashlytics/Sentry breadcrumbs for event mutations without recording private attendee data.

## Priority 1: Registration, Capacity, And Waitlist `[V2 DEVELOPMENT]`

### Product behavior

- Organizer can set capacity, registration closing time, guest policy, and approval mode.
- Devotee can RSVP for self and optional family guests.
- Full events automatically move new RSVPs to a waitlist.
- Cancellation promotes the next eligible devotee and sends a notification.
- Event detail shows truthful states: `Spots available`, `Almost full`, `Waitlist`, or `Registration closed`.

### Backend additions

Extend event create/update:

```json
{
  "capacity": 250,
  "registrationClosesAt": "2026-09-10T12:00:00.000Z",
  "rsvpMode": "instant",
  "allowGuests": true,
  "maxGuestsPerRsvp": 4
}
```

Extend `POST /api/events/:id/rsvp`:

```json
{
  "guestCount": 2,
  "accessibilityNeeds": "Wheelchair seating",
  "emergencyContactName": "Optional",
  "emergencyContactPhone": "Optional"
}
```

Add:

- `GET /api/events/:id/registration-summary` - public aggregate, no PII.
- `GET /api/events/:id/waitlist` - organizer/admin only.
- `POST /api/events/:id/waitlist/:rsvpId/promote` - organizer/admin.
- `PATCH /api/events/:id/rsvps/:rsvpId` - approve, reject, or update guest count.

RSVP response must return `status: going|waitlisted|pending|cancelled` and current capacity aggregates.

## Priority 2: Organizer Team And Permissions `[V2 DEVELOPMENT]`

One owner is not enough for real events. Add event-scoped roles:

- `owner`
- `co_host`
- `check_in_volunteer`
- `communications_manager`
- `photo_manager`

Endpoints:

- `GET /api/events/:id/team`
- `POST /api/events/:id/team/invitations`
- `PATCH /api/events/:id/team/:memberId`
- `DELETE /api/events/:id/team/:memberId`
- `POST /api/events/:id/team/invitations/:token/accept`

Every event detail response should expose capability flags such as `canEdit`, `canMessageAttendees`, `canCheckIn`, `canUploadPhotos`, and `canViewPrivateRsvpFields`.

## Priority 3: QR Pass And Reliable Check-In `[V2 DEVELOPMENT]`

### Product behavior

- Each confirmed RSVP receives a rotating or signed QR pass.
- Organizer scans QR or searches by name/mobile/member ID.
- Duplicate scans do not create duplicate attendance.
- Scanner supports a short offline queue and synchronizes when connectivity returns.
- Organizer can check out attendees for safety/capacity reporting.

### Backend additions

- `GET /api/users/me/event-passes/:eventId`
- `POST /api/events/:id/check-ins/scan`
- `POST /api/events/:id/check-ins/manual`
- `POST /api/events/:id/check-outs`
- `POST /api/events/:id/check-ins/bulk-sync`
- `GET /api/events/:id/check-in-summary`

All check-in mutations require an `Idempotency-Key`, record actor/time/device, and create an immutable audit entry. QR tokens must be signed, short-lived, revocable, and contain no attendee PII.

## Priority 4: Agenda, Sessions, And Venue Guidance `[V2 DEVELOPMENT]`

Add a structured event program instead of placing everything in description text.

- `GET /api/events/:id/agenda`
- `POST /api/events/:id/agenda/items`
- `PATCH /api/events/:id/agenda/items/:itemId`
- `DELETE /api/events/:id/agenda/items/:itemId`
- `POST /api/events/:id/agenda/reorder`

Agenda item fields: title, description, start/end time, speaker/leader, location/room, type, livestream URL, and attachment links.

Also support parking instructions, entry gate, accessibility, dress guidance, food/prasad information, emergency contact, and venue map media in event detail.

## Priority 5: Announcements And Live Operations `[V2 DEVELOPMENT]`

Comments are community discussion; announcements are authoritative organizer communication.

- `GET /api/events/:id/announcements`
- `POST /api/events/:id/announcements`
- `PATCH /api/events/:id/announcements/:announcementId`
- `DELETE /api/events/:id/announcements/:announcementId`
- `POST /api/events/:id/announcements/:announcementId/read`

Announcement types: update, reminder, venue_change, delayed, emergency, cancelled, and post_event.

Use a notification outbox/worker for Expo push delivery. Store delivery status and retries. For live screens, add SSE or WebSocket updates for status, announcement, capacity, and agenda changes; REST remains the source of truth.

## Priority 6: Volunteer And Seva Operations `[V2 DEVELOPMENT]`

- Organizer creates roles/shifts with required volunteer count.
- Devotees volunteer, withdraw, and receive shift reminders.
- Leads mark attendance and task completion.

Endpoints:

- `GET/POST /api/events/:id/volunteer-shifts`
- `PATCH/DELETE /api/events/:id/volunteer-shifts/:shiftId`
- `POST /api/events/:id/volunteer-shifts/:shiftId/signup`
- `DELETE /api/events/:id/volunteer-shifts/:shiftId/signup`
- `GET /api/users/me/volunteer-shifts`

## Priority 7: Transparency And Impact `[V2 DEVELOPMENT]`

After completion, an event should have a public, verifiable outcome rather than disappearing from discovery.

Add lifecycle states:

`draft -> pending_review -> published -> registration_closed -> live -> completed`

Exceptional transitions:

`published -> postponed|cancelled`, with mandatory reason and attendee notification.

Endpoints:

- `POST /api/events/:id/submit-for-review`
- `POST /api/events/:id/postpone`
- `POST /api/events/:id/cancel`
- `POST /api/events/:id/complete`
- `GET /api/events/:id/change-history`
- `GET/PUT /api/events/:id/impact-report`

Impact report fields may include attendance, volunteer hours, meals/prasad served, beneficiaries, medical consultations, donations collected, expenses, proof documents, photos, organizer note, and verification status. Financial fields must be optional and visible only when relevant.

The public detail screen should show an immutable change timeline for major date, venue, status, and organizer changes.

## Priority 8: Safety, Moderation, And Privacy `[V2 DEVELOPMENT]`

- Separate public user flagging from organizer operational reporting.
- Add `POST /api/events/:id/flags` for fraud, unsafe content, wrong location, impersonation, or other concerns.
- Add blocklist support for organizers/admins with reason and audit trail.
- Never expose attendee mobile, email, accessibility needs, or emergency contact publicly.
- Require explicit attendee consent before showing profile in public attendee previews.
- Rate-limit comments, reviews, reports, RSVP attempts, invitations, and announcement sends.
- Define retention/deletion policy for QR tokens, emergency contacts, and check-in device metadata.

Admin APIs/UI required:

- Moderation queue and event approval/rejection.
- Flag investigation and resolution.
- Organizer verification/suspension.
- Cancellation/postponement oversight.
- Audit log viewer.
- Notification delivery and failed-job dashboard.

## Priority 9: Feedback And Post-Event Follow-Up `[V2 OPTIONAL]`

- Structured survey separate from public review.
- Review eligibility based on confirmed attendance when configured.
- Organizer response to reviews.
- Photo moderation and consent reporting.
- Optional participation certificate/service-hours record.

Suggested endpoints:

- `GET/POST /api/events/:id/surveys`
- `POST /api/events/:id/surveys/:surveyId/responses`
- `POST /api/events/:id/reviews/:reviewId/organizer-response`
- `DELETE /api/events/:id/photos/:photoId`
- `GET /api/users/me/event-participation`

## Frontend Screens To Add `[V2 DEVELOPMENT]`

- Registration sheet with guests, consent, accessibility, and waitlist state.
- My Event Pass with QR and offline-safe cached pass.
- Organizer Command Center: overview, team, attendees, announcements, agenda, volunteers, and impact.
- Scanner screen with clear success, duplicate, invalid, and offline states.
- Event Updates timeline.
- Agenda/session detail.
- Volunteer shifts and My Seva commitments.
- Event impact/transparency report.
- Admin web panel for moderation and operations.

## Backend Architecture And Performance `[V2 DEVELOPMENT]`

- Use cursor pagination for comments, attendees, announcements, audit logs, and large event feeds.
- Add PostgreSQL indexes for status/startAt, ownerId/startAt, type/startAt, RSVP eventId/status, and geospatial coordinates.
- Use PostGIS or an equivalent indexed geospatial query for nearby discovery.
- Cache public event detail/home/calendar responses and invalidate on event mutation.
- Use transactional capacity checks to prevent oversubscription and duplicate waitlist promotion.
- Use an outbox pattern for push notifications, calendar updates, and analytics events.
- Store media metadata in PostgreSQL and binaries in Azure; use thumbnails and signed upload URLs.
- Return `ETag`/`updatedAt` for conflict-safe organizer edits.
- Add request IDs, structured logs, metrics, and traces for publish, RSVP, notification, and check-in flows.
- Avoid unbounded Redux/backend arrays; every list endpoint must paginate.

## Recommended V2 Delivery Order

1. Release QA and contract hardening.
2. Capacity, guests, RSVP statuses, and waitlist.
3. Organizer team and permissions.
4. QR passes, scanner, check-in audit, and offline sync.
5. Announcements and event lifecycle/change history.
6. Agenda and venue guidance.
7. Volunteer/seva operations.
8. Impact report, safety moderation, and admin panel.
9. Surveys, certificates, external calendar OAuth, and optional payments/donations.

## Definition Of A Full-Fledged V2 Event

An event is product-complete when a devotee can discover trustworthy information, register with an accurate status, receive updates, enter safely, participate, and see the outcome; while an organizer can plan, delegate, communicate, verify attendance, handle exceptions, and publish a transparent impact record with a complete audit trail.
