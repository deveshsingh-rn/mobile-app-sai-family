# Pillar 2 Events API Requirements

Audience: backend engineer
Frontend reviewed: `app/(tabs)/events.tsx`, `app/events/*`, `screens/event-form-screen.tsx`, `screens/event-list-screen.tsx`, `services/events.ts`, `store/events/*`

## Product Summary

The Events pillar is no longer just CRUD. The current mobile UI presents Events as a full discovery, calendar, RSVP, organizer, and community scheduling product.

The frontend already has Redux/Saga integration for the core endpoints, but many polished UI sections still use local fallback/static data. Backend should support the full product surface so those sections become real and consistent across users.

## Current Frontend Flow

1. Events hub: `app/(tabs)/events.tsx`
   - Loads discovery events.
   - Filters by event type.
   - Shows list mode and map mode.
   - Shows sections such as event type guide, active committees, trending this week, top organisers, quick actions, weekly scheduler, community stories, nearby map/list.

2. Event detail: `app/events/[id].tsx`
   - Loads event detail and comments.
   - Allows RSVP/cancel RSVP.
   - Allows owner edit/delete.
   - Shows organizer, attendees, about, location, guidelines, reviews, FAQ, similar events, tags, comments, share/report.

3. Create/edit event: `app/events/create.tsx`, `app/events/edit.tsx`, `screens/event-form-screen.tsx`
   - Creates or updates event.
   - Uploads banner through media upload.
   - Uses date/time picker, current location, country/state/city/timezone selectors.
   - UI implies recurring events, draft save, AI title suggestions, venue search.

4. Calendar: `app/events/calendar.tsx`
   - Loads events by month.
   - Shows selected date events, upcoming week, monthly overview, event type breakdown, recommendations, my calendar events, calendar sync, community calendars, notification preferences, help.

5. My events: `app/events/my-events.tsx`
   - Loads RSVPs and posted events.
   - UI implies attendee management, analytics, reminders, check-ins, reports, photos.

6. My RSVPs: `app/events/rsvps.tsx`
   - Uses shared list screen for events the current user is attending.

## Auth Contract

For authenticated endpoints, current API client sends user identity through request headers used elsewhere in the app:

```http
x-user-id: <devoteeAccount.id or authorId>
Content-Type: application/json
```

Backend should consistently return `401 UNAUTHENTICATED` when `x-user-id` is missing for protected operations.

## Core Data Model

Frontend normalized event shape:

```ts
type EventType =
  | "bhajan"
  | "pooja"
  | "seva"
  | "medical"
  | "satsang"
  | "darshan"
  | "general";

type SaiEvent = {
  id: string;
  title: string;
  description: string;
  type?: EventType;
  startAt: string;       // ISO datetime
  endAt: string;         // ISO datetime
  timezone?: string;
  bannerUrl?: string | null;
  venueName?: string | null;
  address: string;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  latitude: number;
  longitude: number;
  ownerId?: string;
  ownerName?: string | null;
  ownerProfileImageUrl?: string | null;
  rsvps?: number;
  comments?: number;
  rsvpedByMe?: boolean;
  createdAt?: string;
  updatedAt?: string;
};
```

Recommended backend response wrapper:

```json
{
  "event": {
    "id": "evt_123",
    "title": "Thursday Sai Bhajan",
    "description": "Weekly satsang and aarti for all devotees.",
    "type": "bhajan",
    "startAt": "2026-06-15T13:30:00.000Z",
    "endAt": "2026-06-15T15:00:00.000Z",
    "timezone": "Asia/Kolkata",
    "venueName": "Sai Mandir Hall",
    "address": "MG Road, Pune, Maharashtra",
    "city": "Pune",
    "state": "Maharashtra",
    "country": "India",
    "latitude": 18.5204,
    "longitude": 73.8567,
    "bannerUrl": "https://cdn.example.com/event.jpg",
    "owner": {
      "id": "usr_123",
      "name": "Ravi Sharma",
      "profileImageUrl": "https://cdn.example.com/avatar.jpg"
    },
    "_count": {
      "rsvps": 42,
      "comments": 8
    },
    "rsvpedByMe": false,
    "createdAt": "2026-06-01T10:00:00.000Z",
    "updatedAt": "2026-06-01T10:00:00.000Z"
  }
}
```

Frontend saga can normalize `_count.rsvps`, `_count.comments`, `owner`, `author`, `rsvpsCount`, and `commentsCount`, but consistent wrapper responses will reduce bugs.

## Priority 1: Core APIs Already Wired

These endpoints are required for the current Redux flow.

### 1. Event Discovery

`GET /api/events`

Query params:

| Param | Type | Notes |
| --- | --- | --- |
| `page` | number | Optional page number. Existing frontend may send this. |
| `limit` | number | Optional, default 20. |
| `offset` | number | Optional alternative to page. |
| `type` | enum | `bhajan`, `pooja`, `seva`, `medical`, `satsang`, `darshan`, `general`. |
| `lat` | number | Optional current/map latitude. |
| `lng` | number | Optional current/map longitude. |
| `radius` | number | Optional km radius. |
| `q` | string | Needed for UI search. |
| `dateFrom` | ISO date | Needed for Today/This Week/Coming Soon. |
| `dateTo` | ISO date | Needed for date ranges. |
| `sort` | string | Recommended: `soonest`, `nearest`, `trending`, `popular`, `newest`. |
| `status` | string | Recommended: `published`, `cancelled`, `completed`, `draft`. Public discovery should default to `published`. |

Response:

```json
{
  "events": [],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "hasMore": true,
    "total": 134
  }
}
```

Backend behavior:

- Return only published future events by default.
- Include `rsvpedByMe` if `x-user-id` is present.
- Include distance in km when `lat/lng` are supplied.
- Support geospatial ordering for map/list nearby mode.

### 2. Event Detail

`GET /api/events/:id`

Response should include core `event` plus richer optional fields:

```json
{
  "event": {},
  "permissions": {
    "canEdit": true,
    "canDelete": true,
    "canManageAttendees": true
  },
  "organizer": {
    "id": "usr_123",
    "name": "Ravi Sharma",
    "profileImageUrl": "https://cdn.example.com/avatar.jpg",
    "bio": "Bhajan and satsang host",
    "eventsOrganized": 127,
    "rating": 4.9,
    "phone": "+919999999999"
  },
  "attendeesPreview": [
    {
      "id": "usr_1",
      "name": "Asha",
      "profileImageUrl": "https://cdn.example.com/a.jpg"
    }
  ],
  "media": [
    {
      "id": "media_1",
      "type": "image",
      "url": "https://cdn.example.com/banner.jpg",
      "thumbnailUrl": "https://cdn.example.com/banner-thumb.jpg"
    }
  ],
  "guidelines": [
    "Arrive 10 minutes early",
    "Wear comfortable devotional attire"
  ],
  "faq": [
    {
      "question": "Is this event free?",
      "answer": "Yes, this is a free event."
    }
  ],
  "tags": ["bhajan", "satsang", "family"],
  "similarEvents": []
}
```

### 3. Create Event

`POST /api/events`

Headers: `x-user-id` required.

Required:

- `title` min 3
- `description` min 10
- `startAt` valid ISO datetime
- `endAt` valid ISO datetime
- `address` min 5
- `latitude` between `-90..90`
- `longitude` between `-180..180`

Optional:

- `type`: enum
- `bannerUrl`: valid URL
- `timezone`: min 3, default `Asia/Kolkata`
- `venueName`: min 2
- `city/state/country`: min 2

Business rules:

- `endAt >= startAt`
- Owner is `x-user-id`.
- New events should default to `published` unless drafts are implemented.

Payload:

```json
{
  "title": "Thursday Sai Bhajan",
  "description": "Weekly satsang and aarti for all devotees.",
  "type": "bhajan",
  "startAt": "2026-06-15T13:30:00.000Z",
  "endAt": "2026-06-15T15:00:00.000Z",
  "timezone": "Asia/Kolkata",
  "venueName": "Sai Mandir Hall",
  "address": "MG Road, Pune, Maharashtra",
  "city": "Pune",
  "state": "Maharashtra",
  "country": "India",
  "latitude": 18.5204,
  "longitude": 73.8567,
  "bannerUrl": "https://cdn.example.com/banner.jpg"
}
```

Response: `201 { "event": {} }`

### 4. Update Event

`PATCH /api/events/:id`

Headers: `x-user-id` required.

Rules:

- At least one field required.
- Owner or admin only.
- Same validation as create for provided fields.
- `bannerUrl` can be URL or `null`.
- If start/end are changed, enforce effective `endAt >= startAt`.

Response: `{ "event": {} }`

### 5. Cancel/Delete Event

`DELETE /api/events/:id`

Headers: `x-user-id` required.

Recommended behavior:

- Soft-delete or mark `status = cancelled`.
- Notify RSVP users if push notifications are enabled.
- Owner or admin only.

Response:

```json
{
  "success": true,
  "id": "evt_123",
  "status": "cancelled"
}
```

### 6. RSVP

`POST /api/events/:id/rsvp`

Headers: `x-user-id` required.

Recommended request body:

```json
{
  "status": "going",
  "guests": 0,
  "reminderMinutesBefore": 30
}
```

Response:

```json
{
  "event": {
    "id": "evt_123",
    "rsvps": 43,
    "rsvpedByMe": true
  },
  "rsvp": {
    "id": "rsvp_123",
    "status": "going",
    "createdAt": "2026-06-03T10:00:00.000Z"
  }
}
```

`DELETE /api/events/:id/rsvp`

Response:

```json
{
  "event": {
    "id": "evt_123",
    "rsvps": 42,
    "rsvpedByMe": false
  }
}
```

### 7. My RSVPs

`GET /api/users/me/rsvps?limit=20&offset=0`

Headers: `x-user-id` required.

Response:

```json
{
  "rsvps": [
    {
      "id": "rsvp_123",
      "status": "going",
      "event": {}
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "hasMore": false
  }
}
```

Frontend saga supports either `rsvps[].event` or direct event arrays.

### 8. My Posted Events

`GET /api/users/me/events?limit=20&offset=0`

Headers: `x-user-id` required.

Response:

```json
{
  "events": [],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "hasMore": false
  }
}
```

Recommended additions per event:

- `views`
- `checkIns`
- `capacity`
- `rating`
- `reviews`
- `status`: `draft`, `published`, `live`, `completed`, `cancelled`

### 9. Calendar

`GET /api/events/calendar?month=YYYY-MM`

Response options supported by frontend:

```json
{
  "calendar": []
}
```

Recommended richer response:

```json
{
  "month": "2026-06",
  "days": [
    {
      "date": "2026-06-15",
      "events": []
    }
  ],
  "summary": {
    "totalEvents": 23,
    "attending": 8,
    "byType": {
      "satsang": 8,
      "bhajan": 7,
      "pooja": 5,
      "seva": 3
    }
  }
}
```

Frontend saga currently flattens `days[].events`, but future UI should consume `summary`.

### 10. Event Comments

`GET /api/events/:id/comments?limit=20&offset=0`

Response:

```json
{
  "comments": [
    {
      "id": "comment_123",
      "content": "I will join with my family.",
      "createdAt": "2026-06-03T10:00:00.000Z",
      "author": {
        "id": "usr_123",
        "name": "Asha",
        "profileImageUrl": "https://cdn.example.com/avatar.jpg"
      }
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

`POST /api/events/:id/comments`

Headers: `x-user-id` required.

Validation:

- `content` min 1, max 1000.

Payload:

```json
{
  "content": "I will join this event with my family."
}
```

Response:

```json
{
  "comment": {}
}
```

### 11. Media Upload

`POST /api/media/upload`

Headers: `x-user-id` required.

Form-data:

- Single file key: `file`
- Multiple file key: `files`

Allowed MIME:

- Images: `image/jpeg`, `image/png`, `image/webp`
- Video: `video/mp4`, `video/quicktime`
- Audio: `audio/mpeg`, `audio/mp4`, `audio/wav`, `audio/webm`

Limits:

- Max 10 files.
- Max 150MB each.

Response:

```json
{
  "media": [
    {
      "id": "media_123",
      "url": "https://cdn.example.com/file.jpg",
      "thumbnailUrl": "https://cdn.example.com/thumb.jpg",
      "mimeType": "image/jpeg",
      "size": 124000
    }
  ],
  "url": "https://cdn.example.com/file.jpg"
}
```

## Priority 2: APIs Required By Current Polished UI

These are visible or implied in the current UI but not wired yet.

### 12. Events Home Dashboard

`GET /api/events/home`

Purpose: replace static sections in `app/(tabs)/events.tsx`.

Query:

- `lat`, `lng`, `radius`
- `timezone`
- `dateFrom`, `dateTo`

Response:

```json
{
  "sections": {
    "happeningToday": {
      "count": 3,
      "events": []
    },
    "thisWeek": {
      "count": 8,
      "events": []
    },
    "thisMonth": {
      "count": 12,
      "events": []
    },
    "comingSoon": {
      "count": 15,
      "events": []
    }
  },
  "eventTypeGuide": [
    {
      "type": "bhajan",
      "label": "Bhajan",
      "summary": "Devotional music, aarti, and group singing.",
      "countLabel": "18 this month"
    }
  ],
  "activeCommittees": [
    {
      "id": "committee_1",
      "title": "Sai Youth Events",
      "members": 42,
      "trend": "+6 new helpers"
    }
  ],
  "trendingThisWeek": [
    {
      "rank": 1,
      "event": {}
    }
  ],
  "topOrganisers": [
    {
      "id": "usr_123",
      "name": "Ravi Sharma",
      "profileImageUrl": null,
      "events": 24,
      "specialty": "Bhajan and satsang host"
    }
  ],
  "weeklySchedule": [
    {
      "day": "Mon",
      "count": 2,
      "label": "Reading"
    }
  ],
  "communityStories": [
    {
      "id": "story_1",
      "title": "Moved to a bigger hall",
      "text": "Our weekly bhajan night moved after 80 devotees joined through Events.",
      "authorName": "Sai Youth Events"
    }
  ],
  "stats": {
    "eventsAttended": 12,
    "savedEvents": 8,
    "sevaHours": 32
  }
}
```

### 13. Nearby Events Map

`GET /api/events/nearby`

Query:

- `lat`, `lng`, `radius`, `type`, `limit`

Response:

```json
{
  "events": [
    {
      "id": "evt_123",
      "title": "Thursday Evening Bhajan",
      "type": "bhajan",
      "latitude": 18.5204,
      "longitude": 73.8567,
      "distanceKm": 2.3,
      "startAt": "2026-06-15T13:30:00.000Z",
      "rsvps": 45
    }
  ],
  "center": {
    "latitude": 18.5204,
    "longitude": 73.8567
  }
}
```

### 14. Recommendations

`GET /api/events/recommendations?limit=10`

Headers: `x-user-id` optional but recommended.

Recommendation inputs:

- User RSVPs.
- Event type preferences.
- Location.
- Sangha membership.
- Trending popularity.

Response:

```json
{
  "events": [
    {
      "reason": "Because you attend bhajan events",
      "event": {}
    }
  ]
}
```

### 15. Save/Bookmark Event

Current UI has bookmark icons and saved event stats, but the Events store has no event bookmark API yet.

`POST /api/events/:id/bookmark`

Headers: `x-user-id` required.

`DELETE /api/events/:id/bookmark`

Response:

```json
{
  "eventId": "evt_123",
  "bookmarkedByMe": true,
  "bookmarks": 12
}
```

`GET /api/users/me/event-bookmarks?limit=20&offset=0`

Response:

```json
{
  "events": []
}
```

### 16. Attendee Management

Needed for My Posted Events and organizer screens.

`GET /api/events/:id/attendees?limit=50&offset=0&status=going`

Response:

```json
{
  "attendees": [
    {
      "rsvpId": "rsvp_123",
      "status": "going",
      "checkedIn": false,
      "guestCount": 0,
      "user": {
        "id": "usr_123",
        "name": "Asha",
        "profileImageUrl": null,
        "mobileNumber": "+919999999999"
      }
    }
  ],
  "summary": {
    "going": 42,
    "checkedIn": 12,
    "cancelled": 2,
    "capacity": 80
  }
}
```

`POST /api/events/:id/check-in`

Headers: owner/admin only.

Payload:

```json
{
  "userId": "usr_123"
}
```

### 17. Organizer Analytics

Needed for My Posted Events.

`GET /api/events/:id/analytics`

Headers: owner/admin only.

Response:

```json
{
  "eventId": "evt_123",
  "views": 342,
  "shares": 21,
  "bookmarks": 18,
  "rsvps": 67,
  "checkIns": 38,
  "comments": 12,
  "rating": 4.9,
  "reviews": 12,
  "trafficByDay": [
    {
      "date": "2026-06-01",
      "views": 44,
      "rsvps": 6
    }
  ]
}
```

### 18. Event Reviews

The detail screen shows a reviews section, but there is no backend contract yet.

`GET /api/events/:id/reviews?limit=20&offset=0`

`POST /api/events/:id/reviews`

Headers: `x-user-id` required.

Payload:

```json
{
  "rating": 5,
  "content": "Beautifully organized bhajan."
}
```

Rules:

- Only users who RSVP'd or checked in can review.
- One review per user per event.
- Rating `1..5`.

### 19. Event FAQ and Guidelines

Option A: simple fields on event:

- `guidelines: string[]`
- `faq: { question: string; answer: string }[]`

Option B: separate endpoints:

`GET /api/events/:id/faq`

`PATCH /api/events/:id/faq`

`GET /api/events/:id/guidelines`

`PATCH /api/events/:id/guidelines`

Owner/admin only for mutations.

### 20. Recurring Events

Create form UI implies recurring event support.

Add to `POST /api/events` and `PATCH /api/events/:id`:

```json
{
  "recurrence": {
    "frequency": "weekly",
    "interval": 1,
    "daysOfWeek": ["thu"],
    "until": "2026-12-31T00:00:00.000Z"
  }
}
```

Recommended implementation:

- Store recurrence rule on parent event.
- Generate event instances for discovery/calendar.
- Include `seriesId` and `instanceId` when applicable.

### 21. Draft Events

Create screen displays "Draft saved".

`POST /api/events/drafts`

`PATCH /api/events/drafts/:id`

`POST /api/events/drafts/:id/publish`

Rules:

- Draft validation can be relaxed.
- Publish must pass full event validation.

### 22. AI Title Suggestions

Create form has title suggestion UI. Backend can either serve fixed templates or call AI later.

`POST /api/events/suggestions/title`

Payload:

```json
{
  "type": "bhajan",
  "city": "Pune",
  "description": "Evening bhajan and aarti"
}
```

Response:

```json
{
  "suggestions": [
    "Sai Bhajan Evening",
    "Community Satsang",
    "Sacred Gathering"
  ]
}
```

### 23. Venue Search

Create screen has venue search UI and current location.

`GET /api/places/search?q=Sai%20Mandir&lat=18.52&lng=73.85`

Response:

```json
{
  "places": [
    {
      "id": "place_123",
      "name": "Sai Mandir Community Hall",
      "address": "123 Temple Road",
      "city": "Mumbai",
      "state": "Maharashtra",
      "country": "India",
      "latitude": 19.076,
      "longitude": 72.8777,
      "timezone": "Asia/Kolkata"
    }
  ]
}
```

### 24. Calendar Sync and Preferences

Calendar UI shows Google/Apple/Outlook sync, reminder timing, event reminders, new events, event updates, community invites.

`GET /api/users/me/calendar/preferences`

`PATCH /api/users/me/calendar/preferences`

Payload:

```json
{
  "eventReminders": true,
  "newEvents": true,
  "eventUpdates": false,
  "communityInvites": true,
  "reminderMinutesBefore": 15
}
```

Calendar provider sync:

- `POST /api/users/me/calendar-sync/google/connect`
- `DELETE /api/users/me/calendar-sync/google`
- `POST /api/users/me/calendar-sync/outlook/connect`
- `DELETE /api/users/me/calendar-sync/outlook`
- Apple Calendar usually requires local `.ics` export/deep link rather than server OAuth.

Export:

`GET /api/users/me/calendar.ics`

### 25. Community Calendars

Calendar UI shows subscribed community event feeds.

`GET /api/community-calendars`

`POST /api/community-calendars/:id/subscribe`

`DELETE /api/community-calendars/:id/subscribe`

Response:

```json
{
  "calendars": [
    {
      "id": "cal_123",
      "name": "Downtown Sai Community",
      "members": 1234,
      "eventsThisMonth": 45,
      "subscribedByMe": true
    }
  ]
}
```

### 26. Event Notifications

Existing postman notes mention:

`POST /api/notifications/event-reminder`

Admin endpoint:

```json
{
  "eventId": "evt_123"
}
```

or:

```json
{
  "daysAhead": 30
}
```

Recommended event-triggered notifications:

- When event created near user.
- When event updated.
- When event cancelled.
- Before event starts based on RSVP preference.
- When organizer posts photos/report after event.

## Priority 3: Operational / Nice-To-Have APIs

### 27. Share Tracking

`POST /api/events/:id/share`

Purpose: increment share count and generate share URL.

### 28. Report Event

`POST /api/events/:id/report`

Payload:

```json
{
  "reason": "spam",
  "details": "Optional details"
}
```

### 29. Event Photos After Completion

`GET /api/events/:id/photos`

`POST /api/events/:id/photos`

Owner/admin can upload; attendees can view.

### 30. Event Capacity and Waitlist

Add to event:

- `capacity?: number`
- `waitlistEnabled?: boolean`

When RSVP count reaches capacity, new RSVP becomes `waitlisted`.

## Error Contract

Use a consistent error shape:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title must be at least 3 characters.",
    "details": {
      "title": "Title must be at least 3 characters."
    }
  }
}
```

Recommended error codes:

- `UNAUTHENTICATED`
- `FORBIDDEN`
- `EVENT_NOT_FOUND`
- `VALIDATION_ERROR`
- `EVENT_ALREADY_CANCELLED`
- `ALREADY_RSVPED`
- `RSVP_NOT_FOUND`
- `CAPACITY_FULL`
- `INVALID_MEDIA_FILE`
- `FILE_REQUIRED`

## Permissions Matrix

| Operation | Public | Auth user | Owner | Admin |
| --- | --- | --- | --- | --- |
| Discover events | Yes | Yes | Yes | Yes |
| View event detail | Yes | Yes | Yes | Yes |
| Create event | No | Yes | Yes | Yes |
| Edit event | No | No | Yes | Yes |
| Cancel event | No | No | Yes | Yes |
| RSVP | No | Yes | Yes | Yes |
| Cancel own RSVP | No | Yes | Yes | Yes |
| View attendees | No | Limited preview | Full | Full |
| Check in attendee | No | No | Yes | Yes |
| Analytics | No | No | Yes | Yes |
| Reviews | Public read | Create if attended | Yes | Yes |
| Event reminder admin trigger | No | No | No | Yes |

## Backend Build Plan

### Phase 1: Stabilize Core

- Confirm response wrappers for all wired endpoints.
- Add pagination metadata.
- Add `rsvpedByMe`, `owner`, `_count`.
- Ensure `x-user-id` auth is consistent.
- Add robust search/date/radius filtering to `GET /api/events`.
- Add soft cancel status rather than hard delete.

### Phase 2: Replace Static UI Sections

- Build `GET /api/events/home`.
- Build `GET /api/events/nearby`.
- Build `GET /api/events/recommendations`.
- Add bookmark APIs.
- Add richer `GET /api/events/:id` fields: organizer, attendees preview, guidelines, FAQ, similar events, tags.

### Phase 3: Organizer Tools

- Build attendees list and check-in.
- Build analytics.
- Add event reviews.
- Add event photos/report after completion.

### Phase 4: Calendar Product

- Build calendar preferences.
- Build `.ics` export.
- Add reminder scheduling.
- Add community calendars.
- Add optional Google/Outlook sync.

### Phase 5: Creation Enhancements

- Draft events.
- Recurring events.
- Venue search.
- AI title suggestions.

## Senior Review Notes

- Current frontend has strong UI ambition but mixed data maturity. The backend should not only mirror CRUD; it should supply aggregate sections to avoid duplicating business logic in the app.
- `GET /api/events/home` is the highest-leverage endpoint for the Events hub because it replaces many static cards at once.
- Event detail currently renders many sections that need backend ownership: organizer, attendees preview, reviews, FAQ, guidelines, similar events, tags, permissions.
- My Events needs analytics and attendee management before it can feel like a real organizer tool.
- Calendar needs a richer response with summary data; returning a flat list is enough for dots but not enough for monthly overview and type breakdown.
- Bookmark/save event is a visible UI affordance but not currently part of the Events store API. This should be added soon to avoid user confusion.
- Deleting events should be soft cancel, not hard delete, because RSVPs, reminders, audit logs, analytics, and comments need history.
- Every protected endpoint should consistently support `x-user-id` now, but backend should plan a migration to token auth later.
