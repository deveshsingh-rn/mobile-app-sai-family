# Pillar 2 Events Todo

## Status

- Current pillar: Events
- Parent UI entry: `app/(tabs)/events.tsx`
- Current next step: Todo 8 completed, ready for Pillar 2 manual polish

## Todo List

### 1. Create File Structure

Status: Completed

- [x] Create `services/events.ts`
- [x] Create `store/events/types.ts`
- [x] Create `store/events/actions.ts`
- [x] Create `store/events/reducer.ts`
- [x] Create `store/events/saga.ts`
- [x] Create `store/events/selectors.ts`
- [x] Create `store/events/index.ts`
- [x] Connect `eventsReducer` to `store/root-reducer.ts`
- [x] Connect `eventsSaga` to `store/root-saga.ts`
- [x] Add route placeholder `app/events/[id].tsx`
- [x] Add route placeholder `app/events/create.tsx`
- [x] Add route placeholder `app/events/calendar.tsx`
- [x] Add route placeholder `app/events/my-events.tsx`
- [x] Add route placeholder `app/events/rsvps.tsx`

### 2. Implement Events API Service And Saga

Status: Completed

- [x] Normalize event API response shapes
- [x] Implement `GET /api/events`
- [x] Implement `GET /api/events/:id`
- [x] Implement `POST /api/events`
- [x] Implement `PATCH /api/events/:id`
- [x] Implement `DELETE /api/events/:id`
- [x] Implement `POST /api/events/:id/rsvp`
- [x] Implement `DELETE /api/events/:id/rsvp`
- [x] Implement `GET /api/users/me/rsvps`
- [x] Implement `GET /api/users/me/events`
- [x] Implement `GET /api/events/calendar?month=YYYY-MM`
- [x] Implement `GET /api/events/:id/comments`
- [x] Implement `POST /api/events/:id/comments`
- [x] Implement `POST /api/media/upload`

### 3. Frontend Validation

Status: Completed

- [x] Validate title min 3 characters
- [x] Validate description min 10 characters
- [x] Validate start and end date/time
- [x] Validate `endAt >= startAt`
- [x] Validate address min 5 characters
- [x] Validate latitude range `-90..90`
- [x] Validate longitude range `-180..180`
- [x] Validate event type enum
- [x] Validate comment content 1-1000 characters
- [x] Validate banner upload MIME type

### 4. Parent Events UI

Status: Completed

- [x] Upgrade `app/(tabs)/events.tsx` from placeholder to Events hub
- [x] Add discovery feed section
- [x] Add event type filters
- [x] Add quick actions for create, calendar, RSVPs, and my events
- [x] Add loading, empty, and error states

### 5. Event Screens

Status: Completed

- [x] Build event detail screen
- [x] Build create event screen
- [x] Build edit event flow
- [x] Build my RSVPs screen
- [x] Build my events screen
- [x] Build calendar screen
- [x] Build event comments section

### 6. RSVP And Comments

Status: Completed

- [x] Add RSVP button states
- [x] Add cancel RSVP behavior
- [x] Show RSVP count
- [x] Load event comments
- [x] Add comment input
- [x] Add comment submit loading and error states

### 7. Media Upload

Status: Completed

- [x] Add event banner picker
- [x] Upload banner through `POST /api/media/upload`
- [x] Use returned URL as `bannerUrl`
- [x] Add upload progress/loading state

### 8. Backend Testing

Status: Completed

- [x] Test event discovery
- [x] Test event create
- [x] Test event update
- [x] Test event delete
- [x] Test RSVP and cancel RSVP
- [x] Test my RSVPs
- [x] Test my events
- [x] Test calendar endpoint
- [x] Test comments
- [x] Test media upload

## Backend Validation Notes

- JSON endpoints need `Content-Type: application/json`
- Auth endpoints need `x-user-id`
- Event `type` must be one of `bhajan`, `pooja`, `seva`, `medical`, `satsang`, `darshan`, `general`
- `endAt` must not be before `startAt`
- Event comments must be non-empty and max 1000 characters
- Media upload accepts `file` or `files`, max 10 files, max 150MB each
