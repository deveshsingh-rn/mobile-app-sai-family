# Event WhatsApp Share Card Contract

## Goal

When a devotee shares an event, WhatsApp should render a rich preview containing
the event banner, title, date, location, and a link that opens the event.

The mobile app now shares this canonical URL:

```text
https://saifamily.sustaininsight.com/events/:eventId
```

The frontend cannot generate WhatsApp's rich card. WhatsApp's crawler fetches
the shared HTTPS URL and builds the preview from server-rendered Open Graph
metadata.

## Required Backend Route

```http
GET /events/:eventId
```

This route must return `text/html`, not JSON and not an authenticated app page.
It should only expose published, public event metadata.

Required metadata:

```html
<title>EVENT_TITLE | Sai Family</title>
<meta name="description" content="EVENT_DESCRIPTION" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="Sai Family" />
<meta property="og:title" content="EVENT_TITLE" />
<meta property="og:description" content="FORMATTED_DATE | VENUE, CITY" />
<meta property="og:url" content="CANONICAL_EVENT_URL" />
<meta property="og:image" content="ABSOLUTE_HTTPS_BANNER_URL" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
```

Use the event banner when available. Otherwise use a permanent Sai Family event
fallback image with a `1200x630` aspect ratio. The image URL must be public HTTPS
and must return an image directly without authentication or redirects.

## Page Behavior

The HTML page should include:

- Event title, date/time, venue, city, and safe description.
- A prominent `Open in Sai Family` link to
  `saifamily://events/:eventId` or the exact Expo Router-compatible deep link.
- A browser fallback explaining that the event is available in Sai Family.
- No attendee names, phone numbers, email addresses, coordinates, or private
  organizer data.

## Public Add-To-Calendar Route

The shared WhatsApp message also contains:

```http
GET /events/:eventId/calendar.ics
```

This endpoint must be public for published events and return a single RFC 5545
calendar event:

```http
Content-Type: text/calendar; charset=utf-8
Content-Disposition: attachment; filename="sai-family-event.ics"
```

Required calendar fields:

```text
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Sai Family//Events//EN
BEGIN:VEVENT
UID:EVENT_ID@saifamily.sustaininsight.com
DTSTAMP:UTC_GENERATED_AT
DTSTART:UTC_EVENT_START
DTEND:UTC_EVENT_END
SUMMARY:EVENT_TITLE
DESCRIPTION:SAFE_EVENT_DESCRIPTION_AND_PUBLIC_URL
LOCATION:VENUE_AND_ADDRESS
URL:CANONICAL_EVENT_URL
END:VEVENT
END:VCALENDAR
```

Escape ICS special characters and fold long lines correctly. Draft, cancelled,
private, deleted, or missing events must not return calendar data. This route is
different from authenticated `GET /api/users/me/calendar.ics`, which exports a
user's complete calendar and must never be shared publicly.

## Performance And Caching

- Return metadata server-side in the first HTML response. Do not rely on client
  JavaScript because WhatsApp crawlers may not execute it.
- Target server response under 300 ms from cache.
- Cache public event metadata with a short TTL and invalidate it after event
  update, cancellation, or banner change.
- Add `Cache-Control: public, max-age=300, stale-while-revalidate=3600`.
- Escape every database value before inserting it into HTML.
- Return a friendly non-indexable page for missing, cancelled, draft, private,
  or deleted events.

## Frontend Environment

```env
EXPO_PUBLIC_EVENT_SHARE_BASE_URL=https://saifamily.sustaininsight.com
```

This value may point to a staging domain in development builds. Public WhatsApp
preview testing requires an internet-reachable HTTPS URL; localhost and LAN IP
addresses will not work.

## Acceptance Test

1. Create an event with a public banner.
2. Open `/events/:eventId` in an incognito browser without authentication.
3. Confirm the response is HTML and contains all required `og:*` tags.
4. Share the URL in a new WhatsApp chat.
5. Confirm banner, title, date/location summary, and domain are visible.
6. Tap the card and confirm the app/event fallback flow works.
7. Tap `Add to your calendar` and confirm one event opens/imports with the
   correct timezone, start/end time, title, and venue.
8. Update the banner/title and confirm the preview refreshes after cache expiry.

Note: WhatsApp caches link previews aggressively. During testing, use a new
event ID or append a temporary version query parameter after backend metadata is
updated.
