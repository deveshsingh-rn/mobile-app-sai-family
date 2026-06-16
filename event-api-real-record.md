# Pillar 2 Events API Implementation Record

Smoke tested against local Docker API on 2026-06-12.

Base URL: `http://localhost:4000`

Auth for protected routes:

```http
x-user-id: <authorId>
```

Known local test user:

```text
authorId=cmq9awrmi000e9m0yrtugdg9u
name=Ananya Sharma
```

## Frontend Payload Decision

Phase 1 frontend flow:

1. Upload media first with `POST /api/media/upload` as `multipart/form-data`.
2. Store returned `url` as `bannerUrl`.
3. Create/update events and drafts with JSON metadata.

Backend also supports multipart on create/update for later, but the current frontend should use JSON + `bannerUrl`.

## Endpoint Record

| Endpoint | Auth | Payload | Smoke Status | Response Wrapper |
| --- | --- | --- | --- | --- |
| `GET /health` | No | none | `200` | `{ status, service, timestamp }` |
| `GET /health/db` | No | none | `200` | `{ status, database, timestamp }` |
| `GET /api/events` | Optional | query | `200` | `{ events, pagination }` |
| `GET /api/events/:id` | Optional | none | `200` | `{ event }` |
| `POST /api/events` | Yes | JSON with `bannerUrl` | `201` | `{ event }` |
| `PATCH /api/events/:id` | Yes | JSON partial | `200` | `{ event }` |
| `DELETE /api/events/:id` | Yes | none | `200` | `{ success, id, status }` |
| `GET /api/events/home` | Optional | query | `200` | `{ sections, trendingSections, eventTypeGuide, trendingThisWeek, topOrganisers, weeklySchedule, stats }` |
| `GET /api/events/nearby` | Optional | query | `200` | `{ events, center, radiusKm }` |
| `GET /api/events/recommendations` | Optional | query | `200` | `{ events, basis }` |
| `GET /api/events/calendar` | Optional | `month=YYYY-MM` | `200` | `{ days, summary }` |
| `POST /api/events/:id/rsvp` | Yes | JSON | `200` | `{ event, rsvp }` |
| `DELETE /api/events/:id/rsvp` | Yes | none | `200` | `{ event, eventId, rsvped, _count }` |
| `GET /api/users/me/rsvps` | Yes | query | `200` | `{ events, pagination }` |
| `GET /api/users/me/events` | Yes | query | `200` | `{ events, pagination }` |
| `POST /api/events/:id/bookmark` | Yes | none | `200` | `{ event, eventId, bookmarked, _count }` |
| `DELETE /api/events/:id/bookmark` | Yes | none | `200` | `{ event, eventId, bookmarked, _count }` |
| `GET /api/users/me/event-bookmarks` | Yes | query | `200` | `{ bookmarks, events, pagination }` |
| `GET /api/events/:id/attendees` | Yes | query | `200` | `{ attendees, pagination }` |
| `POST /api/events/:id/check-in` | Yes | JSON | `200` | `{ rsvp, _count }` |
| `GET /api/events/:id/analytics` | Yes | none | `200` | `{ event, analytics }` |
| `POST /api/events/:id/share` | Optional | JSON | `200` | `{ eventId, shares, shared }` |
| `GET /api/events/:id/comments` | Optional | query | `200` | `{ comments, pagination }` |
| `POST /api/events/:id/comments` | Yes | JSON | `201` | `{ eventId, comment, _count }` |
| `GET /api/events/:id/reviews` | Optional | query | `200` | `{ reviews, summary, pagination }` |
| `POST /api/events/:id/reviews` | Yes | JSON | guarded | `{ review, summary }` or `{ error }` |
| `GET /api/events/:id/photos` | Optional | query | `200` | `{ photos, pagination }` |
| `POST /api/events/:id/photos` | Yes | multipart | guarded | `{ photos, _count }` or `{ error }` |
| `POST /api/events/:id/report` | Yes | JSON | guarded | `{ report }` or `{ error }` |
| `POST /api/media/upload` | Yes | multipart | not re-uploaded in smoke | `{ media, url }` |
| `GET /api/places/search` | No | query | `200` | `{ places }` |
| `POST /api/events/suggestions/title` | No | JSON | `200` | `{ suggestions }` |
| `POST /api/events/drafts` | Yes | JSON with `bannerUrl` | `201` | `{ draft }` |
| `PATCH /api/events/drafts/:id` | Yes | JSON partial | `200` | `{ draft }` |
| `POST /api/events/drafts/:id/publish` | Yes | none | `201` | `{ draft, event, events, series }` |
| `GET /api/users/me/calendar/preferences` | Yes | none | `200` | `{ preference }` |
| `PATCH /api/users/me/calendar/preferences` | Yes | JSON | `200` | `{ preference }` |
| `GET /api/users/me/calendar.ics` | Yes | none | `200` | `text/calendar` |
| `GET /api/community-calendars` | Optional | query | `200` | `{ calendars }` |
| `POST /api/community-calendars/:id/subscribe` | Yes | none | `201` | `{ calendar, subscription }` |
| `DELETE /api/community-calendars/:id/subscribe` | Yes | none | `200` | `{ calendar }` |

## Core Event Payloads

Create event:

```http
POST /api/events
Content-Type: application/json
x-user-id: cmq9awrmi000e9m0yrtugdg9u
```

```json
{
  "title": "Thursday Sai Bhajan",
  "description": "Weekly satsang and aarti for all devotees.",
  "type": "bhajan",
  "startAt": "2026-07-10T13:30:00.000Z",
  "endAt": "2026-07-10T15:00:00.000Z",
  "timezone": "Asia/Kolkata",
  "venueName": "Sai Mandir Hall",
  "address": "MG Road, Pune, Maharashtra",
  "city": "Pune",
  "state": "Maharashtra",
  "country": "India",
  "latitude": 18.5204,
  "longitude": 73.8567,
  "bannerUrl": "https://example.com/event-banner.jpg",
  "guidelines": ["Arrive 10 minutes early"],
  "faq": [{ "question": "Can families attend?", "answer": "Yes." }],
  "tags": ["thursday", "bhajan"]
}
```

Actual response shape:

```json
{
  "event": {
    "id": "cm...",
    "title": "Thursday Sai Bhajan",
    "description": "Weekly satsang and aarti for all devotees.",
    "type": "bhajan",
    "bannerUrl": "https://example.com/event-banner.jpg",
    "startAt": "2026-07-10T13:30:00.000Z",
    "endAt": "2026-07-10T15:00:00.000Z",
    "timezone": "Asia/Kolkata",
    "venueName": "Sai Mandir Hall",
    "address": "MG Road, Pune, Maharashtra",
    "city": "Pune",
    "state": "Maharashtra",
    "country": "India",
    "latitude": 18.5204,
    "longitude": 73.8567,
    "status": "published",
    "authorId": "cm...",
    "author": {
      "id": "cm...",
      "name": "Ananya Sharma",
      "handle": "ananya_sharma_9",
      "profileImageUrl": "https://..."
    },
    "_count": {
      "rsvps": 0,
      "comments": 0,
      "bookmarks": 0,
      "views": 0,
      "shares": 0,
      "reviews": 0,
      "photos": 0,
      "reports": 0
    },
    "rsvpedByMe": false
  }
}
```

Update event:

```json
{
  "title": "Updated Thursday Sai Bhajan",
  "bannerUrl": "https://example.com/event-banner-updated.jpg"
}
```

Cancel event response:

```json
{
  "success": true,
  "id": "cm...",
  "status": "cancelled"
}
```

## Feed And Detail Responses

List query:

```http
GET /api/events?limit=20&offset=0&q=Sai&type=bhajan&lat=18.5204&lng=73.8567&radius=25&sort=soonest
```

Response:

```json
{
  "events": [
    {
      "id": "cm...",
      "title": "Thursday Sai Bhajan",
      "type": "bhajan",
      "bannerUrl": "https://...",
      "startAt": "2026-07-10T13:30:00.000Z",
      "ownerId": "cm...",
      "ownerName": "Ananya Sharma",
      "ownerProfileImageUrl": "https://...",
      "owner": { "id": "cm...", "name": "Ananya Sharma", "handle": "ananya_sharma_9" },
      "_count": { "rsvps": 0, "comments": 0, "bookmarks": 0 },
      "rsvpedByMe": false,
      "bookmarkedByMe": false,
      "isOwner": true,
      "distanceKm": 0
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "page": 1,
    "total": 1,
    "totalPages": 1,
    "hasMore": false,
    "nextOffset": null
  }
}
```

Detail response includes the list fields plus:

```json
{
  "event": {
    "media": [
      {
        "id": "cm...:banner",
        "type": "image",
        "url": "https://example.com/event-banner.jpg",
        "thumbnailUrl": "https://example.com/event-banner.jpg"
      }
    ],
    "permissions": {
      "canEdit": true,
      "canDelete": true,
      "canManageAttendees": true
    },
    "organizer": {
      "id": "cm...",
      "name": "Ananya Sharma",
      "eventsOrganized": 5
    },
    "attendeesPreview": [],
    "guidelines": [],
    "faq": [],
    "tags": [],
    "similarEvents": []
  }
}
```

## Events Home

```http
GET /api/events/home?limit=5
```

Response shape:

```json
{
  "sections": {
    "happeningToday": { "count": 0, "events": [] },
    "thisWeek": { "count": 4, "events": [] },
    "thisMonth": { "count": 8, "events": [] },
    "comingSoon": { "count": 3, "events": [] }
  },
  "trendingSections": {
    "today": [],
    "thisWeek": [],
    "thisMonth": [],
    "comingSoon": []
  },
  "eventTypeGuide": [],
  "trendingThisWeek": [],
  "topOrganisers": [],
  "weeklySchedule": [],
  "stats": {
    "eventsAttended": 0,
    "savedEvents": 0,
    "sevaHours": 0
  }
}
```

## RSVP And Interaction Payloads

Use `status: "going"` for normal attendance. This value is important because reviews require an RSVP with status `going`.

```http
POST /api/events/:id/rsvp
Content-Type: application/json
x-user-id: cmq9awrmi000e9m0yrtugdg9u
```

```json
{
  "status": "going",
  "guestCount": 2,
  "reminderMinutesBefore": 60
}
```

Response shape:

```json
{
  "event": {
    "id": "cm...",
    "rsvps": 1,
    "rsvpedByMe": true
  },
  "rsvp": {
    "id": "cm...",
    "eventId": "cm...",
    "userId": "cm...",
    "status": "going",
    "guestCount": 2,
    "reminderMinutesBefore": 60,
    "checkedInAt": null
  }
}
```

Cancel RSVP:

```json
{
  "event": { "id": "cm...", "rsvps": 0, "rsvpedByMe": false },
  "eventId": "cm...",
  "rsvped": false,
  "_count": { "rsvps": 0 }
}
```

Bookmark response:

```json
{
  "event": { "id": "cm...", "bookmarks": 1, "bookmarkedByMe": true },
  "eventId": "cm...",
  "bookmarked": true,
  "_count": { "bookmarks": 1 }
}
```

Share response:

```json
{
  "eventId": "cm...",
  "shares": 1,
  "shared": true
}
```

## Comments, Reviews, Photos, Reports

Create comment:

```json
{
  "content": "Is parking available near the venue?"
}
```

Response:

```json
{
  "eventId": "cm...",
  "comment": {
    "id": "cm...",
    "eventId": "cm...",
    "userId": "cm...",
    "content": "Is parking available near the venue?",
    "user": {
      "id": "cm...",
      "name": "Ananya Sharma",
      "handle": "ananya_sharma_9",
      "profileImageUrl": "https://..."
    }
  },
  "_count": { "comments": 1 }
}
```

Create review:

```json
{
  "rating": 5,
  "content": "Peaceful and well organized gathering."
}
```

Guard response observed when RSVP condition is not satisfied:

```json
{
  "error": {
    "code": "EVENT_REVIEW_NOT_ALLOWED",
    "message": "Only devotees who RSVP to the event can review it"
  }
}
```

Create event photos:

```http
POST /api/events/:id/photos
Content-Type: multipart/form-data
file keys: photo, photos, file, files
```

List photos response:

```json
{
  "photos": [],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 0,
    "nextOffset": null
  }
}
```

Report response is guarded until event completion. Observed response for a future event:

```json
{
  "error": {
    "code": "EVENT_NOT_COMPLETED",
    "message": "This action is available after the event is completed"
  }
}
```

## Draft And Recurring Event Payloads

Create draft:

```json
{
  "title": "Weekly Sai Bhajan Draft",
  "description": "Draft for weekly bhajan gathering.",
  "type": "bhajan",
  "startAt": "2026-07-15T13:30:00.000Z",
  "endAt": "2026-07-15T15:00:00.000Z",
  "timezone": "Asia/Kolkata",
  "venueName": "Sai Mandir Hall",
  "address": "MG Road, Pune, Maharashtra",
  "city": "Pune",
  "state": "Maharashtra",
  "country": "India",
  "latitude": 18.5204,
  "longitude": 73.8567,
  "bannerUrl": "https://example.com/draft-banner.jpg",
  "recurrence": {
    "frequency": "weekly",
    "interval": 1,
    "count": 2
  }
}
```

Draft response:

```json
{
  "draft": {
    "id": "cm...",
    "authorId": "cm...",
    "title": "Weekly Sai Bhajan Draft",
    "type": "bhajan",
    "bannerUrl": "https://example.com/draft-banner.jpg",
    "publishedAt": null,
    "recurrence": {
      "frequency": "weekly",
      "interval": 1,
      "count": 2
    }
  }
}
```

Publish recurring draft response:

```json
{
  "draft": { "id": "cm...", "publishedAt": "2026-06-12T07:46:03.038Z" },
  "event": {
    "id": "cm...",
    "seriesId": "cm...",
    "occurrenceIndex": 1,
    "status": "published"
  },
  "events": [],
  "series": {
    "id": "cm...",
    "frequency": "weekly",
    "interval": 1,
    "count": 2,
    "timezone": "Asia/Kolkata"
  }
}
```

## Calendar Product

Calendar month:

```http
GET /api/events/calendar?month=2026-07
```

Response:

```json
{
  "days": [
    {
      "date": "2026-07-10",
      "events": [],
      "dots": []
    }
  ],
  "summary": {
    "total": 0,
    "attending": 0,
    "byType": {}
  }
}
```

Preferences update:

```json
{
  "defaultReminderMinutes": 60,
  "includeRsvpedEvents": true,
  "includeCreatedEvents": true,
  "timezone": "Asia/Kolkata"
}
```

Actual response uses stored preference field names:

```json
{
  "preference": {
    "id": "cm...",
    "userId": "cm...",
    "defaultReminderMinutes": 60,
    "showRsvpedEvents": true,
    "showCreatedEvents": true,
    "showBookmarkedEvents": true,
    "weekStartsOn": 1,
    "timezone": "Asia/Kolkata"
  }
}
```

Community calendars:

```json
{
  "calendars": [
    {
      "id": "community_calendar_bhajan_pune",
      "slug": "pune-bhajan-calendar",
      "title": "Pune Bhajan Calendar",
      "description": "Bhajan and satsang gatherings around Pune.",
      "type": "bhajan",
      "city": "Pune",
      "state": "Maharashtra",
      "country": "India",
      "subscribers": 0,
      "subscribedByMe": false
    }
  ]
}
```

## Media Upload

Event banner upload:

```http
POST /api/media/upload
Content-Type: multipart/form-data
x-user-id: cmq9awrmi000e9m0yrtugdg9u
file key: file
```

Response shape:

```json
{
  "media": [
    {
      "type": "image",
      "url": "https://...",
      "contentType": "image/png",
      "mimeType": "image/png",
      "thumbnailUrl": "https://...",
      "assetType": "event_media"
    }
  ],
  "url": "https://..."
}
```

Postman saves `url` as `{{uploadedMediaUrl}}`, then event create/update sends that value as `bannerUrl`.

## Places And Suggestions

Place search:

```http
GET /api/places/search?q=Sai&city=Pune&limit=3
```

Response:

```json
{
  "places": [
    {
      "id": "place_sai_mandir_pune",
      "name": "Sai Mandir Hall",
      "address": "MG Road, Pune, Maharashtra",
      "city": "Pune",
      "state": "Maharashtra",
      "country": "India",
      "latitude": 18.5204,
      "longitude": 73.8567,
      "source": "local"
    }
  ]
}
```

Title suggestions:

```json
{
  "type": "bhajan",
  "city": "Pune",
  "venueName": "Sai Mandir Hall"
}
```

Response:

```json
{
  "suggestions": [
    { "id": "suggestion_1", "title": "Sai Mandir Hall Bhajan Gathering" },
    { "id": "suggestion_2", "title": "Evening Bhajan with Sai Family" }
  ]
}
```

## Frontend Notes

- Use `status: "going"` for RSVP, not `"attending"`.
- `GET /api/users/me/rsvps` currently returns `events[]`; the review TODO notes that `rsvps[]` is still a contract polish item.
- `POST /api/events/:id/report` and `POST /api/events/:id/photos` are post-event surfaces and may return guards before completion.
- `POST /api/events/:id/reviews` requires an RSVP with status `going`.
- Use `bannerUrl` in JSON create/update payloads. Only direct file upload endpoints use `multipart/form-data`.
