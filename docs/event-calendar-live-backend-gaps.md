# Event Calendar Live Data Backend Notes

Status: frontend calendar screen now uses live Redux/API data instead of static demo data.

## Live APIs Used Now

- `GET /api/events/calendar?month=YYYY-MM`
  - Used for calendar dots, selected-day event cards, monthly totals, and event type breakdown.
  - Frontend accepts `days[].events`, `days[].dots`, `summary.total`, `summary.totalEvents`, `summary.attending`, and `summary.byType`.

- `GET /api/events/recommendations?limit=10`
  - Used for the “Recommended for You” section.
  - Expected response: `{ "events": SaiEvent[], "basis": string[] | string | null }`.

- `GET /api/users/me/rsvps?limit=20&offset=0`
  - Used for “My Calendar Events”.

- `GET /api/users/me/calendar/preferences`
  - Used for reminder and calendar-feed toggles.

- `PATCH /api/users/me/calendar/preferences`
  - Used when users toggle RSVP, created, bookmarked events, or reminder timing.
  - Current payload fields used by frontend:
    - `defaultReminderMinutes`
    - `showRsvpedEvents`
    - `showCreatedEvents`
    - `showBookmarkedEvents`

- `GET /api/users/me/calendar.ics`
  - Used by the Export action.

- `GET /api/community-calendars`
  - Used for the “Community Calendars” section.

- `POST /api/community-calendars/:id/subscribe`
  - Used for Subscribe.

- `DELETE /api/community-calendars/:id/subscribe`
  - Used for Unsubscribe.

## Backend Gaps For Fully Live Product UI

These are not blockers for the current live screen, but they are required if we want the richer calendar UI to become fully functional later.

1. Calendar sync providers
   - Add Google Calendar OAuth connect/disconnect/status endpoints.
   - Add Outlook Calendar OAuth connect/disconnect/status endpoints.
   - Suggested shape:
     - `GET /api/users/me/calendar/sync-connections`
     - `POST /api/users/me/calendar/sync-connections/google/start`
     - `POST /api/users/me/calendar/sync-connections/outlook/start`
     - `DELETE /api/users/me/calendar/sync-connections/:provider`

2. Calendar share link
   - Current frontend removed fake “Share Calendar” behavior.
   - If product wants sharing, add a backend-generated public or tokenized share URL.
   - Suggested endpoint: `POST /api/users/me/calendar/share-link`.

3. Recommendation explanations
   - Current recommendations can render event cards, but not strong “why this was recommended” chips.
   - Add optional fields per recommended event:
     - `recommendationReason`
     - `recommendationScore`
     - `matchedInterests`

4. Community calendar stats
   - Current response supports title, description, location, subscribers, and subscribed state.
   - If UI needs richer copy, add:
     - `eventsThisMonth`
     - `nextEventAt`
     - `organizerName`
     - `coverImageUrl`

5. Notification preference granularity
   - Current backend supports feed inclusion and default reminder timing.
   - If product needs notification-specific toggles, add fields such as:
     - `notifyNewEvents`
     - `notifyEventUpdates`
     - `notifyCommunityInvites`

## Frontend Follow-Up

- The backend returns ICS text successfully, but a polished mobile download/share experience should use Expo file/sharing support to save or share the `.ics` file locally.
- The current frontend action dispatches the export request and shows loading/error state.
