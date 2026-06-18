# Event Pillar API Integration Implementation Plan

Source API collection: `postman-api-collection.json`
Frontend entry routes: `app/events/*` and `app/(tabs)/events.tsx`
Redux module: `store/events/*`
Service module: `services/events.ts`

## Goal

Replace hardcoded/static Event pillar data with backend API data without breaking the existing UI.

The Events UI is already rich and mostly complete. The implementation should therefore be a staged data-integration pass, not a visual rewrite. Keep the current screens stable, add API-backed slices behind them, and only remove fallback data after each screen has loading, error, empty, and success states working.

## Current Architecture

Current module structure is already correct:

```txt
services/events.ts
store/events/types.ts
store/events/actions.ts
store/events/reducer.ts
store/events/saga.ts
store/events/selectors.ts
store/events/validation.ts
store/events/index.ts

app/(tabs)/events.tsx
app/events/[id].tsx
app/events/create.tsx
app/events/edit.tsx
app/events/calendar.tsx
app/events/my-events.tsx
app/events/rsvps.tsx
screens/event-form-screen.tsx
screens/event-list-screen.tsx
```

Current backend integration already exists for:

- `GET /api/events`
- `GET /api/events/:id`
- `POST /api/events`
- `PATCH /api/events/:id`
- `DELETE /api/events/:id`
- `POST /api/events/:id/rsvp`
- `DELETE /api/events/:id/rsvp`
- `GET /api/users/me/rsvps`
- `GET /api/users/me/events`
- `GET /api/events/calendar?month=YYYY-MM`
- `GET /api/events/:id/comments`
- `POST /api/events/:id/comments`
- `POST /api/media/upload`

Current API client already injects `x-user-id` from SecureStore in `services/api.ts`, so protected endpoints should work if the user has a saved devotee account.

## Important Payload Decision

The Postman collection now confirms the current Phase 1 frontend flow:

1. Upload banner media through `POST /api/media/upload`.
2. Use the returned `url` as `bannerUrl`.
3. Create/update event with JSON payload.

Recommended frontend strategy:

- Phase 1: keep the current upload-then-JSON flow.
- Phase 2: add optional direct multipart create/update only if product decides to reduce upload + submit from two requests to one request.
- Service layer should keep JSON create/update as the primary contract:
  - `apiCreateEvent(payload)`
  - `apiUpdateEvent(id, payload)`
  - `apiUploadEventMedia(file)`

Do not mix upload or payload mapping logic into screens. Keep upload handling and event payload mapping in `services/events.ts`, sagas, or event-module helpers.

## Target Events State Shape

Extend `EventsState` from a CRUD-only state to a screen-oriented state while preserving existing fields.

```ts
type EventsState = {
  // Existing
  addingComment: boolean;
  calendar: SaiEvent[];
  comments: EventComment[];
  commentsError: string | null;
  commentsLoading: boolean;
  creating: boolean;
  detail: SaiEventDetail | null;
  error: string | null;
  feed: SaiEvent[];
  loading: boolean;
  myEvents: SaiEvent[];
  myRsvps: SaiEvent[];
  rsvpPendingIds: Record<string, boolean>;
  uploadedMedia: UploadEventMediaResult | null;
  uploadingMedia: boolean;

  // Additions
  home: EventHomeResponse | null;
  homeLoading: boolean;
  homeError: string | null;

  nearby: NearbyEventsResponse | null;
  nearbyLoading: boolean;
  nearbyError: string | null;

  recommendations: RecommendedEvent[];
  recommendationsLoading: boolean;
  recommendationsError: string | null;

  bookmarks: SaiEvent[];
  bookmarksLoading: boolean;
  bookmarksError: string | null;
  bookmarkPendingIds: Record<string, boolean>;

  attendeesByEventId: Record<string, EventAttendeesResponse>;
  attendeesLoadingIds: Record<string, boolean>;

  analyticsByEventId: Record<string, EventAnalytics>;
  analyticsLoadingIds: Record<string, boolean>;

  reviewsByEventId: Record<string, EventReview[]>;
  reviewsLoadingIds: Record<string, boolean>;
  addingReview: boolean;

  photosByEventId: Record<string, EventPhoto[]>;
  photosLoadingIds: Record<string, boolean>;
  uploadingPhotos: boolean;

  drafts: EventDraft[];
  draftSaving: boolean;
  publishingDraft: boolean;

  titleSuggestions: string[];
  titleSuggestionsLoading: boolean;

  places: EventPlace[];
  placesLoading: boolean;

  calendarPreferences: CalendarPreferences | null;
  calendarPreferencesLoading: boolean;

  communityCalendars: CommunityCalendar[];
  communityCalendarsLoading: boolean;
  communityCalendarPendingIds: Record<string, boolean>;
};
```

## Target Type Additions

Add these in `store/events/types.ts`.

```ts
export type EventStatus =
  | "draft"
  | "published"
  | "live"
  | "completed"
  | "cancelled";

export type EventPermission = {
  canEdit: boolean;
  canDelete: boolean;
  canManageAttendees: boolean;
};

export type EventOrganizer = {
  id: string;
  name: string;
  profileImageUrl?: string | null;
  bio?: string | null;
  eventsOrganized?: number;
  rating?: number;
  phone?: string | null;
};

export type SaiEventDetail = SaiEvent & {
  status?: EventStatus;
  capacity?: number | null;
  views?: number;
  shares?: number;
  bookmarks?: number;
  checkIns?: number;
  rating?: number;
  reviews?: number;
  permissions?: EventPermission;
  organizer?: EventOrganizer;
  attendeesPreview?: EventAttendeeUser[];
  media?: EventMedia[];
  guidelines?: string[];
  faq?: EventFaq[];
  tags?: string[];
  similarEvents?: SaiEvent[];
  bookmarkedByMe?: boolean;
};

export type EventHomeResponse = {
  sections: {
    happeningToday: EventSection;
    thisWeek: EventSection;
    thisMonth: EventSection;
    comingSoon: EventSection;
  };
  eventTypeGuide: EventTypeGuideItem[];
  activeCommittees: ActiveCommittee[];
  trendingThisWeek: TrendingEvent[];
  topOrganisers: EventOrganizer[];
  weeklySchedule: WeeklyScheduleItem[];
  communityStories: CommunityStory[];
  stats: {
    eventsAttended: number;
    savedEvents: number;
    sevaHours: number;
  };
};
```

Keep backend response types separate from UI types if needed. Use mapper functions in the saga/service layer to normalize.

## Service Architecture

Keep `services/events.ts` as the only file that knows URL paths.

Add service functions in groups:

```ts
// Discovery/home
apiFetchEventHome(params)
apiFetchNearbyEvents(params)
apiFetchRecommendedEvents(params)

// Bookmark
apiBookmarkEvent(id)
apiUnbookmarkEvent(id)
apiFetchEventBookmarks(params)

// Organizer
apiFetchEventAttendees(id, params)
apiCheckInEventAttendee(id, payload)
apiFetchEventAnalytics(id)
apiCreateEventReport(id, payload)

// Reviews/photos
apiFetchEventReviews(id, params)
apiCreateEventReview(id, payload)
apiFetchEventPhotos(id, params)
apiUploadEventPhotos(id, formData)

// Drafts/create helpers
apiCreateEventDraft(formData)
apiUpdateEventDraft(id, formData)
apiPublishEventDraft(id)
apiFetchTitleSuggestions(payload)
apiSearchPlaces(params)

// Calendar product
apiFetchCalendarPreferences()
apiUpdateCalendarPreferences(payload)
apiFetchCommunityCalendars()
apiSubscribeCommunityCalendar(id)
apiUnsubscribeCommunityCalendar(id)
apiFetchCalendarIcs()
```

## Postman API Mapping

The collection exposes these Events endpoints:

### Discovery and home

- `GET /api/events?page=1&limit=20&type=bhajan`
- `GET /api/events/home?limit=5`
- `GET /api/events/nearby?lat=18.5204&lng=73.8567&radius=25&limit=20`
- `GET /api/events/recommendations?limit=10`

### Creation helpers

- `POST /api/events/suggestions/title`
- `GET /api/places/search?q=Sai&city=Pune&limit=10`
- `POST /api/events/drafts`
- `PATCH /api/events/drafts/:id`
- `POST /api/events/drafts/:id/publish`

### Core event lifecycle

- `POST /api/events`
- `GET /api/events/:id`
- `PATCH /api/events/:id`
- `DELETE /api/events/:id`

### Social and engagement

- `POST /api/events/:id/bookmark`
- `DELETE /api/events/:id/bookmark`
- `POST /api/events/:id/rsvp`
- `DELETE /api/events/:id/rsvp`
- `POST /api/events/:id/share`
- `GET /api/users/me/event-bookmarks`
- `GET /api/users/me/rsvps`
- `GET /api/users/me/events`

### Detail extensions

- `GET /api/events/:id/reviews`
- `POST /api/events/:id/reviews`
- `GET /api/events/:id/photos`
- `POST /api/events/:id/photos`
- `GET /api/events/:id/comments`
- `POST /api/events/:id/comments`

### Organizer tools

- `GET /api/events/:id/attendees`
- `GET /api/events/:id/analytics`
- `POST /api/events/:id/check-in`
- `POST /api/events/:id/report`

### Calendar

- `GET /api/events/calendar?month=YYYY-MM`
- `GET /api/users/me/calendar/preferences`
- `PATCH /api/users/me/calendar/preferences`
- `GET /api/users/me/calendar.ics`
- `GET /api/community-calendars`
- `POST /api/community-calendars/:id/subscribe`
- `DELETE /api/community-calendars/:id/subscribe`

### Media and notifications

- `POST /api/media/upload`
- `POST /api/notifications/event-reminder`

## Screen-to-API Mapping

### `app/(tabs)/events.tsx`

Current hardcoded/static areas to replace:

- Happening Today, This Week, This Month, Coming Soon
- Event Type Guide
- Active Committees
- Trending This Week
- Top Event Organisers
- Weekly Schedule
- Community Stories
- Nearby Events
- Map Markers
- Stats cards

API plan:

- Use `GET /api/events/home` for aggregate sections.
- Use `GET /api/events/nearby` for map/list nearby section.
- Keep `GET /api/events` for feed/filter pagination.

Redux additions:

- `fetchEventHomeRequest`
- `fetchNearbyEventsRequest`
- selectors:
  - `selectEventHome`
  - `selectEventHomeLoading`
  - `selectNearbyEvents`
  - `selectNearbyEventsLoading`

Safe UI approach:

- Render API data when available.
- Fall back to existing static data when API returns empty or fails.
- Show small inline error only for failed sections; do not blank the whole Events hub.

### `app/events/[id].tsx`

Current hardcoded/static areas to replace:

- Organizer section
- Attendees preview
- Guidelines
- Reviews
- FAQ
- Similar events
- Tags
- Share/report tracking
- Bookmark action

API plan:

- Extend `GET /api/events/:id` to consume detail extension fields if backend returns them.
- Use `GET /api/events/:id/reviews` for reviews section.
- Use `GET /api/events/:id/photos` for gallery/photos.
- Use `POST /api/events/:id/bookmark` and `DELETE /api/events/:id/bookmark`.
- Use `POST /api/events/:id/share` when user presses share.
- Use `POST /api/events/:id/report` for report flow.

Redux additions:

- `fetchEventReviewsRequest`
- `addEventReviewRequest`
- `fetchEventPhotosRequest`
- `bookmarkEventRequest`
- `unbookmarkEventRequest`
- `shareEventRequest`
- `reportEventRequest`

Safe UI approach:

- Existing detail API remains source of truth.
- Optional fields should be guarded.
- Sections should render only when data exists, or use current placeholders until each endpoint is wired.

### `screens/event-form-screen.tsx`

Current hardcoded/static areas:

- AI title suggestions.
- Recurring event CTA.
- Draft save text.
- Place search UX.

API plan:

- `POST /api/events/suggestions/title` for suggestions.
- `GET /api/places/search` for venue search.
- `POST /api/events/drafts`, `PATCH /api/events/drafts/:id`, `POST /api/events/drafts/:id/publish`.
- Keep current `POST /api/media/upload` + `bannerUrl` JSON create/update.
- Add direct multipart create/update later only if product chooses a one-request upload flow.

Redux additions:

- `fetchEventTitleSuggestionsRequest`
- `searchEventPlacesRequest`
- `createEventDraftRequest`
- `updateEventDraftRequest`
- `publishEventDraftRequest`

Safe UI approach:

- Do not block create event if suggestions/place APIs fail.
- Draft saving should be best-effort and silent after first success.
- Keep frontend validation before API submit.

### `app/events/calendar.tsx`

Current hardcoded/static areas:

- Selected date fallback events.
- Upcoming this week fallback.
- Monthly overview totals.
- Event type breakdown.
- Recommendations.
- My calendar events.
- Calendar sync cards.
- Community calendars.
- Notification preferences.

API plan:

- `GET /api/events/calendar?month=YYYY-MM`
- `GET /api/events/recommendations`
- `GET /api/users/me/rsvps`
- `GET /api/users/me/calendar/preferences`
- `PATCH /api/users/me/calendar/preferences`
- `GET /api/community-calendars`
- subscribe/unsubscribe endpoints.
- `GET /api/users/me/calendar.ics` for export.

Redux additions:

- `fetchCalendarPreferencesRequest`
- `updateCalendarPreferencesRequest`
- `fetchCommunityCalendarsRequest`
- `subscribeCommunityCalendarRequest`
- `unsubscribeCommunityCalendarRequest`
- `exportCalendarRequest` or direct Linking download helper.

Safe UI approach:

- Calendar grid can continue from flat `calendar` events.
- Monthly overview should prefer backend summary if present; otherwise compute client-side from events.
- Sync buttons should show "coming soon" unless OAuth endpoints are fully implemented.

### `app/events/my-events.tsx`

Current hardcoded/static areas:

- Posted event stats.
- Analytics labels.
- Manage attendees.
- Check-in counts.
- Rating/report/photos.

API plan:

- `GET /api/users/me/rsvps`
- `GET /api/users/me/events`
- `GET /api/events/:id/analytics`
- `GET /api/events/:id/attendees`
- `POST /api/events/:id/check-in`
- `POST /api/events/:id/report`
- `GET /api/events/:id/photos`
- `POST /api/events/:id/photos`

Redux additions:

- `fetchEventAnalyticsRequest`
- `fetchEventAttendeesRequest`
- `checkInEventAttendeeRequest`
- `createEventReportRequest`
- `uploadEventPhotosRequest`

Safe UI approach:

- Initial My Events list can remain API-backed with simple counts.
- Add drill-in/management flows after analytics/attendee endpoints are wired.

### `app/events/rsvps.tsx`

Uses `EventListScreen` with `mode="rsvps"`.

API plan:

- Continue using `GET /api/users/me/rsvps`.
- Add pagination/hasMore support later.
- Add cancel RSVP from row later if needed.

## Action Naming Plan

Use the existing action pattern:

```ts
FETCH_EVENT_HOME_REQUEST
FETCH_EVENT_HOME_SUCCESS
FETCH_EVENT_HOME_FAILURE
```

Recommended action groups:

```txt
FETCH_HOME
FETCH_NEARBY
FETCH_RECOMMENDATIONS
BOOKMARK
UNBOOKMARK
FETCH_BOOKMARKS
FETCH_REVIEWS
ADD_REVIEW
FETCH_PHOTOS
UPLOAD_PHOTOS
FETCH_ATTENDEES
CHECK_IN
FETCH_ANALYTICS
REPORT_EVENT
SHARE_EVENT
CREATE_DRAFT
UPDATE_DRAFT
PUBLISH_DRAFT
FETCH_TITLE_SUGGESTIONS
SEARCH_PLACES
FETCH_CALENDAR_PREFERENCES
UPDATE_CALENDAR_PREFERENCES
FETCH_COMMUNITY_CALENDARS
SUBSCRIBE_COMMUNITY_CALENDAR
UNSUBSCRIBE_COMMUNITY_CALENDAR
```

Avoid one global `loading` for all new endpoints. Use endpoint-specific loading flags so Events hub, calendar, and detail screens do not flicker each other.

## Response Normalization Rules

Keep saga mappers tolerant because backend response wrappers can vary.

Existing helper style should continue:

- `getEventFromResponse(response)`
- `getEventsFromResponse(response)`
- `getCommentsFromResponse(response)`
- `getUploadResult(response)`

Add new helpers:

```ts
normalizeEventDetail(response)
normalizeEventHome(response)
normalizeNearbyEvents(response)
normalizeRecommendation(response)
normalizeBookmarkResponse(response)
normalizeAttendees(response)
normalizeAnalytics(response)
normalizeReviews(response)
normalizePhotos(response)
normalizeCalendarPreferences(response)
normalizeCommunityCalendars(response)
```

Mappers should convert backend fields into UI-safe defaults:

- Missing arrays become `[]`.
- Missing counts become `0`.
- Missing booleans become `false`.
- Missing nested owner/organizer stays `null`.
- Missing optional sections should not crash UI.

## Validation Plan

Keep existing frontend validation in `store/events/validation.ts`.

Add validation for:

- Review rating `1..5`.
- Review content optional but max 1000.
- RSVP guest count `0..20`.
- Reminder minutes: `0`, `15`, `30`, `60`, `1440`.
- Draft publish should reuse full create validation.
- Recurrence:
  - frequency enum: `daily`, `weekly`, `monthly`
  - interval min `1`
  - until date after start date
- Report reason required.
- Share channel enum: `whatsapp`, `copy`, `system`, `facebook`, `other`.

## Implementation Phases

### Phase 0: Contract Audit

Status: Complete

Source of truth: `event-api-real-record.md`

Todo:

- [x] Confirm backend base URL in `app.json` / env.
- [x] Confirm `x-user-id` is attached for protected event endpoints.
- [x] Test every Events API in `postman-api-collection.json`.
- [x] Record actual response shapes for each endpoint.
- [x] Compare real response against frontend types in `store/events/types.ts`.
- [x] Decide create/update will stay JSON with `bannerUrl` after the media-upload step.

Done when:

- We have one sample success and one sample error response per endpoint group.
- `docs/event-pillar-phase-0-contract-audit.md` lists the frontend type gaps before Phase 1 code starts.

### Phase 1: Stabilize Core Existing Integration

Status: In progress

Smoke test checklist: `docs/event-pillar-phase-1-smoke-test.md`

Todo:

- [x] Update `services/events.ts` with typed params for existing endpoints.
- [x] Strengthen `SaiEvent` type with `status`, `bookmarkedByMe`, `views`, `shares`, `checkIns`, `rating`, `reviews`, rich counts, permissions, organizer, media, tags, FAQ, and related detail fields.
- [x] Ensure `GET /api/events` supports `q`, `dateFrom`, `dateTo`, `sort`, `lat`, `lng`, `radius`.
- [x] Add pagination metadata to store for feed, RSVPs, my events, comments.
- [x] Update reducer to append on pagination instead of replacing when offset > 0.
- [x] Preserve calendar `{ days, summary }` metadata while keeping existing flat calendar event selector.
- [x] Improve saga mappers for real backend wrappers: `{ events, pagination }`, `{ comments, pagination }`, `{ days, summary }`, `{ media, url }`, and `{ event, rsvp }`.
- [ ] Keep all existing UI fallback data until API coverage is verified.
- [ ] Run the device/manual smoke test in `docs/event-pillar-phase-1-smoke-test.md`.

Done when:

- Current Event CRUD, RSVP, comments, calendar, My Events, and RSVPs still work with no UI regressions.

### Phase 2: Events Hub API Replacement

Status: In progress

Todo:

- [x] Add `EventHomeResponse` and related types.
- [x] Add `apiFetchEventHome`.
- [x] Add `apiFetchNearbyEvents`.
- [x] Add actions/reducer/saga/selectors for home and nearby.
- [x] Wire `app/(tabs)/events.tsx` sections to `eventHome`.
- [x] Wire map/list nearby section to `nearby`.
- [x] Preserve static fallback if `eventHome` is empty.
- [x] Wire bookmark, RSVP, and share actions on Events hub cards.
- [ ] Add loading skeleton or compact loader per section.
- [ ] Add section-level error handling.

Done when:

- The Events hub renders real backend data for home sections and nearby events while still looking identical.

### Phase 3: Event Detail Enrichment

Status: In progress

Todo:

- [x] Extend `SaiEventDetail` type.
- [x] Update `fetchEventDetailSuccess` to store rich detail.
- [x] Add bookmark/unbookmark service/actions/saga/reducer.
- [x] Wire bookmark button in `app/events/[id].tsx`.
- [x] Add reviews service/actions/saga/reducer.
- [x] Wire reviews section.
- [x] Add photos service/actions/saga/reducer.
- [x] Wire gallery/photos section.
- [x] Add share tracking service/action.
- [x] Add report service/action.
- [x] Replace organizer, attendees preview, guidelines, FAQ, similar events, and tags with backend data when present.

Done when:

- Event detail page is mostly backend-driven and no longer depends on static sections except for true empty placeholders.

### Phase 4: Calendar Product Integration

Status: Not started

Todo:

- [ ] Extend calendar response type to support `days` and `summary`.
- [ ] Update calendar saga mapper to preserve summary.
- [ ] Wire monthly overview and event type breakdown to backend summary.
- [ ] Add recommendations actions/saga/selectors.
- [ ] Wire recommended events.
- [ ] Add calendar preferences actions/saga/selectors.
- [ ] Wire notification preference toggles.
- [ ] Add community calendar actions/saga/selectors.
- [ ] Wire subscribe/unsubscribe buttons.
- [ ] Add calendar export helper for `GET /api/users/me/calendar.ics`.

Done when:

- Calendar screen uses backend for month events, summary, recommendations, preferences, and community calendars.

### Phase 5: My Events Organizer Tools

Status: In progress

Todo:

- [x] Add analytics type/service/actions/saga/selectors.
- [x] Load analytics for posted event cards.
- [ ] Add attendees type/service/actions/saga/selectors.
- [ ] Build or wire attendee management screen/modal.
- [x] Add check-in action.
- [x] Add event report action.
- [ ] Add post-event photos upload action.
- [x] Replace posted summary stats with real analytics when backend returns them.

Done when:

- Organizer can see real RSVP/check-in/view/comment/report data.

### Phase 6: Create/Edit Enhancements

Status: In progress

Todo:

- [x] Add title suggestions endpoint integration.
- [x] Wire AI suggestion chips to backend suggestions.
- [x] Add place search endpoint integration.
- [x] Replace local placeholder venue card with selected backend place.
- [x] Add event draft types/actions/saga/reducer.
- [x] Autosave draft with debounce.
- [x] Add publish draft flow.
- [x] Add recurrence type and validation.
- [x] Add recurrence payload to create/update if backend accepts it.
- [x] Phase 1 payload mode decided: upload media first, then JSON create/update with `bannerUrl`.
- [ ] Add optional multipart create/update only if product later chooses a one-request upload flow.

Done when:

- Create/edit supports backend title suggestions, place search, drafts, and optional recurrence without blocking basic event creation.

### Phase 7: Bookmark and Saved Events

Status: Not started

Todo:

- [x] Add `apiFetchEventBookmarks`.
- [x] Add bookmark list actions/reducer/saga/selectors.
- [x] Add bookmark/unbookmark optimistic update.
- [ ] Wire bookmark icons in hub cards, detail, calendar recommendations, and my events if shown.
- [ ] Update stats cards to use bookmark count.

Done when:

- Saved events are consistent across all Events screens.

### Phase 8: Hardcoded Data Removal

Status: Not started

Todo:

- [ ] Audit every `fallback`, `static`, `nearbyEvents`, `topOrganisers`, `trendingEvents`, `communities`, `weeklySchedule`, `communityStories` array in Events files.
- [ ] Remove fallback only after the matching backend selector is stable.
- [ ] Keep empty states where backend returns no data.
- [ ] Keep sample fallback only for development mode if useful.

Done when:

- Events pillar can run fully from backend data.

## File-Level Todo

### `services/events.ts`

- [ ] Add all Postman collection endpoint functions.
- [ ] Add typed params/payloads.
- [ ] Add form-data helper for event create/update/draft if required.
- [ ] Keep functions small and endpoint-specific.

### `store/events/types.ts`

- [ ] Add all new response/domain types.
- [ ] Extend `EventsState`.
- [ ] Add action constants for new APIs.

### `store/events/actions.ts`

- [ ] Add request/success/failure action creators per endpoint.
- [ ] Use consistent payload shape: `{ id, params }`, `{ id, payload }`.

### `store/events/reducer.ts`

- [ ] Add endpoint-specific loading/error state.
- [ ] Add maps keyed by event ID for reviews/photos/analytics/attendees.
- [ ] Add optimistic RSVP/bookmark updates.
- [ ] Preserve existing behavior.

### `store/events/saga.ts`

- [ ] Add workers for every new endpoint.
- [ ] Add normalizer helpers.
- [ ] Use `takeLatest` for fetches and `takeEvery` only if concurrent mutation makes sense.
- [ ] Handle validation before mutation.
- [ ] Keep error message extraction consistent.

### `store/events/selectors.ts`

- [ ] Add screen-friendly selectors.
- [ ] Avoid computing heavy data inside components if selector can handle it.
- [ ] Add selectors for event ID keyed maps.

### `app/(tabs)/events.tsx`

- [x] Wire event home.
- [x] Wire nearby.
- [x] Wire bookmark toggles.
- [x] Wire RSVP/share card actions.
- [x] Replace static sections progressively.

### `app/events/[id].tsx`

- [ ] Wire rich detail fields.
- [ ] Wire bookmark/share/report.
- [ ] Wire reviews/photos.
- [ ] Wire attendees preview.

### `screens/event-form-screen.tsx`

- [x] Wire suggestions.
- [x] Wire place search.
- [x] Wire drafts/autosave.
- [x] Add recurrence payload support.
- [ ] Keep basic create/edit working throughout.

### `app/events/calendar.tsx`

- [ ] Wire calendar summary.
- [ ] Wire recommendations.
- [ ] Wire preferences.
- [ ] Wire community calendars.
- [ ] Wire ICS export.

### `app/events/my-events.tsx`

- [x] Wire analytics.
- [ ] Add dedicated attendee/photo management drill-in from posted event cards.
- [x] Replace posted stats with analytics-backed values.

## Testing Plan

Manual smoke tests after every phase:

- [ ] Open Events tab.
- [ ] Filter by type.
- [ ] Search/discover event list.
- [ ] Open event detail.
- [ ] RSVP and cancel RSVP.
- [ ] Add comment.
- [ ] Create event with banner.
- [ ] Edit event.
- [ ] Cancel event.
- [ ] Open calendar.
- [ ] Open My Events.
- [ ] Open My RSVPs.
- [ ] Pull to refresh on list screens.
- [ ] Test logged-out auth failure path.
- [ ] Test network failure path.

Automated checks after code phases:

```sh
npx tsc --noEmit
npm run lint
```

Recommended future tests:

- Unit test normalizers.
- Unit test validation.
- Saga tests for success/failure.
- Component smoke test for empty/loading/error states.

## Risk Review

- Biggest risk: replacing fallback data too early and making the polished UI look empty. Mitigation: selector-level fallback until API is verified.
- Previously ambiguous create/update payload mode is resolved: frontend uses media upload first, then JSON with `bannerUrl`. Mitigation: keep this flow stable while adding draft or future multipart support.
- Biggest state risk: one global `loading` will cause unrelated screens to flicker. Mitigation: add endpoint-specific loading fields.
- Biggest product risk: organizer flows need analytics/attendee APIs before My Events feels real. Mitigation: implement those before removing posted-event fallback stats.
- Biggest auth risk: protected endpoints rely on `x-user-id`. Mitigation: verify SecureStore account is hydrated before calling protected APIs and keep 401 logout behavior predictable.

## Definition Of Done

The Events pillar API integration is complete when:

- No user-facing Events screen depends on hardcoded business data.
- All event APIs in the Postman collection have service functions.
- Redux module has typed actions/reducer/saga/selectors for each used endpoint.
- UI supports loading, empty, error, and success states per screen.
- Existing polished UI remains visually unchanged or improved.
- Create/edit/RSVP/comment/calendar flows pass manual smoke testing.
- `npx tsc --noEmit` and `npm run lint` pass.
