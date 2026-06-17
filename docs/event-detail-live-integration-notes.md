# Event Detail Live Integration Notes

Status: `app/events/[id].tsx` now renders from live event detail, comments, RSVP, delete, and embedded detail fields. Static demo organizer, attendees, reviews, FAQ, similar events, and tag content were removed.

## Live APIs Used Now

- `GET /api/events/:id`
  - Used for title, banner, date/time, venue/address, organizer/owner, RSVP count, description, guidelines, FAQ, tags, similar events, permission flags, and bookmarked state when present.

- `GET /api/events/:id/comments?limit=20&offset=0`
  - Used for the comments list.

- `POST /api/events/:id/comments`
  - Used by the comment composer.

- `POST /api/events/:id/rsvp`
  - Used by “I’m Attending”.

- `DELETE /api/events/:id/rsvp`
  - Used to cancel attendance.

- `DELETE /api/events/:id`
  - Used by owners/admins to cancel an event when permission flags allow it.

## Backend APIs Already Present But Not Yet Wired In Redux

No new backend API is required for the current detail page. The remaining live features need frontend service/action/reducer/saga/selectors wiring:

- `POST /api/events/:id/bookmark`
- `DELETE /api/events/:id/bookmark`
- `POST /api/events/:id/share`
- `GET /api/events/:id/reviews`
- `POST /api/events/:id/reviews`
- `GET /api/events/:id/attendees`
- `POST /api/events/:id/report`

## Product Notes For Community Pillar

- Community trust should come from real organizer profile, attendee preview, comments, reviews, and RSVP state.
- Avoid showing social proof such as “friends attending”, rating, spots available, or recent join activity unless backend returns those exact values.
- Reviews and attendee management should be the next detail-page integration if this pillar needs stronger community credibility.
