# Event Detail Live Integration Notes

Status: `app/events/[id].tsx` now renders from live event detail, comments, RSVP, delete, bookmark, share tracking, reviews, review submit, attendees, organizer check-in, report, and embedded detail fields. Static demo organizer, attendees, reviews, FAQ, similar events, and tag content were removed.

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

- `POST /api/events/:id/bookmark`
  - Used by the bookmark button.

- `DELETE /api/events/:id/bookmark`
  - Used by the bookmark button when the event is already saved.

- `GET /api/events/:id/reviews`
  - Used for live event reviews.

- `POST /api/events/:id/reviews`
  - Used by the review composer. Backend requires an RSVP with `status: "going"`.

- `GET /api/events/:id/attendees`
  - Used for owner/admin attendee visibility when permission flags allow it.

- `POST /api/events/:id/check-in`
  - Used by owner/admin attendee check-in controls.

- `POST /api/events/:id/share`
  - Used after the native share sheet completes.

- `POST /api/events/:id/report`
  - Used by owner/admin report action.

## Backend APIs Already Present But Not Yet Wired In Redux

All known event detail APIs from the current collection are now wired for the detail page.

## Backend APIs To Confirm For Next Pass

- Public attendee preview shape, if non-owner users should see more than aggregate RSVP count.
- Review eligibility copy, if backend allows only RSVP users or only checked-in/attended users.
- Attendee management drill-in screen, if organizers need search, filters, and bulk check-in beyond the compact detail-page list.

## Product Notes For Community Pillar

- Community trust should come from real organizer profile, attendee preview, comments, reviews, and RSVP state.
- Avoid showing social proof such as “friends attending”, rating, spots available, or recent join activity unless backend returns those exact values.
- A dedicated attendee management screen should be the next product layer if organizers need more than compact check-in from the detail page.
